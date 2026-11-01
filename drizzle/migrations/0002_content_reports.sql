CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_label text NOT NULL,
  target_username text,
  reason text NOT NULL,
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_reports_read ON public.content_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));