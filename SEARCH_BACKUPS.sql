
-- Search for tables that might be backups or logs related to tech_assets
SELECT 
    schemaname, 
    tablename 
FROM 
    pg_tables 
WHERE 
    schemaname = 'public' 
    AND (
        tablename ILIKE '%tech%' 
        OR tablename ILIKE '%asset%' 
        OR tablename ILIKE '%backup%' 
        OR tablename ILIKE '%log%'
        OR tablename ILIKE '%history%'
    )
ORDER BY 
    tablename;
