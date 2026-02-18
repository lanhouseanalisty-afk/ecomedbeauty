-- Ensure contract_comments table exists
-- Dropping first to ensure we get the correct FK
DROP TABLE IF EXISTS public.contract_comments;

CREATE TABLE IF NOT EXISTS public.contract_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.legal_contracts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contract_comments ENABLE ROW LEVEL SECURITY;

-- Re-create Policies
CREATE POLICY "View comments" ON public.contract_comments
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

CREATE POLICY "Insert comments" ON public.contract_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions explicitly
GRANT ALL ON public.contract_comments TO authenticated;
GRANT ALL ON public.contract_comments TO service_role;
