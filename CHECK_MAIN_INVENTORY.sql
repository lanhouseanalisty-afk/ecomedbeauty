
-- Check if tech items are in the main 'inventory' table instead of 'tech_assets'
SELECT * FROM inventory 
WHERE 
    product_id ILIKE '%macbook%' OR 
    product_id ILIKE '%iphone%' OR 
    product_id ILIKE '%notebook%' OR
    description ILIKE '%notebook%' OR
    category ILIKE '%tech%' OR
    category ILIKE '%informatica%';

-- Also check table names again
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
