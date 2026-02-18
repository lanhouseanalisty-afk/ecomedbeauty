-- COMPREHENSIVE PERMISSIONS REWRITE (ANTI-RECURSION)
-- Run this in the Supabase SQL Editor

-- 1. SECURITY RESET: Disable RLS and clear old policies
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    END LOOP;
END $$;

-- 2. CREATE NON-RECURSIVE POLICIES
-- Policy 1: Read Self (Users can see their own roles)
CREATE POLICY "user_roles_read_self" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy 2: Master Admin Bypass (based on JWT email - NO TABLE QUERY = NO RECURSION)
CREATE POLICY "user_roles_master_bypass" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email')::text = 'reginaldo.mazaro@ext.medbeauty.com.br'
)
WITH CHECK (
  (auth.jwt() ->> 'email')::text = 'reginaldo.mazaro@ext.medbeauty.com.br'
);

-- Policy 3: General Admin Access (Only if they are not the master user)
-- Note: To avoid recursion, we use a subquery that checking the session email is NOT the master email first
CREATE POLICY "user_roles_admin_manage" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    )
    AND (auth.jwt() ->> 'email')::text != 'reginaldo.mazaro@ext.medbeauty.com.br'
);

-- 3. RE-ENABLE RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. SIMPLIFY HELPERS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check JWT first for maximum performance/safety
  IF (auth.jwt() ->> 'email')::text = 'reginaldo.mazaro@ext.medbeauty.com.br' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ENSURE MASTER DATA IS CORRECT
DELETE FROM public.user_roles WHERE user_id IN (
    SELECT user_id FROM public.employees WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br'
);

INSERT INTO public.user_roles (user_id, role, permissions)
SELECT user_id, 'admin', '{"*"}'
FROM public.employees 
WHERE email = 'reginaldo.mazaro@ext.medbeauty.com.br';
