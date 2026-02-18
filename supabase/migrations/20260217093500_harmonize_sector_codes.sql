-- Harmonização de códigos de setores para bater com as rotas do frontend
-- E adição de sub-setores faltantes

-- 1. Atualizar códigos principais para bater com URL Params comuns
UPDATE departments SET code = 'admin' WHERE code = 'ADMIN';
UPDATE departments SET code = 'financeiro' WHERE code = 'FIN';
UPDATE departments SET code = 'marketing' WHERE code = 'MKT';
UPDATE departments SET code = 'comercial' WHERE code = 'COM';
UPDATE departments SET code = 'logistica' WHERE code = 'LOG';
UPDATE departments SET code = 'juridico' WHERE code = 'JUR';
UPDATE departments SET code = 'tech' WHERE code = 'TECH';
UPDATE departments SET code = 'ecommerce' WHERE code = 'ECOM';
UPDATE departments SET code = 'compras' WHERE code = 'COMPRAS';

-- 2. Garantir que sub-setores comerciais tenham códigos padronizados
UPDATE departments SET code = 'com_inside_sales' WHERE code = 'com_inside';
-- Adicionar Franquias se não existir
INSERT INTO departments (id, name, code, parent_id)
SELECT 
    '10000000-0000-0000-0000-000000000010', 
    'Franquias', 
    'com_franchises',
    (SELECT id FROM departments WHERE code = 'comercial')
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = 'com_franchises')
ON CONFLICT (code) DO NOTHING;

-- Garantir que os sub-setores regionais existam ou estejam corretos
UPDATE departments SET code = 'com_sudeste' WHERE name ILIKE 'Sudeste';
UPDATE departments SET code = 'com_sul' WHERE name ILIKE 'Sul';
UPDATE departments SET code = 'com_centro' WHERE name ILIKE 'Centro';
UPDATE departments SET code = 'com_norte' WHERE name ILIKE 'Norte';
