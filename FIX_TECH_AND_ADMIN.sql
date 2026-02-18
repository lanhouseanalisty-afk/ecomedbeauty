
-- FIX RECURSION AND TECH ASSETS RLS

-- 1. FIX is_admin RECURSION
-- Uses JWT email for fast bypass, avoiding user_roles query loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check JWT first for maximum performance/safety (Master Admin)
  IF (auth.jwt() ->> 'email')::text = 'reginaldo.mazaro@ext.medbeauty.com.br' THEN
    RETURN true;
  END IF;

  -- Standard Admin Check (Optimized)
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. FIX TECH ASSETS RLS (Move from 'logistica' to 'ti')
-- Ensure 'ti' module slug exists for Technology departments
UPDATE departments SET module_slug = 'ti' WHERE name ILIKE '%TI%' OR name ILIKE '%Tecnologia%';

ALTER TABLE tech_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sector edit access" ON tech_assets;
DROP POLICY IF EXISTS "Manager read access" ON tech_assets;

-- Access for Admin and TI department members
CREATE POLICY "Sector edit access" ON tech_assets
FOR ALL
TO authenticated
USING (is_admin() OR get_user_department_module() = 'ti')
WITH CHECK (is_admin() OR get_user_department_module() = 'ti');

-- Access for Managers (read only)
CREATE POLICY "Manager read access" ON tech_assets
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'));
