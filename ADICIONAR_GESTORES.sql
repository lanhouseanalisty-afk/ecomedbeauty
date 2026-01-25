-- ============================================
-- VERIFICAR VALORES VÁLIDOS DO ENUM app_module
-- ============================================

-- Ver quais valores são permitidos no enum app_module
SELECT unnest(enum_range(NULL::app_module)) as "Módulos Válidos";

/*
Execute a query acima primeiro para ver quais módulos são válidos.
Provavelmente são: admin, rh, financeiro, marketing, comercial, logistica, juridico, tech, ecommerce

Depois execute o script abaixo, ajustando os módulos conforme necessário.
*/

-- ============================================
-- ADICIONAR GESTORES (usando apenas módulos válidos)
-- ============================================

-- PASSO 1: Adicionar colunas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'departments' AND column_name = 'manager_email'
  ) THEN
    ALTER TABLE departments ADD COLUMN manager_email TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'departments' AND column_name = 'manager_name'
  ) THEN
    ALTER TABLE departments ADD COLUMN manager_name TEXT;
  END IF;
END $$;

-- PASSO 2: Criar índice
CREATE INDEX IF NOT EXISTS idx_departments_manager_email ON departments(manager_email);

-- PASSO 3: Inserir ou atualizar apenas departamentos com módulos válidos

-- 1. Administração - Pedro Miguel
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Administração', 'admin', 'admin', 'pedro.miguel@medbeauty.com.br', 'Pedro Miguel')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 2. RH - Gleice Silva
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('RH', 'rh', 'rh', 'gleice.silva@medbeauty.com.br', 'Gleice Silva')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 3. Financeiro - Lucas Voltarelli
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Financeiro', 'financeiro', 'financeiro', 'lucas.voltarelli@medbeauty.com.br', 'Lucas Voltarelli')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 4. Marketing - Viviane Toledo
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Marketing', 'marketing', 'marketing', 'viviane.toledo@medbeauty.com.br', 'Viviane Toledo')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5. Comercial (sem gestor direto)
INSERT INTO departments (name, code, module)
VALUES ('Comercial', 'comercial', 'comercial')
ON CONFLICT (code) DO NOTHING;

-- 5.1 Inside Sales - Cesar Camargo
INSERT INTO departments (name, code, module, manager_email, manager_name, parent_id)
VALUES (
  'Inside Sales', 
  'com_inside',
  'comercial',
  'cesar.camargo@medbeauty.com.br', 
  'Cesar Camargo',
  (SELECT id FROM departments WHERE code = 'comercial')
)
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.2 Sudeste - Milena Fireman
INSERT INTO departments (name, code, module, manager_email, manager_name, parent_id)
VALUES (
  'Sudeste', 
  'com_sudeste',
  'comercial',
  'milena.fireman@medbeauty.com.br', 
  'Milena Fireman',
  (SELECT id FROM departments WHERE code = 'comercial')
)
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.3 Sul - Jaqueline Grasel
INSERT INTO departments (name, code, module, manager_email, manager_name, parent_id)
VALUES (
  'Sul', 
  'com_sul',
  'comercial',
  'jaqueline.grasel@medbeauty.com.br', 
  'Jaqueline Grasel',
  (SELECT id FROM departments WHERE code = 'comercial')
)
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.4 Centro - Laice Santos
INSERT INTO departments (name, code, module, manager_email, manager_name, parent_id)
VALUES (
  'Centro', 
  'com_centro',
  'comercial',
  'laice.santos@medbeauty.com.br', 
  'Laice Santos',
  (SELECT id FROM departments WHERE code = 'comercial')
)
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.5 Norte - Thiago Carvalho
INSERT INTO departments (name, code, module, manager_email, manager_name, parent_id)
VALUES (
  'Norte', 
  'com_norte',
  'comercial',
  'thiago.carvalho@medbeauty.com.br', 
  'Thiago Carvalho',
  (SELECT id FROM departments WHERE code = 'comercial')
)
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 6. Logística - Luciana Borri
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Logística', 'logistica', 'logistica', 'luciana.borri@medbeauty.com.br', 'Luciana Borri')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 7. Jurídico - Denis Ranieri
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Jurídico', 'juridico', 'juridico', 'denis.ranieri@medbeauty.com.br', 'Denis Ranieri')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 8. Tech / Suporte - Marcelo Ravagnani
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Tech / Suporte', 'tech', 'tech', 'marcelo.ravagnani@medbeauty.com.br', 'Marcelo Ravagnani')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 9. E-commerce (usando 'ecommerce' se 'compras' não existir)
-- Gilcimar Gil será gestor de E-commerce
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('E-commerce', 'ecommerce', 'ecommerce', 'gilcimar.gil@medbeauty.com.br', 'Gilcimar Gil')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 10. Manutenção - Laércio (usando módulo 'admin' como fallback)
INSERT INTO departments (name, code, module, manager_email, manager_name)
VALUES ('Manutenção', 'manutencao', 'admin', 'laercio@medbeauty.com.br', 'Laércio')
ON CONFLICT (code) DO UPDATE SET
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- PASSO 4: Verificar resultado
SELECT 
  code as "Código",
  name as "Departamento",
  module as "Módulo",
  manager_name as "Gestor",
  manager_email as "Email"
FROM departments
WHERE manager_email IS NOT NULL
ORDER BY manager_name;

-- Contar gestores
SELECT 
  COUNT(DISTINCT manager_email) FILTER (WHERE manager_email IS NOT NULL) as "Total de Gestores"
FROM departments;

/*
NOTA: 
- Gilcimar Gil foi atribuído ao E-commerce (já que 'compras' não existe no enum)
- Laércio (Manutenção) usa módulo 'admin' como fallback

Se você quiser adicionar 'compras' e 'manutencao' ao enum, execute:
ALTER TYPE app_module ADD VALUE 'compras';
ALTER TYPE app_module ADD VALUE 'manutencao';

E depois atualize os departamentos:
UPDATE departments SET module = 'compras' WHERE code = 'ecommerce';
UPDATE departments SET module = 'manutencao' WHERE code = 'manutencao';
*/
