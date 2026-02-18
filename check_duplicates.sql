-- Check for duplicate user_id in employees
SELECT user_id, COUNT(*) 
FROM employees 
WHERE user_id IS NOT NULL 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Check all entries for Denis
SELECT id, full_name, user_id, department_id, email, status 
FROM employees 
WHERE full_name ILIKE '%Denis%';
