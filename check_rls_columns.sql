SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN (
        'marketing_requests', 
        'fin_invoices', 
        'shipments', 
        'admission_processes', 
        'termination_processes', 
        'crm_leads', 
        'tech_assets',
        'employees'
    )
ORDER BY 
    table_name, ordinal_position;
