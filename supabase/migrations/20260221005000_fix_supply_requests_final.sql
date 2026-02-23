-- PASSO 1: Rodar apenas este bloco e clicar em "RUN"
-- Isso expande o Enum e faz o "commit" dos novos valores.
ALTER TYPE public.app_role
ADD VALUE IF NOT EXISTS 'marketing_manager';
ALTER TYPE public.app_role
ADD VALUE IF NOT EXISTS 'logistica_manager';
ALTER TYPE public.app_role
ADD VALUE IF NOT EXISTS 'logistica_operator';
-- APÓS RODAR O PASSO 1, apague o código acima e rode o PASSO 2 abaixo:
-- PASSO 2: Rodar este bloco para configurar as políticas e colunas
-- 1. Garantir que a coluna sector existe
ALTER TABLE marketing_requests
ADD COLUMN IF NOT EXISTS sector TEXT DEFAULT 'marketing';
-- 2. Remover políticas conflitantes
DROP POLICY IF EXISTS "Users can create requests" ON marketing_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON marketing_requests;
DROP POLICY IF EXISTS "Marketing managers can view all" ON marketing_requests;
DROP POLICY IF EXISTS "Marketing managers can update" ON marketing_requests;
DROP POLICY IF EXISTS "Approvers can manage assigned requests" ON marketing_requests;
DROP POLICY IF EXISTS "Logistics and Admin can view all" ON marketing_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."marketing_requests";
DROP POLICY IF EXISTS "Enable select for users based on created_by" ON "public"."marketing_requests";
DROP POLICY IF EXISTS "Enable all for managers" ON "public"."marketing_requests";
-- 3. Criar políticas robustas
CREATE POLICY "Enable insert for authenticated users only" ON "public"."marketing_requests" FOR
INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Enable select for users based on created_by" ON "public"."marketing_requests" FOR
SELECT USING (auth.uid() = created_by);
CREATE POLICY "Enable all for managers" ON "public"."marketing_requests" FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = auth.uid()
            AND (
                role::text IN (
                    'admin',
                    'marketing_manager',
                    'logistica_manager',
                    'logistica_operator'
                )
            )
    )
);
-- 4. Ajustar dados legados
UPDATE marketing_requests
SET sector = 'marketing'
WHERE sector IS NULL;