CREATE TABLE public.dm_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  read_a timestamptz NOT NULL DEFAULT now(),
  read_b timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_conversations_order CHECK (user_a < user_b),
  CONSTRAINT dm_conversations_pair UNIQUE (user_a, user_b)
);
CREATE INDEX dm_conversations_a ON public.dm_conversations (user_a, last_message_at DESC);
CREATE INDEX dm_conversations_b ON public.dm_conversations (user_b, last_message_at DESC);
GRANT SELECT ON public.dm_conversations TO authenticated;
GRANT ALL ON public.dm_conversations TO service_role;
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY dm_conversation_participants ON public.dm_conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE TABLE public.dm_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.dm_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  client_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dm_messages_body CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  CONSTRAINT dm_messages_idempotent UNIQUE (sender_id, client_id)
);
CREATE INDEX dm_messages_conversation ON public.dm_messages (conversation_id, created_at DESC, id DESC);
CREATE INDEX dm_messages_sender_time ON public.dm_messages (sender_id, created_at DESC);
GRANT SELECT ON public.dm_messages TO authenticated;
GRANT ALL ON public.dm_messages TO service_role;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY dm_message_participants ON public.dm_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.dm_conversations c WHERE c.id = conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)));

CREATE OR REPLACE FUNCTION public.dm_start(p_user uuid, p_other uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_a uuid := least(p_user, p_other); v_b uuid := greatest(p_user, p_other); v_id uuid;
BEGIN
  IF p_user = p_other THEN RAISE EXCEPTION 'DM_SELF'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.account_usernames WHERE user_id = p_other) THEN RAISE EXCEPTION 'DM_NO_USER'; END IF;
  SELECT id INTO v_id FROM public.dm_conversations WHERE user_a = v_a AND user_b = v_b;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  IF (SELECT count(*) FROM public.dm_conversations WHERE (user_a = p_user OR user_b = p_user) AND created_at > now() - interval '1 hour') >= 30 THEN
    RAISE EXCEPTION 'DM_RATE_LIMIT';
  END IF;
  INSERT INTO public.dm_conversations (user_a, user_b) VALUES (v_a, v_b)
    ON CONFLICT (user_a, user_b) DO UPDATE SET user_a = EXCLUDED.user_a RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.dm_send(p_user uuid, p_conversation uuid, p_client uuid, p_body text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_conv public.dm_conversations; v_id uuid;
BEGIN
  SELECT * INTO v_conv FROM public.dm_conversations WHERE id = p_conversation FOR UPDATE;
  IF v_conv.id IS NULL OR (v_conv.user_a <> p_user AND v_conv.user_b <> p_user) THEN RAISE EXCEPTION 'DM_FORBIDDEN'; END IF;
  SELECT id INTO v_id FROM public.dm_messages WHERE sender_id = p_user AND client_id = p_client;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  IF (SELECT count(*) FROM public.dm_messages WHERE sender_id = p_user AND created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'DM_RATE_LIMIT';
  END IF;
  INSERT INTO public.dm_messages (conversation_id, sender_id, client_id, body)
    VALUES (p_conversation, p_user, p_client, btrim(p_body)) RETURNING id INTO v_id;
  UPDATE public.dm_conversations SET last_message_at = now(),
    read_a = CASE WHEN user_a = p_user THEN now() ELSE read_a END,
    read_b = CASE WHEN user_b = p_user THEN now() ELSE read_b END
  WHERE id = p_conversation;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.dm_mark_read(p_user uuid, p_conversation uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.dm_conversations SET
    read_a = CASE WHEN user_a = p_user THEN now() ELSE read_a END,
    read_b = CASE WHEN user_b = p_user THEN now() ELSE read_b END
  WHERE id = p_conversation AND (user_a = p_user OR user_b = p_user);
$$;

CREATE OR REPLACE FUNCTION public.dm_inbox(p_user uuid)
RETURNS TABLE (id uuid, other_id uuid, other_username text, last_body text, last_sender uuid, last_at timestamptz, unread integer, other_read_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id,
    CASE WHEN c.user_a = p_user THEN c.user_b ELSE c.user_a END,
    u.username,
    m.body, m.sender_id, c.last_message_at,
    (SELECT count(*)::int FROM public.dm_messages x WHERE x.conversation_id = c.id AND x.sender_id <> p_user
       AND x.created_at > CASE WHEN c.user_a = p_user THEN c.read_a ELSE c.read_b END),
    CASE WHEN c.user_a = p_user THEN c.read_b ELSE c.read_a END
  FROM public.dm_conversations c
  LEFT JOIN public.account_usernames u ON u.user_id = CASE WHEN c.user_a = p_user THEN c.user_b ELSE c.user_a END
  LEFT JOIN LATERAL (SELECT body, sender_id FROM public.dm_messages WHERE conversation_id = c.id ORDER BY created_at DESC, id DESC LIMIT 1) m ON true
  WHERE c.user_a = p_user OR c.user_b = p_user
  ORDER BY c.last_message_at DESC
  LIMIT 100;
$$;

REVOKE EXECUTE ON FUNCTION public.dm_start(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dm_send(uuid, uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dm_mark_read(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dm_inbox(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dm_start(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.dm_send(uuid, uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.dm_mark_read(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.dm_inbox(uuid) TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;