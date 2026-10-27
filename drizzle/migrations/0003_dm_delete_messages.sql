ALTER TABLE public.dm_messages ADD COLUMN deleted_at timestamptz;
ALTER TABLE public.dm_messages DROP CONSTRAINT dm_messages_body;
ALTER TABLE public.dm_messages ADD CONSTRAINT dm_messages_body CHECK (
  (deleted_at IS NULL AND char_length(btrim(body)) BETWEEN 1 AND 2000) OR (deleted_at IS NOT NULL AND body = '')
);

CREATE TABLE public.dm_hidden_messages (
  user_id uuid NOT NULL,
  message_id uuid NOT NULL REFERENCES public.dm_messages(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, message_id)
);
GRANT SELECT ON public.dm_hidden_messages TO authenticated;
GRANT ALL ON public.dm_hidden_messages TO service_role;
ALTER TABLE public.dm_hidden_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY dm_hidden_own ON public.dm_hidden_messages FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY dm_message_participants ON public.dm_messages;
CREATE POLICY dm_message_participants ON public.dm_messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.dm_conversations c WHERE c.id = conversation_id AND (auth.uid() = c.user_a OR auth.uid() = c.user_b))
    AND NOT EXISTS (SELECT 1 FROM public.dm_hidden_messages h WHERE h.message_id = id AND h.user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.dm_delete(p_user uuid, p_message uuid, p_scope text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_msg public.dm_messages;
BEGIN
  IF p_scope NOT IN ('me', 'everyone') THEN RAISE EXCEPTION 'DM_BAD_SCOPE'; END IF;
  SELECT m.* INTO v_msg FROM public.dm_messages m
    JOIN public.dm_conversations c ON c.id = m.conversation_id
    WHERE m.id = p_message AND (c.user_a = p_user OR c.user_b = p_user)
    FOR UPDATE OF m;
  IF v_msg.id IS NULL THEN RAISE EXCEPTION 'DM_FORBIDDEN'; END IF;
  IF p_scope = 'me' THEN
    INSERT INTO public.dm_hidden_messages (user_id, message_id) VALUES (p_user, p_message) ON CONFLICT DO NOTHING;
    RETURN;
  END IF;
  IF v_msg.sender_id <> p_user THEN RAISE EXCEPTION 'DM_NOT_OWNER'; END IF;
  IF v_msg.deleted_at IS NOT NULL THEN RETURN; END IF;
  UPDATE public.dm_messages SET body = '', deleted_at = now() WHERE id = p_message;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.dm_delete(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dm_delete(uuid, uuid, text) TO service_role;

DROP FUNCTION public.dm_inbox(uuid);
CREATE FUNCTION public.dm_inbox(p_user uuid)
RETURNS TABLE (id uuid, other_id uuid, other_username text, last_body text, last_sender uuid, last_at timestamptz, unread integer, other_read_at timestamptz, last_deleted boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id,
    CASE WHEN c.user_a = p_user THEN c.user_b ELSE c.user_a END,
    u.username,
    m.body, m.sender_id, c.last_message_at,
    (SELECT count(*)::int FROM public.dm_messages x WHERE x.conversation_id = c.id AND x.sender_id <> p_user AND x.deleted_at IS NULL
       AND x.created_at > CASE WHEN c.user_a = p_user THEN c.read_a ELSE c.read_b END
       AND NOT EXISTS (SELECT 1 FROM public.dm_hidden_messages h WHERE h.message_id = x.id AND h.user_id = p_user)),
    CASE WHEN c.user_a = p_user THEN c.read_b ELSE c.read_a END,
    COALESCE(m.deleted_at IS NOT NULL, false)
  FROM public.dm_conversations c
  LEFT JOIN public.account_usernames u ON u.user_id = CASE WHEN c.user_a = p_user THEN c.user_b ELSE c.user_a END
  LEFT JOIN LATERAL (SELECT y.body, y.sender_id, y.deleted_at FROM public.dm_messages y WHERE y.conversation_id = c.id
      AND NOT EXISTS (SELECT 1 FROM public.dm_hidden_messages h WHERE h.message_id = y.id AND h.user_id = p_user)
      ORDER BY y.created_at DESC, y.id DESC LIMIT 1) m ON true
  WHERE c.user_a = p_user OR c.user_b = p_user
  ORDER BY c.last_message_at DESC
  LIMIT 100;
$$;
REVOKE EXECUTE ON FUNCTION public.dm_inbox(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.dm_inbox(uuid) TO service_role;