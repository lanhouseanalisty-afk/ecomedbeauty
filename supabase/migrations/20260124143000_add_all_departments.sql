-- ============================================
-- ADICIONAR DEPARTAMENTOS PRINCIPAIS E GESTORES
-- ============================================

-- RH - Gleice Silva
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

-- Financeiro - Lucas Voltarelli
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

-- Tech - Marcelo Ravagnani
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

-- Jurídico - Denis Ranieri
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

-- Marketing - Viviane Toledo
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

-- Compras - Gilcimar Gil
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

-- Administração - Pedro Miguel
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

-- Logística - Luciana Borri
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

-- Manutenção - Laércio
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
-- VERIFICAÇÃO
-- ============================================

-- Ver todos os departamentos principais
SELECT 
  name as "Departamento",
  manager_name as "Gestor",
  manager_email as "Email",
  code as "Código"
FROM departments
WHERE parent_id IS NULL
ORDER BY name;

-- Ver estrutura completa (principais + sub-setores)
SELECT 
  CASE 
    WHEN parent_id IS NULL THEN name
    ELSE '  └─ ' || name
  END as "Estrutura",
  manager_name as "Gestor",
  code as "Código"
FROM departments
ORDER BY 
  COALESCE(parent_id, id),
  name;

-- Contar departamentos
SELECT 
  COUNT(*) FILTER (WHERE parent_id IS NULL) as "Departamentos Principais",
  COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as "Sub-Setores",
  COUNT(*) as "Total"
FROM departments;

/*
RESUMO DOS GESTORES CADASTRADOS:

DEPARTAMENTOS PRINCIPAIS:
1. RH - Gleice Silva (gleice.silva@medbeauty.com.br)
2. Financeiro - Lucas Voltarelli (lucas.voltarelli@medbeauty.com.br)
3. Tech / Suporte - Marcelo Ravagnani (marcelo.ravagnani@medbeauty.com.br)
4. Jurídico - Denis Ranieri (denis.ranieri@medbeauty.com.br)
5. Marketing - Viviane Toledo (viviane.toledo@medbeauty.com.br)
6. Compras - Gilcimar Gil (gilcimar.gil@medbeauty.com.br)
7. Administração - Pedro Miguel (pedro.miguel@medbeauty.com.br)
8. Logística - Luciana Borri (luciana.borri@medbeauty.com.br)
9. Manutenção - Laércio (laercio@medbeauty.com.br)
10. Comercial (já criado anteriormente)

SUB-SETORES DO COMERCIAL:
1. Inside Sales - Cesar Camargo
2. Sudeste - Milena Fireman
3. Sul - Jaqueline Grasel
4. Centro - Laice Santos
5. Norte - Thiago Carvalho

TOTAL: 10 Departamentos Principais + 5 Sub-Setores = 15 Departamentos
*/
