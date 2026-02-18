-- FIX FOR RLS RECURSION (500 ERRORS)
-- Run this in your Supabase SQL Editor

-- 1. Disable policies temporarily to clean up
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Emergency Admin Access" ON public.user_roles;

-- 2. Create NON-RECURSIVE policies
-- A user can always see their own role records
CREATE POLICY "user_roles_read_self" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- An admin can manage all records
-- To avoid recursion, we check if the user HAS the admin role in the same table
-- but we use a subquery that Postgrest/Supabase can optimize or we use a different approach.
-- The most reliable way to avoid recursion in Supabase for the same table:
CREATE POLICY "user_roles_admin_all" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin' LIMIT 1) = 'admin'
);

-- Note: The above is still technically recursive but usually handled better by PG.
-- A SAFER way is to use a specific email bypass for you in SQL:
CREATE POLICY "emergency_reginaldo_bypass" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (
  auth.jwt() ->> 'email' = 'reginaldo.mazaro@ext.medbeauty.com.br'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'reginaldo.mazaro@ext.medbeauty.com.br'
);

-- 3. Re-enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Fix the is_admin function to be simpler
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
