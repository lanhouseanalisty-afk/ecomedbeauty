-- Refinando as políticas de RLS para legal_contracts
-- Garantindo que Jurídico e Admins vejam tudo independente de Case Sensitivity

DROP POLICY IF EXISTS "Sector and Requester Access" ON public.legal_contracts;

CREATE POLICY "Legal and Admin Full Access" ON public.legal_contracts
FOR SELECT USING (
    -- 1. O próprio solicitante
    auth.uid() = responsible_id OR 
    
    -- 2. Membros do Jurídico (Case Insensitive)
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() 
        AND (d.code ILIKE 'juridico' OR d.code ILIKE 'JUR')
    ) OR
    
    -- 3. Admins (Via tabela user_roles)
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) OR

    -- 4. Membros do mesmo setor (Case Insensitive)
    EXISTS (
        SELECT 1 FROM public.department_members dm
        WHERE dm.user_id = auth.uid() 
        AND dm.department_id = legal_contracts.department_id
    )
);

-- Garantir acesso para INSERT e UPDATE também para o Jurídico
DROP POLICY IF EXISTS "Users can update contracts" ON public.legal_contracts;
CREATE POLICY "Legal and Admin Update Access" ON public.legal_contracts
FOR UPDATE USING (
    auth.uid() = responsible_id OR 
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() 
        AND (d.code ILIKE 'juridico' OR d.code ILIKE 'JUR')
    )
);
