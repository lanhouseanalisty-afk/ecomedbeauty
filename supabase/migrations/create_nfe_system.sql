-- =====================================================
-- Sistema de Controle de NFE (Notas Fiscais Eletrônicas)
-- =====================================================

-- Tabela principal de NFEs
CREATE TABLE IF NOT EXISTS nfe_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector VARCHAR(50) NOT NULL, -- 'tech_digital', 'marketing', 'logistica', etc.
  
  -- Dados da NFE
  nfe_number VARCHAR(50) NOT NULL,
  nfe_series VARCHAR(10),
  emission_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Dados do Fornecedor
  supplier_name VARCHAR(255) NOT NULL,
  supplier_cnpj VARCHAR(18),
  
  -- Valores
  total_value DECIMAL(10,2) NOT NULL,
  description TEXT,
  
  -- Recorrência
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type VARCHAR(20), -- 'monthly', 'quarterly', 'annual', 'custom'
  recurrence_day INTEGER, -- Dia do mês para recorrência (1-31)
  next_due_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
  payment_date DATE,
  payment_notes TEXT,
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  CONSTRAINT valid_recurrence CHECK (recurrence_type IN ('monthly', 'quarterly', 'annual', 'custom') OR recurrence_type IS NULL)
);

-- Tabela de Anexos (NFE PDF e Boleto)
CREATE TABLE IF NOT EXISTS nfe_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfe_id UUID REFERENCES nfe_records(id) ON DELETE CASCADE,
  file_type VARCHAR(20) NOT NULL, -- 'nfe_pdf', 'boleto_pdf'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_file_type CHECK (file_type IN ('nfe_pdf', 'boleto_pdf'))
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS nfe_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nfe_id UUID REFERENCES nfe_records(id) ON DELETE CASCADE,
  notification_type VARCHAR(30) NOT NULL, -- 'due_soon', 'overdue', 'renewal_needed'
  notification_date DATE NOT NULL,
  days_until_due INTEGER,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_notification_type CHECK (notification_type IN ('due_soon', 'overdue', 'renewal_needed'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_nfe_sector ON nfe_records(sector);
CREATE INDEX IF NOT EXISTS idx_nfe_due_date ON nfe_records(due_date);
CREATE INDEX IF NOT EXISTS idx_nfe_status ON nfe_records(status);
CREATE INDEX IF NOT EXISTS idx_nfe_recurring ON nfe_records(is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_nfe_next_due ON nfe_records(next_due_date) WHERE next_due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_read ON nfe_notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_nfe ON nfe_notifications(nfe_id);
CREATE INDEX IF NOT EXISTS idx_attachments_nfe ON nfe_attachments(nfe_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_nfe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nfe_records_updated_at
  BEFORE UPDATE ON nfe_records
  FOR EACH ROW
  EXECUTE FUNCTION update_nfe_updated_at();

-- Função para calcular próxima data de vencimento
CREATE OR REPLACE FUNCTION calculate_next_due_date(
  current_due_date DATE,
  recurrence_type VARCHAR,
  recurrence_day INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
DECLARE
  next_date DATE;
BEGIN
  CASE recurrence_type
    WHEN 'monthly' THEN
      -- Adiciona 1 mês
      next_date := current_due_date + INTERVAL '1 month';
      -- Se recurrence_day foi especificado, ajusta o dia
      IF recurrence_day IS NOT NULL THEN
        next_date := DATE_TRUNC('month', next_date) + (recurrence_day - 1) * INTERVAL '1 day';
      END IF;
    WHEN 'quarterly' THEN
      next_date := current_due_date + INTERVAL '3 months';
    WHEN 'annual' THEN
      next_date := current_due_date + INTERVAL '1 year';
    ELSE
      next_date := NULL;
  END CASE;
  
  RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação de vencimento próximo
CREATE OR REPLACE FUNCTION create_due_notification(nfe_record nfe_records)
RETURNS void AS $$
DECLARE
  days_diff INTEGER;
  notification_msg TEXT;
BEGIN
  days_diff := nfe_record.due_date - CURRENT_DATE;
  
  notification_msg := format(
    'NFE %s do fornecedor %s no valor de R$ %s vence em %s dias (%s)',
    nfe_record.nfe_number,
    nfe_record.supplier_name,
    nfe_record.total_value,
    days_diff,
    TO_CHAR(nfe_record.due_date, 'DD/MM/YYYY')
  );
  
  -- Verifica se já existe notificação para esta NFE nesta data
  IF NOT EXISTS (
    SELECT 1 FROM nfe_notifications
    WHERE nfe_id = nfe_record.id
      AND notification_date = CURRENT_DATE
      AND notification_type = 'due_soon'
  ) THEN
    INSERT INTO nfe_notifications (
      nfe_id,
      notification_type,
      notification_date,
      days_until_due,
      message
    ) VALUES (
      nfe_record.id,
      'due_soon',
      CURRENT_DATE,
      days_diff,
      notification_msg
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para processar NFEs vencendo em breve (executar diariamente)
CREATE OR REPLACE FUNCTION process_nfe_due_dates()
RETURNS void AS $$
DECLARE
  nfe_record RECORD;
  two_days_from_now DATE;
BEGIN
  two_days_from_now := CURRENT_DATE + INTERVAL '2 days';
  
  -- Processar NFEs vencendo em 2 dias
  FOR nfe_record IN
    SELECT * FROM nfe_records
    WHERE status = 'pending'
      AND due_date = two_days_from_now
  LOOP
    PERFORM create_due_notification(nfe_record);
  END LOOP;
  
  -- Atualizar status de NFEs vencidas
  UPDATE nfe_records
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
  
  -- Processar NFEs recorrentes que precisam renovação
  FOR nfe_record IN
    SELECT * FROM nfe_records
    WHERE is_recurring = true
      AND status = 'paid'
      AND next_due_date IS NOT NULL
      AND next_due_date <= two_days_from_now
  LOOP
    -- Criar notificação de renovação
    INSERT INTO nfe_notifications (
      nfe_id,
      notification_type,
      notification_date,
      days_until_due,
      message
    ) VALUES (
      nfe_record.id,
      'renewal_needed',
      CURRENT_DATE,
      nfe_record.next_due_date - CURRENT_DATE,
      format(
        'NFE recorrente %s precisa ser lançada para o próximo mês (vencimento: %s)',
        nfe_record.nfe_number,
        TO_CHAR(nfe_record.next_due_date, 'DD/MM/YYYY')
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

ALTER TABLE nfe_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfe_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para nfe_records
CREATE POLICY "Users can view all NFE records"
  ON nfe_records FOR SELECT
  USING (true);

CREATE POLICY "Authorized users can insert NFE records"
  ON nfe_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authorized users can update NFE records"
  ON nfe_records FOR UPDATE
  USING (true);

CREATE POLICY "Authorized users can delete NFE records"
  ON nfe_records FOR DELETE
  USING (true);

-- Políticas para nfe_attachments
CREATE POLICY "Users can view attachments"
  ON nfe_attachments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert attachments"
  ON nfe_attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete attachments"
  ON nfe_attachments FOR DELETE
  USING (true);

-- Políticas para nfe_notifications
CREATE POLICY "Users can view notifications"
  ON nfe_notifications FOR SELECT
  USING (true);

CREATE POLICY "Users can update notifications"
  ON nfe_notifications FOR UPDATE
  USING (true);

CREATE POLICY "System can insert notifications"
  ON nfe_notifications FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Dados Iniciais / Seed
-- =====================================================

-- Comentário: Execute a função process_nfe_due_dates() diariamente
-- via cron job ou Edge Function do Supabase
