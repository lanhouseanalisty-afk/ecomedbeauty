
-- 1. VERIFY RLS POLICY DEFINITION
select * from pg_policies where tablename = 'tech_assets';

-- 2. CHECK TOTAL ROWS (BYPASSING RLS via count if possible, or just raw)
-- Requires admin/postgres role usually to bypass RLS in count if not policy allow
SELECT count(*) as total_rows_in_db FROM tech_assets;

-- 3. CHECK ROWS VISIBLE TO CURRENT USER (Simulated)
-- This will return 0 if RLS hides them from the current executing user (which is postgres/service_role in SQL Editor?)
-- Usually SQL Editor runs as postgres (superuser), so it sees everything.
-- If SQL Editor sees rows (as shown in your previous message), then data exists.

-- 4. DEBUG PERMISSIONS
-- Check if there is an admin role for the current user? 
-- We can't know the current user UUID easily in SQL Editor unless we use auth.uid() which might be null.

-- 5. FORCE OPEN RLS (TEMPORARY DIAGNOSTIC)
-- ONLY RUN THIS IF YOU ARE SURE. 
-- It allows ANY logged in user to see tech_assets.
/*
DROP POLICY IF EXISTS "Tech Assets Access" ON tech_assets;
CREATE POLICY "Tech Assets Access" ON tech_assets FOR ALL USING (true);
*/

-- 6. CHECK DATA TYPES AGAIN
SELECT device_type, count(*) FROM tech_assets GROUP BY device_type;
