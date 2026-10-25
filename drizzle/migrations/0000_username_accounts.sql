CREATE TABLE public.account_usernames (
  user_id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_usernames_format CHECK (username ~ '^[a-z0-9_]{3,20}$')
);
GRANT SELECT ON public.account_usernames TO authenticated;
GRANT ALL ON public.account_usernames TO service_role;
ALTER TABLE public.account_usernames ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_username ON public.account_usernames FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.auth_rate_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  key_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_rate_events_lookup ON public.auth_rate_events (kind, key_hash, created_at DESC);
GRANT ALL ON public.auth_rate_events TO service_role;
ALTER TABLE public.auth_rate_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.auth_rate_allowed(p_kind text, p_key text, p_limit integer, p_window_seconds integer)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) < p_limit FROM public.auth_rate_events
  WHERE kind = p_kind AND key_hash = p_key AND created_at > now() - make_interval(secs => p_window_seconds)
$$;

CREATE OR REPLACE FUNCTION public.auth_rate_record(p_kind text, p_key text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.auth_rate_events WHERE kind = p_kind AND key_hash = p_key AND created_at < now() - interval '1 day';
  INSERT INTO public.auth_rate_events (kind, key_hash) VALUES (p_kind, p_key);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.auth_rate_allowed(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auth_rate_record(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auth_rate_allowed(text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.auth_rate_record(text, text) TO service_role;