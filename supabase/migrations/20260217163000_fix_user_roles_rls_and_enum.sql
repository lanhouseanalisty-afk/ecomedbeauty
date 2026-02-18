-- 1. Garantir que a coluna permissions existe (caso a migração anterior não tenha rodado)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_roles' AND column_name='permissions') THEN
        ALTER TABLE public.user_roles ADD COLUMN permissions TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- 2. Expandir o enum app_role com os valores usados na UI
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'manager') THEN
    ALTER TYPE public.app_role ADD VALUE 'manager';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'tech_digital') THEN
    ALTER TYPE public.app_role ADD VALUE 'tech_digital';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'analyst') THEN
    ALTER TYPE public.app_role ADD VALUE 'analyst';
  END IF;
END$$;

-- 3. Corrigir RLS para permitir que Admins gerenciem roles de outros usuários
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- 4. Garantir que o próprio usuário ainda possa ver suas roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
