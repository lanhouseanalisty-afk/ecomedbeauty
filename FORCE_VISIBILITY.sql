
-- REWRITE RLS POLICIES FOR TECH_ASSETS
-- This script drops restrictive policies and adds a permissive one.

-- 1. Enable RLS (just in case)
ALTER TABLE tech_assets ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Sector edit access" ON tech_assets;
DROP POLICY IF EXISTS "Manager read access" ON tech_assets;
DROP POLICY IF EXISTS "Tech Assets Access" ON tech_assets;
DROP POLICY IF EXISTS "Allow all" ON tech_assets;
DROP POLICY IF EXISTS "Enable read access for all users" ON tech_assets;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tech_assets;
DROP POLICY IF EXISTS "Enable update for users based on email" ON tech_assets;

-- 3. Create a PERMISSIVE policy for ALL authenticated users (and service role)
-- This allows anyone logged in to see the assets.
CREATE POLICY "Allow Full Access"
ON tech_assets
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 4. Verify policies
SELECT * FROM pg_policies WHERE tablename = 'tech_assets';
