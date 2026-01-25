-- ============================================
-- ESTRUTURA ORGANIZACIONAL - SETORES E SUB-SETORES
-- Versão sem dependência de auth.users
-- ============================================

-- Criar tabela de departamentos/setores
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE, -- comercial, marketing, rh, etc.
  description TEXT,
  parent_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  manager_email TEXT, -- Email do gestor (não precisa existir em auth.users ainda)
  manager_name TEXT,  -- Nome do gestor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de membros dos departamentos
CREATE TABLE IF NOT EXISTS department_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL, -- manager, member, viewer
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
-- CRIAR ESTRUTURA DE DEPARTAMENTOS
-- ============================================

-- Departamento Principal: Comercial
INSERT INTO departments (id, name, code, description)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Comercial',
  'comercial',
  'Departamento Comercial - Vendas e Relacionamento com Clientes'
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Sub-setor 1: Inside Sales
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

-- Sub-setor 2: Sudeste
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

-- Sub-setor 3: Sul
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

-- Sub-setor 4: Centro
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

-- Sub-setor 5: Norte
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

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para ver a estrutura hierárquica
CREATE OR REPLACE VIEW department_hierarchy AS
WITH RECURSIVE dept_tree AS (
  -- Departamentos raiz
  SELECT 
    d.id,
    d.name,
    d.code,
    d.parent_id,
    d.manager_email,
    d.manager_name,
    0 as level,
    d.name::text as path
  FROM departments d
  WHERE d.parent_id IS NULL
  
  UNION ALL
  
  -- Departamentos filhos
  SELECT 
    d.id,
    d.name,
    d.code,
    d.parent_id,
    d.manager_email,
    d.manager_name,
    dt.level + 1,
    dt.path || ' > ' || d.name
  FROM departments d
  INNER JOIN dept_tree dt ON d.parent_id = dt.id
)
SELECT * FROM dept_tree ORDER BY path;

-- View para ver gestores e seus departamentos
CREATE OR REPLACE VIEW managers_departments AS
SELECT 
  d.manager_email,
  d.manager_name,
  d.id as department_id,
  d.name as department_name,
  d.code as department_code,
  parent.name as parent_department_name
FROM departments d
LEFT JOIN departments parent ON d.parent_id = parent.id
WHERE d.manager_email IS NOT NULL
ORDER BY d.manager_name;

-- ============================================
-- FUNÇÃO PARA SINCRONIZAR GESTORES
-- ============================================
-- Esta função pode ser chamada para vincular gestores quando eles
-- fizerem login pela primeira vez

CREATE OR REPLACE FUNCTION sync_department_managers()
RETURNS void AS $$
BEGIN
  -- Atualizar department_members quando um usuário com email de gestor fizer login
  INSERT INTO department_members (department_id, user_id, role)
  SELECT 
    d.id,
    p.id,
    'manager'
  FROM departments d
  INNER JOIN profiles p ON d.manager_email = p.email
  WHERE d.manager_email IS NOT NULL
  ON CONFLICT (department_id, user_id) DO UPDATE SET
    role = EXCLUDED.role;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver estrutura hierárquica
SELECT 
  level,
  name,
  code,
  manager_name,
  manager_email,
  path
FROM department_hierarchy;

-- Ver gestores e departamentos
SELECT * FROM managers_departments;

-- Ver todos os sub-setores do Comercial
SELECT 
  name as "Sub-Setor",
  manager_name as "Gestor",
  manager_email as "Email"
FROM departments
WHERE parent_id = (SELECT id FROM departments WHERE code = 'comercial')
ORDER BY name;

-- ============================================
-- COMENTÁRIOS IMPORTANTES
-- ============================================

/*
NOTA: Esta estrutura não cria usuários em auth.users.
Os gestores serão vinculados automaticamente quando:
1. Fizerem login pela primeira vez com seus e-mails
2. A função sync_department_managers() for executada

Para criar os usuários manualmente no Supabase:
1. Vá em Authentication > Users
2. Clique em "Add user"
3. Use os e-mails listados acima
4. Após criar, execute: SELECT sync_department_managers();

Gestores a serem criados:
- cesar.camargo@medbeauty.com.br (Inside Sales)
- milena.fireman@medbeauty.com.br (Sudeste)
- jaqueline.grasel@medbeauty.com.br (Sul)
- laice.santos@medbeauty.com.br (Centro)
- thiago.carvalho@medbeauty.com.br (Norte)
*/
