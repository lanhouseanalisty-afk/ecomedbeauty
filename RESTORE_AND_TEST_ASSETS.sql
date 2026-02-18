
-- 1. FIX PERMISSIONS/RLS (Security First)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
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

-- Update departments
UPDATE departments SET module_slug = 'ti' WHERE name ILIKE '%TI%' OR name ILIKE '%Tecnologia%';

-- Fix RLS based on 'ti' module
ALTER TABLE tech_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sector edit access" ON tech_assets;
DROP POLICY IF EXISTS "Manager read access" ON tech_assets;

CREATE POLICY "Sector edit access" ON tech_assets
FOR ALL
TO authenticated
USING (is_admin() OR get_user_department_module() = 'ti')
WITH CHECK (is_admin() OR get_user_department_module() = 'ti');

CREATE POLICY "Manager read access" ON tech_assets
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'manager'));

-- 2. INSERT TEST DATA (To verify "recovery")
INSERT INTO tech_assets 
(id, asset_tag, device_type, model, brand, status, assigned_to_name, notes)
VALUES
(gen_random_uuid(), 'TEST-LAPTOP-001', 'notebook', 'MacBook Pro', 'Apple', 'available', 'Disponível', 'Teste de recuperação'),
(gen_random_uuid(), 'TEST-PHONE-001', 'smartphone', 'iPhone 15', 'Apple', 'in_use', 'João Silva', 'Teste de recuperação')
ON CONFLICT (asset_tag) DO UPDATE 
SET notes = 'Atualizado pelo script de teste';

-- 3. VERIFY AND SELECT DATA
SELECT count(*) as total_assets_after_fix FROM tech_assets;
SELECT * FROM tech_assets WHERE asset_tag LIKE 'TEST-%';
