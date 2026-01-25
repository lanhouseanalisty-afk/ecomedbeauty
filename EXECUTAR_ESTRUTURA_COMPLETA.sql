-- ============================================
-- SCRIPT CONSOLIDADO - ESTRUTURA ORGANIZACIONAL COMPLETA
-- Execute este script no Supabase SQL Editor
-- ============================================

-- PARTE 1: CRIAR TABELAS E ESTRUTURA BASE
-- ============================================

-- Criar tabela de departamentos/setores
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  manager_email TEXT,
  manager_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de membros dos departamentos
CREATE TABLE IF NOT EXISTS department_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, user_id)
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_members ENABLE ROW LEVEL SECURITY;

-- Policies para departments
DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
CREATE POLICY "Everyone can view departments"
  ON departments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments"
  ON departments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies para department_members
DROP POLICY IF EXISTS "Users can view their departments" ON department_members;
CREATE POLICY "Users can view their departments"
  ON department_members FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Admins can manage members" ON department_members;
CREATE POLICY "Admins can manage members"
  ON department_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_parent_id ON departments(parent_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager_email ON departments(manager_email);
CREATE INDEX IF NOT EXISTS idx_department_members_user_id ON department_members(user_id);
CREATE INDEX IF NOT EXISTS idx_department_members_department_id ON department_members(department_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS departments_updated_at ON departments;
CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_departments_updated_at();

-- ============================================
-- PARTE 2: INSERIR DEPARTAMENTOS E GESTORES
-- ============================================

-- 1. Administração - Pedro Miguel
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000007',
  'Administração',
  'admin',
  'Departamento Administrativo - Gestão Geral',
  'pedro.miguel@medbeauty.com.br',
  'Pedro Miguel'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 2. RH - Gleice Silva
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'RH',
  'rh',
  'Recursos Humanos - Gestão de Pessoas',
  'gleice.silva@medbeauty.com.br',
  'Gleice Silva'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 3. Financeiro - Lucas Voltarelli
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Financeiro',
  'financeiro',
  'Departamento Financeiro - Gestão Financeira e Contábil',
  'lucas.voltarelli@medbeauty.com.br',
  'Lucas Voltarelli'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 4. Marketing - Viviane Toledo
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  'Marketing',
  'marketing',
  'Departamento de Marketing - Campanhas e Comunicação',
  'viviane.toledo@medbeauty.com.br',
  'Viviane Toledo'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5. Comercial (Departamento Principal)
INSERT INTO departments (id, name, code, description)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Comercial',
  'comercial',
  'Departamento Comercial - Vendas e Relacionamento com Clientes'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 5.1 Inside Sales - Cesar Camargo
INSERT INTO departments (id, name, code, description, parent_id, manager_email, manager_name)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Inside Sales',
  'comercial_inside_sales',
  'Vendas Internas',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'cesar.camargo@medbeauty.com.br',
  'Cesar Camargo'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.2 Sudeste - Milena Fireman
INSERT INTO departments (id, name, code, description, parent_id, manager_email, manager_name)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Sudeste',
  'comercial_sudeste',
  'Região Sudeste',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'milena.fireman@medbeauty.com.br',
  'Milena Fireman'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.3 Sul - Jaqueline Grasel
INSERT INTO departments (id, name, code, description, parent_id, manager_email, manager_name)
VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Sul',
  'comercial_sul',
  'Região Sul',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'jaqueline.grasel@medbeauty.com.br',
  'Jaqueline Grasel'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.4 Centro - Laice Santos
INSERT INTO departments (id, name, code, description, parent_id, manager_email, manager_name)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Centro',
  'comercial_centro',
  'Região Centro',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'laice.santos@medbeauty.com.br',
  'Laice Santos'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 5.5 Norte - Thiago Carvalho
INSERT INTO departments (id, name, code, description, parent_id, manager_email, manager_name)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'Norte',
  'comercial_norte',
  'Região Norte',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'thiago.carvalho@medbeauty.com.br',
  'Thiago Carvalho'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 6. Logística - Luciana Borri
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000008',
  'Logística',
  'logistica',
  'Departamento de Logística - Distribuição e Armazenagem',
  'luciana.borri@medbeauty.com.br',
  'Luciana Borri'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 7. Jurídico - Denis Ranieri
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  'Jurídico',
  'juridico',
  'Departamento Jurídico - Contratos e Compliance',
  'denis.ranieri@medbeauty.com.br',
  'Denis Ranieri'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 8. Tech / Suporte - Marcelo Ravagnani
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Tech / Suporte',
  'tech',
  'Tecnologia e Suporte - TI e Infraestrutura',
  'marcelo.ravagnani@medbeauty.com.br',
  'Marcelo Ravagnani'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 9. Compras - Gilcimar Gil
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000006',
  'Compras',
  'compras',
  'Departamento de Compras - Aquisições e Fornecedores',
  'gilcimar.gil@medbeauty.com.br',
  'Gilcimar Gil'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- 10. Manutenção - Laércio
INSERT INTO departments (id, name, code, description, manager_email, manager_name)
VALUES (
  '10000000-0000-0000-0000-000000000009',
  'Manutenção',
  'manutencao',
  'Departamento de Manutenção - Infraestrutura e Facilities',
  'laercio@medbeauty.com.br',
  'Laércio'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  manager_email = EXCLUDED.manager_email,
  manager_name = EXCLUDED.manager_name;

-- ============================================
-- PARTE 3: VERIFICAÇÃO
-- ============================================

-- Ver todos os gestores
SELECT 
  manager_name as "Gestor",
  name as "Departamento",
  manager_email as "Email"
FROM departments
WHERE manager_email IS NOT NULL
ORDER BY manager_name;

-- Contar departamentos
SELECT 
  COUNT(*) FILTER (WHERE parent_id IS NULL) as "Departamentos Principais",
  COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as "Sub-Setores",
  COUNT(*) as "Total Departamentos",
  COUNT(DISTINCT manager_email) FILTER (WHERE manager_email IS NOT NULL) as "Total Gestores"
FROM departments;

/*
RESULTADO ESPERADO:
- 10 Departamentos Principais
- 5 Sub-Setores
- 15 Total Departamentos
- 14 Total Gestores

GESTORES CADASTRADOS:
1. Cesar Camargo - Inside Sales
2. Denis Ranieri - Jurídico
3. Gilcimar Gil - Compras
4. Gleice Silva - RH
5. Jaqueline Grasel - Sul
6. Laércio - Manutenção
7. Laice Santos - Centro
8. Lucas Voltarelli - Financeiro
9. Luciana Borri - Logística
10. Marcelo Ravagnani - Tech / Suporte
11. Milena Fireman - Sudeste
12. Pedro Miguel - Administração
13. Thiago Carvalho - Norte
14. Viviane Toledo - Marketing
*/
