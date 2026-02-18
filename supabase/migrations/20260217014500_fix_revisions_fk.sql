-- Drop table if exists to recreate with correct FK and Schema
DROP TABLE IF EXISTS public.contract_revisions;

-- Create Contract Revisions Table with correct FK to legal_contracts and content column
CREATE TABLE IF NOT EXISTS public.contract_revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.legal_contracts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT, -- Optional now
    content TEXT, -- Snapshot of the contract text
    uploaded_by UUID REFERENCES auth.users(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contract_revisions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "View revisions" ON public.contract_revisions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.legal_contracts c WHERE c.id = contract_id AND (
            c.responsible_id = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.department_members dm
                JOIN public.departments d ON dm.department_id = d.id
                WHERE dm.user_id = auth.uid() OR d.code = 'juridico'
            )
        ))
    );

CREATE POLICY "Insert revisions" ON public.contract_revisions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (SELECT 1 FROM public.legal_contracts c WHERE c.id = contract_id AND (
             c.responsible_id = auth.uid() OR
             EXISTS (
                SELECT 1 FROM public.department_members dm
                JOIN public.departments d ON dm.department_id = d.id
                WHERE dm.user_id = auth.uid() OR d.code = 'juridico'
            )
        ))
    );
