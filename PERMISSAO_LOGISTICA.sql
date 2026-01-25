-- ============================================
-- PERMISSÕES PARA LOGÍSTICA
-- ============================================

-- Primeiro, garantir que o role 'logistica' existe no enum (já verificado na outra migration, mas por segurança)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'logistica' 
    AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'logistica';
  END IF;
END $$;

-- Remover políticas antigas se existirem para evitar duplicidade
DROP POLICY IF EXISTS "Logistica can view approved" ON marketing_requests;
DROP POLICY IF EXISTS "Logistica can update status" ON marketing_requests;
DROP POLICY IF EXISTS "Admins can view all" ON marketing_requests;
DROP POLICY IF EXISTS "Admins can update" ON marketing_requests;

-- Criar política para Logística visualizar pedidos aprovados
CREATE POLICY "Logistica can view approved"
  ON marketing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('logistica', 'admin')
    )
    AND status IN ('approved', 'shipped', 'delivered', 'completed')
  );

-- Criar política para Logística atualizar status
CREATE POLICY "Logistica can update status"
  ON marketing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('logistica', 'admin')
    )
  );

-- Garantir que Admins vejam tudo (caso a política anterior de marketing não cubra todos os casos)
CREATE POLICY "Admins can view all"
  ON marketing_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update"
  ON marketing_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Criar um usuário de teste para Logística (opcional, mas útil)
-- Luciana Borri - Gestora de Logística
INSERT INTO public.profiles (id, email, full_name, phone, created_at, updated_at)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  'luciana.borri@medbeauty.com.br',
  'Luciana Borri',
  '(11) 98765-4328',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
VALUES 
  ('88888888-8888-8888-8888-888888888888', 'logistica'),
  ('88888888-8888-8888-8888-888888888888', 'manager')
ON CONFLICT (user_id, role) DO NOTHING;
