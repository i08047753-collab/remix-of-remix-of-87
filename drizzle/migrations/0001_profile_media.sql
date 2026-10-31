CREATE TABLE public.profile_media (
  user_id uuid PRIMARY KEY,
  avatar_path text,
  cover_path text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile_media TO anon, authenticated;
GRANT ALL ON public.profile_media TO service_role;
ALTER TABLE public.profile_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_media_public_read ON public.profile_media FOR SELECT TO anon, authenticated USING (true);