
-- Function to count assets without RLS
CREATE OR REPLACE FUNCTION count_tech_assets_bypass_rls()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM tech_assets);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT count_tech_assets_bypass_rls() as total_assets_no_rls;

-- Also check RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE oid = 'tech_assets'::regclass;
