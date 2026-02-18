-- Enable RLS on legal_contracts if not already enabled
ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;

-- Drop potentially conflicting or old policies
DROP POLICY IF EXISTS "Users can view their own requests or if they are legal team" ON public.legal_contracts;
DROP POLICY IF EXISTS "Sector Access Only" ON public.legal_contracts;
DROP POLICY IF EXISTS "Sector and Requester Access" ON public.legal_contracts;

-- Create the Sector/Requester Access Policy
CREATE POLICY "Sector and Requester Access" ON public.legal_contracts
FOR SELECT USING (
    -- 1. Requester (Owner)
    auth.uid() = responsible_id OR 
    
    -- 2. Legal Team (Global Access)
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
    ) OR
    
    -- 3. Users from the SAME Sector (Department) as the Contract
    (
        department_id IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM public.department_members dm
            WHERE dm.user_id = auth.uid() AND dm.department_id = legal_contracts.department_id
        )
    ) OR

    -- 4. Admins (Safety net, though usually handled by separate Admin policy)
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() AND (raw_user_meta_data->>'role')::text = 'admin'
    )
);

-- Ensure Insert/Update/Delete policies exist if needed, usually permissive for creators or specific roles
-- For now, focusing on SELECT restriction.
