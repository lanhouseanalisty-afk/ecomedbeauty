-- ==========================================
-- SCRIPT DE CORREÇÃO FINAL - GESTÃO DE USUÁRIOS
-- Execute este script no SQL Editor do Supabase
-- ==========================================

-- 1. Expandir o Enum de Roles (Se já existir, ele pula os erros)
DO $$ 
BEGIN
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'manager';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'tech_digital';
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'analyst';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Garantir coluna de Permissões e Data de Atualização
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Criar ou Atualizar a política de RLS (Definitiva)
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Configurar Gatilho de Atualização Automática
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
