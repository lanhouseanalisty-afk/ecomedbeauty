-- Create Contracts Table
-- Ensure Department Infrastructure Exists (Safety Check)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  manager_email TEXT,
  manager_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.department_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, user_id)
);

-- Enable RLS for these tables if they were just created
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;

-- Create Policies if they don't exist (using DO block to avoid errors if they do)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'departments' AND policyname = 'Everyone can view departments'
    ) THEN
        CREATE POLICY "Everyone can view departments" ON public.departments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'department_members' AND policyname = 'Users can view their departments'
    ) THEN
        CREATE POLICY "Users can view their departments" ON public.department_members FOR SELECT 
        USING (auth.uid() = user_id OR EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
        ));
    END IF;
END $$;


-- Create Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'legal_review', 'signing', 'active', 'expired', 'terminated')),
    requester_id UUID REFERENCES auth.users(id),
    responsible_legal_id UUID REFERENCES auth.users(id),
    sap_request_id TEXT, -- Link to SAP
    start_date DATE,
    end_date DATE,
    renewal_alert_days INTEGER DEFAULT 60,
    value NUMERIC(15, 2),
    currency TEXT DEFAULT 'BRL',
    payment_terms TEXT,
    docusign_id TEXT, -- Link to DocuSign
    current_version_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Contract Revisions Table (Versioning)
CREATE TABLE IF NOT EXISTS public.contract_revisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Contract Comments Table (Communication)
CREATE TABLE IF NOT EXISTS public.contract_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- If true, only legal team sees it (optional feature)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests or if they are legal team" ON public.contracts
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() = responsible_legal_id OR
        EXISTS (
            SELECT 1 FROM public.department_members dm
            JOIN public.departments d ON dm.department_id = d.id
            WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
        )
    );

CREATE POLICY "Users can insert contracts" ON public.contracts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update contracts" ON public.contracts
    FOR UPDATE USING (
        auth.uid() = requester_id OR 
        auth.uid() = responsible_legal_id OR
        EXISTS (
            SELECT 1 FROM public.department_members dm
            JOIN public.departments d ON dm.department_id = d.id
            WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
        )
    );

-- Revisions
ALTER TABLE public.contract_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View revisions" ON public.contract_revisions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id AND (
            c.requester_id = auth.uid() OR 
            c.responsible_legal_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.department_members dm
                JOIN public.departments d ON dm.department_id = d.id
                WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
            )
        ))
    );

CREATE POLICY "Insert revisions" ON public.contract_revisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Comments
ALTER TABLE public.contract_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View comments" ON public.contract_comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.contracts c WHERE c.id = contract_id AND (
            c.requester_id = auth.uid() OR 
            c.responsible_legal_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.department_members dm
                JOIN public.departments d ON dm.department_id = d.id
                WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
            )
        ))
    );

CREATE POLICY "Insert comments" ON public.contract_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
