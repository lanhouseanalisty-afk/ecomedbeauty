
-- Check total count
SELECT COUNT(*) as total_assets FROM tech_assets;

-- Check counts by device_type
SELECT device_type, COUNT(*) as count 
FROM tech_assets 
GROUP BY device_type;

-- Check a few rows
SELECT * FROM tech_assets LIMIT 5;

-- Check RLS policies
select * from pg_policies where tablename = 'tech_assets';
