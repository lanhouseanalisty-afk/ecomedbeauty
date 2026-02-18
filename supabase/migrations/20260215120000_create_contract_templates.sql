-- Create Contract Templates Table
CREATE TABLE IF NOT EXISTS public.contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL, -- The contract text with {{variables}}
    category TEXT DEFAULT 'Geral',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view active templates (to use them)
CREATE POLICY "Everyone can view active templates" ON public.contract_templates
    FOR SELECT USING (active = true);

-- Only Legal/Admin can insert/update/delete
-- Assuming 'legal' department check or 'admin' role
CREATE POLICY "Legal and Admin can manage templates" ON public.contract_templates
    FOR ALL USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'legal_manager')
        ) OR
        EXISTS (
            SELECT 1 FROM public.department_members dm
            JOIN public.departments d ON dm.department_id = d.id
            WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_contract_templates_updated_at
    BEFORE UPDATE ON public.contract_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
