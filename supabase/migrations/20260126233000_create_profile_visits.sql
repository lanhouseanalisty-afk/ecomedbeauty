-- Create profile_visits table
CREATE TABLE IF NOT EXISTS public.profile_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES auth.users(id),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can see visits" ON public.profile_visits
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can record visits" ON public.profile_visits
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
