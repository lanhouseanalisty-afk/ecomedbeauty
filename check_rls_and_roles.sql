-- Check all policies on key CRM tables
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename IN (
    'marketing_requests', 
    'fin_invoices', 
    'shipments', 
    'crm_leads', 
    'tech_assets',
    'user_roles'
)
ORDER BY tablename;

-- Check exact roles for Denis AGAIN but very specifically
SELECT user_id, role 
FROM user_roles 
WHERE user_id = 'df9cd2ef-5a48-4382-8435-9991c22d9be3';
