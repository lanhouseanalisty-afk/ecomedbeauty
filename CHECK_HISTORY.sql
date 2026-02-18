
-- 1. INSPECT COLUMNS FIRST (To avoid errors like "column does not exist")
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'tech_asset_history'
ORDER BY 
    ordinal_position;

-- 2. CHECK SAMPLE WITHOUT ORDERING (Safe)
SELECT * FROM tech_asset_history LIMIT 5;

-- 3. COUNT RECORDS
SELECT COUNT(*) as history_records FROM tech_asset_history;
