-- Criação da tabela de Clientes E-commerce
CREATE TABLE IF NOT EXISTS ecommerce_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
  total_spent NUMERIC(10,2) DEFAULT 0
);

-- Criação da tabela de Carrinhos (1:1 com Cliente)
CREATE TABLE IF NOT EXISTS ecommerce_carts (
  customer_id UUID REFERENCES ecommerce_customers(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]', -- Ex: [{"id": 1, "name": "Prod", "price": 10, "quantity": 1, "image": "url"}]
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (customer_id)
);

-- Criação da tabela de Histórico de Pesquisas
CREATE TABLE IF NOT EXISTS ecommerce_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES ecommerce_customers(id) ON DELETE CASCADE,
  search_term TEXT NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- Criação da tabela de Pedidos (Simplificada para visualização)
CREATE TABLE IF NOT EXISTS ecommerce_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES ecommerce_customers(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'completed',
  items JSONB NOT NULL, -- Lista de nomes ou objetos
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security) - Opcional, mas recomendado
ALTER TABLE ecommerce_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (Permitir tudo para usuários autenticados do CRM por enquanto)
CREATE POLICY "Allow CRM users to view customers" ON ecommerce_customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow CRM users to view carts" ON ecommerce_carts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow CRM users to view history" ON ecommerce_search_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow CRM users to view orders" ON ecommerce_orders FOR SELECT TO authenticated USING (true);

-- DADOS DE EXEMPLO (MOCK DATA) PARA TESTE IMEDIATO
INSERT INTO ecommerce_customers (id, full_name, email, phone, status, total_spent, created_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ana Silva', 'ana.silva@email.com', '(11) 99999-1111', 'active', 1250.00, NOW() - INTERVAL '6 months'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Carlos Oliveira', 'carlos.o@email.com', '(21) 98888-2222', 'inactive', 450.00, NOW() - INTERVAL '3 months'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Roberto Lima', 'beto.lima@email.com', '(11) 96666-4444', 'vip', 3500.00, NOW() - INTERVAL '1 year')
ON CONFLICT (email) DO NOTHING;

INSERT INTO ecommerce_carts (customer_id, items, updated_at) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '[{"id": 201, "name": "Shampoo Antiqueda", "price": 45.00, "quantity": 1, "image": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=100&h=100&fit=crop"}]', NOW() - INTERVAL '3 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '[{"id": 301, "name": "Perfume Importado X", "price": 450.00, "quantity": 1, "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop"}]', NOW() - INTERVAL '4 hours')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO ecommerce_search_history (customer_id, search_term, searched_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'protetor solar', NOW() - INTERVAL '1 day'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'anti-rugas', NOW() - INTERVAL '2 days'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'shampoo', NOW() - INTERVAL '5 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'perfume', NOW() - INTERVAL '1 hour');

INSERT INTO ecommerce_orders (customer_id, total_amount, items, created_at) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 450.50, '["Hidratante Facial", "Protetor Solar FPS 70"]', NOW() - INTERVAL '5 days'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 890.00, '["Perfume Y", "Desodorante"]', NOW() - INTERVAL '1 month');
