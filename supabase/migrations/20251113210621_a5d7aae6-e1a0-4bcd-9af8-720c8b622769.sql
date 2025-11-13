-- Create page_views table for tracking website statistics
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url text NOT NULL,
  city_name text,
  country_code text,
  user_agent text,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Only admins and moderators can view page views
CREATE POLICY "Admins and moderators can view page views"
ON public.page_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Anyone can insert page views (for tracking)
CREATE POLICY "Anyone can insert page views"
ON public.page_views
FOR INSERT
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_page_url ON public.page_views(page_url);
CREATE INDEX idx_page_views_city_name ON public.page_views(city_name);