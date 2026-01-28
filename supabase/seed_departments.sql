-- Inserir departamentos com cast explícito para app_module
INSERT INTO public.departments (name, code, module, is_active)
SELECT d.name, d.code, d.module::public.app_module, true
FROM (VALUES 
    ('Compras', 'COMPRAS', 'admin'),
    ('Recursos Humanos', 'RH', 'rh'),
    ('Científica', 'CIENTIFICA', 'cientifica'),
    ('Diretoria', 'DIRETORIA', 'diretoria'),
    ('E-commerce', 'ECOMMERCE', 'ecommerce'),
    ('Manutenção', 'MANUTENCAO', 'admin'),
    ('Tech TI', 'TECH_TI', 'tech'),
    ('Inside Sales', 'INSIDE_SALES', 'comercial')
) as d(name, code, module)
WHERE NOT EXISTS (
    SELECT 1 FROM public.departments dp WHERE dp.name = d.name
);

-- Garantir que estejam ativos
UPDATE public.departments SET is_active = true WHERE name IN ('Compras', 'Recursos Humanos', 'Manutenção', 'Tech TI');
