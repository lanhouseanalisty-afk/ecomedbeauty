-- Create site_settings table for CMS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id integer PRIMARY KEY DEFAULT 1,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row_check CHECK (id = 1)
);
-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- Allow public read access (anyone can see the site content)
CREATE POLICY "Public can view site settings" ON public.site_settings FOR
SELECT USING (true);
-- Allow authenticated users to update the site settings
CREATE POLICY "Authenticated users can update site settings" ON public.site_settings FOR
UPDATE USING (auth.role() = 'authenticated');
-- Allow authenticated users to insert the initial row
CREATE POLICY "Authenticated users can insert site settings" ON public.site_settings FOR
INSERT WITH CHECK (auth.role() = 'authenticated');