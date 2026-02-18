-- check all roles for denis
SELECT 
    e.full_name, 
    e.email, 
    ur.role,
    e.user_id
FROM employees e 
JOIN user_roles ur ON e.user_id = ur.user_id
WHERE e.full_name ILIKE '%Denis%';

-- also check auth.users metadata just in case
-- Note: this requires access to auth schema which might be restricted in some psql envs
-- SELECT id, email, raw_user_meta_data FROM auth.users WHERE email ILIKE '%denis%';
