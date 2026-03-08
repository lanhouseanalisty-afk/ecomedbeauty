-- Migration to create the limpeza_meetings table
CREATE TABLE IF NOT EXISTS public.limpeza_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    special_requests TEXT,
    department_id UUID REFERENCES public.departments(id),
    -- Optional: if tied to a specific requesting department
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Enable RLS
ALTER TABLE public.limpeza_meetings ENABLE ROW LEVEL SECURITY;
-- Policies for Limpeza Meetings
-- 1. Everyone can read meetings (to see schedules)
DROP POLICY IF EXISTS "Everyone can read meetings" ON public.limpeza_meetings;
CREATE POLICY "Everyone can read meetings" ON public.limpeza_meetings FOR
SELECT USING (true);
-- 2. Authenticated users can insert meetings
DROP POLICY IF EXISTS "Authenticated users can insert meetings" ON public.limpeza_meetings;
CREATE POLICY "Authenticated users can insert meetings" ON public.limpeza_meetings FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
-- 3. Users can update their own meetings OR users with manage_limpeza can update any
DROP POLICY IF EXISTS "Users can update meetings" ON public.limpeza_meetings;
CREATE POLICY "Users can update meetings" ON public.limpeza_meetings FOR
UPDATE USING (
        auth.uid() = created_by
        OR EXISTS (
            SELECT 1
            FROM user_roles
            WHERE user_roles.user_id = auth.uid()
                AND role IN ('admin', 'manager')
        )
    );
-- 4. Users can delete their own meetings OR users with manage_limpeza can delete any
DROP POLICY IF EXISTS "Users can delete meetings" ON public.limpeza_meetings;
CREATE POLICY "Users can delete meetings" ON public.limpeza_meetings FOR DELETE USING (
    auth.uid() = created_by
    OR EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_roles.user_id = auth.uid()
            AND role IN ('admin', 'manager')
    )
);