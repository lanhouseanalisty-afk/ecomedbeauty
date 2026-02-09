
-- Create scientific_presentations table
CREATE TABLE IF NOT EXISTS public.scientific_presentations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Geral',
    speaker TEXT,
    presentation_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES auth.users(id),
    active BOOLEAN DEFAULT true
);

-- RLS
ALTER TABLE public.scientific_presentations ENABLE ROW LEVEL SECURITY;

-- Everyone can read active presentations
CREATE POLICY "Everyone can read presentations"
ON public.scientific_presentations FOR SELECT
USING (active = true);

-- Admins and Scientific team members can manage
CREATE POLICY "Admins and Scientific team can manage presentations"
ON public.scientific_presentations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'scientific_manager', 'tech')
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_scientific_presentations_updated_at
BEFORE UPDATE ON public.scientific_presentations
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Storage Bucket for scientific files
-- Note: This usually needs to be done via SQL if using extensions or manual setup, 
-- but we'll include the SQL version for documentation/manual execution.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('scientific-files', 'scientific-files', true);

-- Storage Policies for scientific-files
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'scientific-files');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scientific-files' AND (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'tech'))));
