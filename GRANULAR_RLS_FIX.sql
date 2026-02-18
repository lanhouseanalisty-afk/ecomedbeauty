-- 1. Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function: get current user's department module
CREATE OR REPLACE FUNCTION get_user_department_module()
RETURNS text AS $$
DECLARE
  v_module text;
BEGIN
  SELECT d.module_slug INTO v_module
  FROM employees e
  JOIN departments d ON e.department_id = d.id
  WHERE e.user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_module;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure module_slug exists in departments
ALTER TABLE departments ADD COLUMN IF NOT EXISTS module_slug text;

-- 4. Initial mapping for departments
UPDATE departments SET module_slug = 'marketing' WHERE name ILIKE '%Marketing%';
UPDATE departments SET module_slug = 'financeiro' WHERE name ILIKE '%Financeiro%';
UPDATE departments SET module_slug = 'logistica' WHERE name ILIKE '%Logística%' OR name ILIKE '%Logistica%';
UPDATE departments SET module_slug = 'rh' WHERE name ILIKE '%RH%' OR name ILIKE '%Recursos Humanos%';
UPDATE departments SET module_slug = 'comercial' WHERE name ILIKE '%Comercial%' OR name ILIKE '%Vendas%';
UPDATE departments SET module_slug = 'ti' WHERE name ILIKE '%TI%' OR name ILIKE '%Tecnologia%';
UPDATE departments SET module_slug = 'juridico' WHERE name ILIKE '%Jurídico%' OR name ILIKE '%Juridico%';
UPDATE departments SET module_slug = 'ecommerce' WHERE name ILIKE '%Ecommerce%' OR name ILIKE '%E-commerce%';

-- 5. Helper procedure to apply sector-based RLS
-- This makes it easier to apply the same logic to multiple tables
CREATE OR REPLACE FUNCTION apply_sector_rls(p_table text, p_module text)
RETURNS void AS $$
BEGIN
  -- Disable RLS and Enable it to ensure clean state
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', p_table);
  
  -- Drop existing policies
  EXECUTE format('DROP POLICY IF EXISTS "Sector edit access" ON %I', p_table);
  EXECUTE format('DROP POLICY IF EXISTS "Manager read access" ON %I', p_table);
  
  -- Policy for full access (Admins or Sector Managers)
  EXECUTE format('
    CREATE POLICY "Sector edit access" ON %I
    FOR ALL 
    TO authenticated
    USING (is_admin() OR get_user_department_module() = %L)
    WITH CHECK (is_admin() OR get_user_department_module() = %L)
  ', p_table, p_module, p_module);

  -- Policy for read-only access (All Managers)
  EXECUTE format('
    CREATE POLICY "Manager read access" ON %I
    FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = ''manager''))
  ', p_table);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Apply policies to CRM tables
SELECT apply_sector_rls('marketing_requests', 'marketing');
SELECT apply_sector_rls('fin_invoices', 'financeiro');
SELECT apply_sector_rls('fin_payments', 'financeiro');
SELECT apply_sector_rls('shipments', 'logistica');
SELECT apply_sector_rls('tech_assets', 'logistica');
SELECT apply_sector_rls('crm_leads', 'comercial');
SELECT apply_sector_rls('admission_processes', 'rh');
SELECT apply_sector_rls('termination_processes', 'rh');
-- SELECT apply_sector_rls('legal_contracts', 'juridico'); -- Optional: if there's a specific table

-- Cleanup: We don't need the helper procedure after run
-- DROP FUNCTION apply_sector_rls(text, text);
