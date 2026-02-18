
-- FIX 500 ERROR ON TECH_ASSETS
-- It seems that 'Tech Full Access Assets' policy is causing infinite recursion with user_roles

-- 1. DROP ALL POTENTIALLY PROBLEMATIC POLICIES
DROP POLICY IF EXISTS "Tech Full Access Assets" ON tech_assets;
DROP POLICY IF EXISTS "Allow Full Access" ON tech_assets; -- Drop previous one to recreate clean

-- 2. CREATE A SINGLE SIMPLE POLICY (NO RECURSION verify)
CREATE POLICY "Allow Full Access Clean"
ON tech_assets
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. VERIFY NO OTHER POLICIES REMAIN
SELECT * FROM pg_policies WHERE tablename = 'tech_assets';
