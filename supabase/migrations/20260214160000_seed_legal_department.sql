-- Insert Juridico Department if it doesn't exist
INSERT INTO public.departments (name, code, description)
VALUES ('Jurídico', 'juridico', 'Departamento Jurídico e Contratos')
ON CONFLICT (code) DO NOTHING;

-- Optionally, you can add specific users to this department here if you know their IDs
-- INSERT INTO public.department_members (department_id, user_id, role)
-- SELECT id, 'USER_UUID_HERE', 'manager'
-- FROM public.departments WHERE code = 'juridico'
-- ON CONFLICT DO NOTHING;
