-- Drop the old policy to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own requests or if they are legal team" ON public.contracts;
DROP POLICY IF EXISTS "Sector Access Only" ON public.contracts; -- In case it was partially created

-- Create the new, more inclusive policy
CREATE POLICY "Users can view their own requests, sector requests or if they are legal team" ON public.contracts
FOR SELECT USING (
    auth.uid() = requester_id OR 
    auth.uid() = responsible_legal_id OR
    -- Member of Legal
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() AND d.code = 'juridico'
    ) OR
    -- Member of the Contract's Department (Sector)
    EXISTS (
        SELECT 1 FROM public.department_members dm
        WHERE dm.user_id = auth.uid() AND dm.department_id = contracts.department_id
    )
);

-- Ensure RLS is enabled
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
