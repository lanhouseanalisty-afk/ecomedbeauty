-- =========================================================
-- ULTIMATE LEGAL FIX: SCHEMA, COLUMNS AND RLS
-- =========================================================

-- 1. ADICIONAR COLUNAS FALTANTES (Garantido)
ALTER TABLE public.legal_contracts ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.legal_contracts ADD COLUMN IF NOT EXISTS sap_request_id TEXT;
ALTER TABLE public.legal_contracts ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- Sincronizar dados antigos (se houver)
UPDATE public.legal_contracts SET description = terms_summary WHERE description IS NULL;
UPDATE public.legal_contracts SET sap_request_id = payment_terms WHERE sap_request_id IS NULL AND payment_terms LIKE 'REQ-%';

-- 2. LIMPAR POLÍTICAS ANTIGAS (Remover qualquer lixo que bloqueie a visão)
DROP POLICY IF EXISTS "Sector and Requester Access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Legal and Admin Full Access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Legal and Admin Update Access" ON public.legal_contracts;
DROP POLICY IF EXISTS "Users can update contracts" ON public.legal_contracts;
DROP POLICY IF EXISTS "Users can insert contracts" ON public.legal_contracts;
DROP POLICY IF EXISTS "legal_contracts_insert_policy" ON public.legal_contracts;
DROP POLICY IF EXISTS "legal_contracts_select_policy" ON public.legal_contracts;
DROP POLICY IF EXISTS "legal_contracts_update_policy" ON public.legal_contracts;
DROP POLICY IF EXISTS "legal_contracts_delete_policy" ON public.legal_contracts;

-- 3. CRIAR NOVAS POLÍTICAS À PROVA DE BALAS (Evitando auth.users)

-- INSERT: Qualquer pessoa autenticada pode solicitar
CREATE POLICY "legal_contracts_insert" ON public.legal_contracts
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SELECT: Visibilidade total para Jurídico/Admin e restrita para donos/setor
CREATE POLICY "legal_contracts_select" ON public.legal_contracts
FOR SELECT USING (
    -- Admins (via user_roles para evitar erro de permissão no auth.users)
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    -- Membros do Jurídico (Case Insensitive: JUR ou juridico)
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() 
        AND (d.code ILIKE 'juridico' OR d.code ILIKE 'JUR')
    ) OR
    -- O próprio solicitante
    auth.uid() = responsible_id OR
    -- Pessoas do mesmo setor (se a coluna existir e estiver preenchida)
    (department_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.department_members dm
        WHERE dm.user_id = auth.uid() AND dm.department_id = legal_contracts.department_id
    ))
);

-- UPDATE: Jurídico, Admins e Donos (Donos só se estiver em rascunho/pendente)
CREATE POLICY "legal_contracts_update" ON public.legal_contracts
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
        SELECT 1 FROM public.department_members dm
        JOIN public.departments d ON dm.department_id = d.id
        WHERE dm.user_id = auth.uid() 
        AND (d.code ILIKE 'juridico' OR d.code ILIKE 'JUR')
    ) OR
    auth.uid() = responsible_id
);

-- DELETE: Apenas Admins e Jurídico
CREATE POLICY "legal_contracts_delete" ON public.legal_contracts
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

-- 4. GARANTIR QUE RLS ESTÁ ATIVO
ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;
