-- =====================================================
-- PARTE 2: ENUMS E TABELAS DO CRM
-- =====================================================

-- Criar enum de módulos
CREATE TYPE public.app_module AS ENUM (
  'admin',
  'rh',
  'financeiro',
  'marketing',
  'comercial',
  'logistica',
  'juridico',
  'tech',
  'ecommerce'
);

-- Criar enum de status de funcionário
CREATE TYPE public.employee_status AS ENUM (
  'onboarding',
  'active',
  'on_leave',
  'suspended',
  'offboarding',
  'terminated'
);

-- Criar enum de status de lead CRM
CREATE TYPE public.crm_lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'unqualified',
  'converted',
  'lost'
);

-- Criar enum de estágio de oportunidade
CREATE TYPE public.opportunity_stage AS ENUM (
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

-- Criar enum de status de envio
CREATE TYPE public.shipment_status AS ENUM (
  'pending',
  'picking',
  'packing',
  'ready',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'returned',
  'cancelled'
);

-- Criar enum de status de ticket
CREATE TYPE public.ticket_status AS ENUM (
  'open',
  'assigned',
  'in_progress',
  'pending_user',
  'pending_vendor',
  'resolved',
  'closed',
  'cancelled'
);

-- Criar enum de prioridade de ticket
CREATE TYPE public.ticket_priority AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

-- Criar enum de status de pagamento financeiro
CREATE TYPE public.fin_payment_status AS ENUM (
  'pending',
  'partial',
  'paid',
  'overdue',
  'cancelled',
  'refunded'
);

-- Criar enum de status de contrato
CREATE TYPE public.contract_status AS ENUM (
  'draft',
  'review',
  'pending_signature',
  'active',
  'expired',
  'terminated',
  'renewed'
);

-- =====================================================
-- TABELAS CORE
-- =====================================================

-- Departamentos
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  module app_module NOT NULL,
  parent_id UUID REFERENCES public.departments(id),
  manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permissões granulares por módulo
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module app_module NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  scope VARCHAR(50) DEFAULT 'own',
  UNIQUE(role, module)
);

-- Audit Log global
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  module app_module NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- =====================================================
-- RH MODULE
-- =====================================================

-- Cargos
CREATE TABLE public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  level INT DEFAULT 1,
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Funcionários
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  hire_date DATE NOT NULL,
  termination_date DATE,
  position_id UUID REFERENCES public.positions(id),
  department_id UUID REFERENCES public.departments(id),
  manager_id UUID REFERENCES public.employees(id),
  status employee_status DEFAULT 'onboarding',
  salary DECIMAL(12,2),
  work_schedule JSONB,
  emergency_contact JSONB,
  address JSONB,
  documents JSONB,
  lgpd_consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_employees_status ON public.employees(status);
CREATE INDEX idx_employees_department ON public.employees(department_id);

-- Registro de ponto
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_minutes INT DEFAULT 0,
  overtime_minutes INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Solicitações de férias/licença
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INT NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES public.employees(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Treinamentos
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructor VARCHAR(200),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location VARCHAR(200),
  is_mandatory BOOLEAN DEFAULT false,
  max_participants INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participação em treinamentos
CREATE TABLE public.training_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES public.trainings(id) NOT NULL,
  employee_id UUID REFERENCES public.employees(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'enrolled',
  completed_at TIMESTAMPTZ,
  score DECIMAL(5,2),
  certificate_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(training_id, employee_id)
);

-- =====================================================
-- FINANCEIRO MODULE
-- =====================================================

-- Centros de custo
CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  budget_annual DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contas financeiras
CREATE TABLE public.financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  bank_name VARCHAR(100),
  agency VARCHAR(20),
  account_number VARCHAR(30),
  balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Faturas
CREATE TABLE public.fin_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID,
  type VARCHAR(20) NOT NULL,
  status fin_payment_status DEFAULT 'pending',
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  due_date DATE NOT NULL,
  paid_date DATE,
  nfe_number VARCHAR(50),
  nfe_key VARCHAR(50),
  nfe_xml TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fin_invoices_status ON public.fin_invoices(status);
CREATE INDEX idx_fin_invoices_due ON public.fin_invoices(due_date);

-- Pagamentos
CREATE TABLE public.fin_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.fin_invoices(id),
  account_id UUID REFERENCES public.financial_accounts(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  reference VARCHAR(100),
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- COMERCIAL (CRM) MODULE
-- =====================================================

-- Contas CRM
CREATE TABLE public.crm_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18),
  cpf VARCHAR(14),
  type VARCHAR(50) DEFAULT 'customer',
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address JSONB,
  owner_id UUID REFERENCES auth.users(id),
  sap_card_code VARCHAR(50),
  salesforce_id VARCHAR(50),
  annual_revenue DECIMAL(15,2),
  employee_count INT,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  custom_fields JSONB,
  lgpd_consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_accounts_owner ON public.crm_accounts(owner_id);
CREATE INDEX idx_crm_accounts_type ON public.crm_accounts(type);

-- Contatos CRM
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.crm_accounts(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  mobile VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  address JSONB,
  social_profiles JSONB,
  preferences JSONB,
  lgpd_consent_at TIMESTAMPTZ,
  opt_in_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_contacts_account ON public.crm_contacts(account_id);
CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(email);

-- Leads CRM
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(200),
  position VARCHAR(100),
  source VARCHAR(100),
  source_detail VARCHAR(255),
  utm_params JSONB,
  status crm_lead_status DEFAULT 'new',
  score INT DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id),
  converted_account_id UUID REFERENCES public.crm_accounts(id),
  converted_contact_id UUID REFERENCES public.crm_contacts(id),
  converted_at TIMESTAMPTZ,
  notes TEXT,
  custom_fields JSONB,
  lgpd_consent_at TIMESTAMPTZ,
  opt_in_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_owner ON public.crm_leads(owner_id);
CREATE INDEX idx_crm_leads_source ON public.crm_leads(source);

-- Pipelines CRM
CREATE TABLE public.crm_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  stages JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Oportunidades CRM
CREATE TABLE public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  account_id UUID REFERENCES public.crm_accounts(id),
  contact_id UUID REFERENCES public.crm_contacts(id),
  pipeline_id UUID REFERENCES public.crm_pipelines(id),
  stage opportunity_stage DEFAULT 'prospecting',
  amount DECIMAL(15,2),
  probability INT DEFAULT 10,
  expected_close_date DATE,
  actual_close_date DATE,
  owner_id UUID REFERENCES auth.users(id),
  source VARCHAR(100),
  lead_id UUID REFERENCES public.crm_leads(id),
  order_id UUID REFERENCES public.orders(id),
  lost_reason VARCHAR(255),
  next_step TEXT,
  notes TEXT,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(stage);
CREATE INDEX idx_crm_opportunities_owner ON public.crm_opportunities(owner_id);
CREATE INDEX idx_crm_opportunities_account ON public.crm_opportunities(account_id);

-- Atividades CRM
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INT,
  outcome VARCHAR(100),
  owner_id UUID REFERENCES auth.users(id),
  account_id UUID REFERENCES public.crm_accounts(id),
  contact_id UUID REFERENCES public.crm_contacts(id),
  opportunity_id UUID REFERENCES public.crm_opportunities(id),
  lead_id UUID REFERENCES public.crm_leads(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_activities_due ON public.crm_activities(due_date);
CREATE INDEX idx_crm_activities_owner ON public.crm_activities(owner_id);

-- =====================================================
-- LOGÍSTICA MODULE
-- =====================================================

-- Depósitos
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  address JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sap_warehouse_code VARCHAR(20),
  capacity_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Estoque
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(50) NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  quantity_available INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  quantity_incoming INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  max_stock INT,
  reorder_point INT,
  last_count_date DATE,
  last_count_qty INT,
  location VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_inventory_sku ON public.inventory(sku);

-- Transportadoras
CREATE TABLE public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  cnpj VARCHAR(18),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  tracking_url_template VARCHAR(500),
  api_config JSONB,
  sla_days_min INT,
  sla_days_max INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Envios
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  warehouse_id UUID REFERENCES public.warehouses(id),
  carrier_id UUID REFERENCES public.carriers(id),
  status shipment_status DEFAULT 'pending',
  tracking_code VARCHAR(100),
  tracking_url VARCHAR(500),
  shipping_method VARCHAR(50),
  shipping_cost DECIMAL(10,2),
  weight_kg DECIMAL(10,3),
  dimensions JSONB,
  packages_count INT DEFAULT 1,
  shipped_at TIMESTAMPTZ,
  estimated_delivery DATE,
  delivered_at TIMESTAMPTZ,
  delivery_proof JSONB,
  notes TEXT,
  sap_delivery_doc VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_order ON public.shipments(order_id);
CREATE INDEX idx_shipments_tracking ON public.shipments(tracking_code);

-- Eventos de rastreamento
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) NOT NULL,
  status VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  occurred_at TIMESTAMPTZ NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tracking_events_shipment ON public.tracking_events(shipment_id);

-- Tarefas de separação
CREATE TABLE public.pick_pack_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- MARKETING MODULE
-- =====================================================

-- Campanhas de marketing
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  description TEXT,
  objective VARCHAR(100),
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_audience JSONB,
  channels TEXT[],
  utm_campaign VARCHAR(100),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  metrics JSONB,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_status ON public.marketing_campaigns(status);

-- Promoções
CREATE TABLE public.marketing_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  discount_type VARCHAR(20),
  discount_value DECIMAL(10,2),
  min_order_value DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  applicable_products TEXT[],
  applicable_categories TEXT[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  stackable BOOLEAN DEFAULT false,
  conditions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assets de marketing
CREATE TABLE public.marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500),
  file_size INT,
  dimensions JSONB,
  channel VARCHAR(50),
  version INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'draft',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- JURÍDICO MODULE
-- =====================================================

-- Casos jurídicos
CREATE TABLE public.legal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  parties JSONB,
  court VARCHAR(200),
  judge VARCHAR(200),
  amount_claimed DECIMAL(15,2),
  amount_provisioned DECIMAL(15,2),
  responsible_id UUID REFERENCES auth.users(id),
  external_lawyer JSONB,
  next_deadline DATE,
  documents JSONB,
  notes TEXT,
  outcome TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_legal_cases_status ON public.legal_cases(status);
CREATE INDEX idx_legal_cases_deadline ON public.legal_cases(next_deadline);

-- Contratos
CREATE TABLE public.legal_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  status contract_status DEFAULT 'draft',
  party_account_id UUID REFERENCES public.crm_accounts(id),
  party_name VARCHAR(200),
  party_document VARCHAR(20),
  value DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  payment_terms TEXT,
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  renewal_notice_days INT DEFAULT 30,
  responsible_id UUID REFERENCES auth.users(id),
  document_url VARCHAR(500),
  signed_document_url VARCHAR(500),
  signed_at TIMESTAMPTZ,
  signers JSONB,
  terms_summary TEXT,
  special_clauses TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contracts_status ON public.legal_contracts(status);
CREATE INDEX idx_contracts_end_date ON public.legal_contracts(end_date);

-- Itens de compliance
CREATE TABLE public.compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  requirement TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  due_date DATE,
  responsible_id UUID REFERENCES auth.users(id),
  evidence_url VARCHAR(500),
  last_audit_date DATE,
  next_audit_date DATE,
  risk_level VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TECH DIGITAL MODULE
-- =====================================================

-- Categorias de tickets
CREATE TABLE public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES public.ticket_categories(id),
  sla_response_hours INT DEFAULT 24,
  sla_resolution_hours INT DEFAULT 72,
  auto_assign_to UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id),
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  requester_id UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  related_asset VARCHAR(100),
  sla_response_due TIMESTAMPTZ,
  sla_resolution_due TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  satisfaction_rating INT,
  satisfaction_comment TEXT,
  tags TEXT[],
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_assigned ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_requester ON public.tickets(requester_id);

-- Comentários de tickets
CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Base de conhecimento
CREATE TABLE public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id),
  status VARCHAR(20) DEFAULT 'draft',
  author_id UUID REFERENCES auth.users(id),
  view_count INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  related_articles UUID[],
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kb_articles_slug ON public.kb_articles(slug);
CREATE INDEX idx_kb_articles_status ON public.kb_articles(status);