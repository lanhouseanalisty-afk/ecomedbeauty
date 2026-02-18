-- Refinando TOTALMENTE as políticas de RLS para legal_contracts
-- Isso garante que:
-- 1. Qualquer usuário autenticado possa SOLICITAR (INSERT)
-- 2. O solicitante veja sua própria solicitação (SELECT)
-- 3. Jurídico e Admins vejam TUDO (SELECT)

-- Habilitar RLS (garantia)
ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas para evitar conflito
DROP POLICY IF EXISTS "Sector and Requester Access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Legal and Admin Full Access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Legal and Admin Update Access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Users can insert contracts" ON public.legal_contracts;
DROP POLICY IF EXISTS "Admin full access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Legal manager access" ON public.legal_contracts;

-- 1. Permissão de INSERÇÃO (Qualquer um logado pode criar)
CREATE POLICY "legal_contracts_insert_policy" ON public.legal_contracts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Permissão de SELEÇÃO (Visualização)
CREATE POLICY "legal_contracts_select_policy" ON public.legal_contracts
FOR SELECT USING (
    -- Admins veem tudo
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    -- Jurídico vê tudo
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() 
        AND (d.code ILIKE 'juridico' OR d.code ILIKE 'JUR')
    ) OR
    -- O próprio dono (solicitante) vê
    auth.uid() = responsible_id OR
    -- Pessoas do mesmo setor veem
    EXISTS (
        SELECT 1 FROM public.department_members dm
        WHERE dm.user_id = auth.uid() 
        AND dm.department_id = legal_contracts.department_id
    )
);

-- 3. Permissão de UPDATE (Edição)
CREATE POLICY "legal_contracts_update_policy" ON public.legal_contracts
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

-- 4. Permissão de DELETE
CREATE POLICY "legal_contracts_delete_policy" ON public.legal_contracts
FOR DELETE USING (
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
