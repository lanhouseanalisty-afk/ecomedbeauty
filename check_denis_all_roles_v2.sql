-- check Denis user_id and all roles
SELECT 
    e.full_name, 
    e.user_id,
    e.email,
    ur.role
FROM employees e 
LEFT JOIN user_roles ur ON e.user_id = ur.user_id
WHERE e.full_name ILIKE '%Denis%';

-- check if Denis email is hardcoded anywhere else
-- (already searched, but let's be double sure about the logic)
