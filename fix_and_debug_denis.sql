-- 1. Force fix the mappings with IDs to be safe
UPDATE departments SET module_slug = 'marketing' WHERE name ILIKE '%Marketing%';
UPDATE departments SET module_slug = 'logistica' WHERE name ILIKE '%Logística%' OR name ILIKE '%Logistica%';
UPDATE departments SET module_slug = 'financeiro' WHERE name ILIKE '%Financeiro%';
UPDATE departments SET module_slug = 'rh' WHERE name ILIKE '%Recursos Humanos%' OR name = 'RH';
UPDATE departments SET module_slug = 'comercial' WHERE name = 'Comercial';
UPDATE departments SET module_slug = 'juridico' WHERE name = 'Jurídico';
UPDATE departments SET module_slug = 'ti' WHERE name ILIKE '%TI%' OR name ILIKE '%Suporte%';
UPDATE departments SET module_slug = 'ecommerce' WHERE name ILIKE '%Ecommerce%';

-- 2. Debug Denis exactly
SELECT e.full_name, e.email, d.name as dept_name, d.module_slug, ur.role 
FROM employees e 
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN user_roles ur ON e.user_id = ur.user_id
WHERE e.full_name ILIKE '%Denis%';

-- 3. Verify if there are any other admins
SELECT u.email, ur.role 
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
