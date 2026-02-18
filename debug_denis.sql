SELECT 
    e.id as employee_id,
    e.user_id,
    e.full_name,
    d.name as department_name,
    d.module_slug,
    ur.role
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN user_roles ur ON e.user_id = ur.user_id
WHERE e.full_name ILIKE '%Denis%';
