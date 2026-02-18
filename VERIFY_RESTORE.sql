
-- 1. Check total count
SELECT COUNT(*) as total_assets FROM tech_assets;

-- 2. Check distribution by device_type (Crucial for frontend tabs)
SELECT device_type, COUNT(*) 
FROM tech_assets 
GROUP BY device_type;

-- 3. Check RLS visibility for current user (simulate session)
-- This is tricky to simulate perfectly in SQL Editor without setting role, 
-- but we can check if data exists at all first.
SELECT * FROM tech_assets LIMIT 5;
