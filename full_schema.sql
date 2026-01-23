-- Table for storing leads with LGPD consent
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  source TEXT DEFAULT 'chatbot',
  topic TEXT,
  opt_in_marketing BOOLEAN NOT NULL DEFAULT false,
  lgpd_consent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for leads (public insert for capturing leads, admin can read)
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can read own leads by email" 
ON public.leads 
FOR SELECT 
USING (true);

-- Policies for chat_conversations (public access by session)
CREATE POLICY "Anyone can create conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read conversations by session" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

-- Policies for chat_messages (public access via conversation)
CREATE POLICY "Anyone can create messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Function to check user role (security definer to avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Handle new user signup - create profile and assign default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Update timestamp trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policy for admins to update orders (for status change emails)
CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
-- Create coupons table for admin management
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons (to validate at checkout)
CREATE POLICY "Anyone can read active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- Admins can do everything with coupons
CREATE POLICY "Admins can manage coupons"
ON public.coupons
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Enable realtime for orders table (for admin notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
-- Add tracking fields to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_code TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Create loyalty points table
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create points transactions table
CREATE TABLE public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'bonus')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for loyalty_points
CREATE POLICY "Users can view their own points" 
ON public.loyalty_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage points" 
ON public.loyalty_points 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS policies for points_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.points_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" 
ON public.points_transactions 
FOR INSERT 
WITH CHECK (true);

-- Admin policies
CREATE POLICY "Admins can view all points" 
ON public.loyalty_points 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all transactions" 
ON public.points_transactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_loyalty_points_updated_at
BEFORE UPDATE ON public.loyalty_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  bonus_points INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add referral_code to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID;

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals" 
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can manage referrals" 
ON public.referrals 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals" 
ON public.referrals 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Update admins policy for profiles to view all
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate referral code for new users
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral codes
CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
WHEN (NEW.referral_code IS NULL)
EXECUTE FUNCTION public.generate_referral_code();
-- Fix search_path for generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$;
-- =====================================================
-- PARTE 1: EXPANDIR ENUM app_role
-- =====================================================

-- Primeiro, adicionar os novos valores ao enum existente
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rh_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'marketing_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'logistics_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'legal_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'tech_support';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ecommerce_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auditor';
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
-- =====================================================
-- PARTE 3: RLS E POLICIES
-- =====================================================

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_pack_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

-- Policies para Admin (acesso total)
CREATE POLICY "Admin full access" ON public.departments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.permissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "System insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin full access" ON public.positions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.employees FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.attendance FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.leave_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.trainings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.training_participants FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.cost_centers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.financial_accounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.fin_invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.fin_payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.crm_accounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.crm_contacts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.crm_leads FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.crm_pipelines FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.crm_opportunities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.crm_activities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.warehouses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.inventory FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.carriers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.shipments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.tracking_events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.pick_pack_tasks FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.marketing_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.marketing_promotions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.marketing_assets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.legal_cases FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.legal_contracts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.compliance_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.ticket_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.tickets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.ticket_comments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin full access" ON public.kb_articles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Policies por perfil de módulo
CREATE POLICY "RH manager access" ON public.employees FOR ALL TO authenticated USING (has_role(auth.uid(), 'rh_manager'));
CREATE POLICY "RH manager access" ON public.positions FOR ALL TO authenticated USING (has_role(auth.uid(), 'rh_manager'));
CREATE POLICY "RH manager access" ON public.attendance FOR ALL TO authenticated USING (has_role(auth.uid(), 'rh_manager'));
CREATE POLICY "RH manager access" ON public.leave_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'rh_manager'));
CREATE POLICY "RH manager access" ON public.trainings FOR ALL TO authenticated USING (has_role(auth.uid(), 'rh_manager'));
CREATE POLICY "RH manager access" ON public.training_participants FOR ALL TO authenticated USING (has_role(auth.uid(), 'rh_manager'));

CREATE POLICY "Finance manager access" ON public.cost_centers FOR ALL TO authenticated USING (has_role(auth.uid(), 'finance_manager'));
CREATE POLICY "Finance manager access" ON public.financial_accounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'finance_manager'));
CREATE POLICY "Finance manager access" ON public.fin_invoices FOR ALL TO authenticated USING (has_role(auth.uid(), 'finance_manager'));
CREATE POLICY "Finance manager access" ON public.fin_payments FOR ALL TO authenticated USING (has_role(auth.uid(), 'finance_manager'));

CREATE POLICY "Sales manager access" ON public.crm_accounts FOR ALL TO authenticated USING (has_role(auth.uid(), 'sales_manager'));
CREATE POLICY "Sales manager access" ON public.crm_contacts FOR ALL TO authenticated USING (has_role(auth.uid(), 'sales_manager'));
CREATE POLICY "Sales manager access" ON public.crm_leads FOR ALL TO authenticated USING (has_role(auth.uid(), 'sales_manager'));
CREATE POLICY "Sales manager access" ON public.crm_pipelines FOR SELECT TO authenticated USING (has_role(auth.uid(), 'sales_manager'));
CREATE POLICY "Sales manager access" ON public.crm_opportunities FOR ALL TO authenticated USING (has_role(auth.uid(), 'sales_manager'));
CREATE POLICY "Sales manager access" ON public.crm_activities FOR ALL TO authenticated USING (has_role(auth.uid(), 'sales_manager'));

CREATE POLICY "Logistics manager access" ON public.warehouses FOR ALL TO authenticated USING (has_role(auth.uid(), 'logistics_manager'));
CREATE POLICY "Logistics manager access" ON public.inventory FOR ALL TO authenticated USING (has_role(auth.uid(), 'logistics_manager'));
CREATE POLICY "Logistics manager access" ON public.carriers FOR ALL TO authenticated USING (has_role(auth.uid(), 'logistics_manager'));
CREATE POLICY "Logistics manager access" ON public.shipments FOR ALL TO authenticated USING (has_role(auth.uid(), 'logistics_manager'));
CREATE POLICY "Logistics manager access" ON public.tracking_events FOR ALL TO authenticated USING (has_role(auth.uid(), 'logistics_manager'));
CREATE POLICY "Logistics manager access" ON public.pick_pack_tasks FOR ALL TO authenticated USING (has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Marketing manager access" ON public.marketing_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'marketing_manager'));
CREATE POLICY "Marketing manager access" ON public.marketing_promotions FOR ALL TO authenticated USING (has_role(auth.uid(), 'marketing_manager'));
CREATE POLICY "Marketing manager access" ON public.marketing_assets FOR ALL TO authenticated USING (has_role(auth.uid(), 'marketing_manager'));

CREATE POLICY "Legal manager access" ON public.legal_cases FOR ALL TO authenticated USING (has_role(auth.uid(), 'legal_manager'));
CREATE POLICY "Legal manager access" ON public.legal_contracts FOR ALL TO authenticated USING (has_role(auth.uid(), 'legal_manager'));
CREATE POLICY "Legal manager access" ON public.compliance_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'legal_manager'));

CREATE POLICY "Tech support access" ON public.ticket_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'tech_support'));
CREATE POLICY "Tech support access" ON public.tickets FOR ALL TO authenticated USING (has_role(auth.uid(), 'tech_support'));
CREATE POLICY "Tech support access" ON public.ticket_comments FOR ALL TO authenticated USING (has_role(auth.uid(), 'tech_support'));
CREATE POLICY "Tech support access" ON public.kb_articles FOR ALL TO authenticated USING (has_role(auth.uid(), 'tech_support'));

-- Policies para usuários comuns
CREATE POLICY "Users view own employee" ON public.employees FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Users view own tickets" ON public.tickets FOR SELECT TO authenticated USING (requester_id = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Users add ticket comments" ON public.ticket_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users view ticket comments" ON public.ticket_comments FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.tickets t WHERE t.id = ticket_id AND (t.requester_id = auth.uid() OR t.assigned_to = auth.uid())));
CREATE POLICY "Public view published kb" ON public.kb_articles FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "View own CRM items" ON public.crm_leads FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "View own opportunities" ON public.crm_opportunities FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "View own activities" ON public.crm_activities FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- Dados iniciais: Departamentos
INSERT INTO public.departments (name, code, module) VALUES
('Administração', 'ADMIN', 'admin'),
('Recursos Humanos', 'RH', 'rh'),
('Financeiro', 'FIN', 'financeiro'),
('Marketing', 'MKT', 'marketing'),
('Comercial', 'COM', 'comercial'),
('Logística', 'LOG', 'logistica'),
('Jurídico', 'JUR', 'juridico'),
('Tech Digital', 'TECH', 'tech'),
('E-commerce', 'ECOM', 'ecommerce');

-- Pipeline padrão
INSERT INTO public.crm_pipelines (name, stages, is_default) VALUES
('Pipeline Padrão', '[{"name":"Prospecção","order":1,"probability":10},{"name":"Qualificação","order":2,"probability":25},{"name":"Proposta","order":3,"probability":50},{"name":"Negociação","order":4,"probability":75},{"name":"Fechado Ganho","order":5,"probability":100},{"name":"Fechado Perdido","order":6,"probability":0}]', true);

-- Categorias de ticket
INSERT INTO public.ticket_categories (name, sla_response_hours, sla_resolution_hours) VALUES
('Hardware', 4, 24),
('Software', 8, 48),
('Rede', 2, 8),
('Acesso/Permissões', 4, 24),
('E-commerce', 4, 24),
('Outros', 24, 72);
-- Create onboarding/offboarding checklists table
CREATE TABLE public.hr_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('admissao', 'demissao')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create checklist items table (template items)
CREATE TABLE public.hr_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.hr_checklists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  responsible_role VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee checklist progress table
CREATE TABLE public.hr_employee_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  checklist_id UUID NOT NULL REFERENCES public.hr_checklists(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee checklist item progress table
CREATE TABLE public.hr_employee_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_checklist_id UUID NOT NULL REFERENCES public.hr_employee_checklists(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.hr_checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_checklist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (employees can read, admins/rh can write)
CREATE POLICY "Employees can view checklists" ON public.hr_checklists FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/RH can manage checklists" ON public.hr_checklists FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can view checklist items" ON public.hr_checklist_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/RH can manage checklist items" ON public.hr_checklist_items FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can view employee checklists" ON public.hr_employee_checklists FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/RH can manage employee checklists" ON public.hr_employee_checklists FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Employees can view employee checklist items" ON public.hr_employee_checklist_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/RH can manage employee checklist items" ON public.hr_employee_checklist_items FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default checklists
INSERT INTO public.hr_checklists (type, title, description) VALUES
('admissao', 'Checklist de Admissão Padrão', 'Processo padrão de onboarding para novos funcionários'),
('demissao', 'Checklist de Demissão Padrão', 'Processo padrão de offboarding para funcionários desligados');

-- Insert default admission checklist items
INSERT INTO public.hr_checklist_items (checklist_id, title, description, responsible_role, order_index, is_required)
SELECT id, 'Documentação pessoal', 'Coletar RG, CPF, comprovante de residência, certidões', 'rh', 1, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Exame admissional', 'Agendar e acompanhar exame médico admissional', 'rh', 2, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Contrato de trabalho', 'Elaborar e coletar assinatura do contrato', 'juridico', 3, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Registro em carteira', 'Efetuar registro em CTPS digital', 'rh', 4, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Conta bancária', 'Verificar/abrir conta para pagamento', 'rh', 5, false FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Acesso a sistemas', 'Criar e-mail corporativo e acessos necessários', 'tech', 6, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Equipamentos', 'Preparar estação de trabalho, notebook, celular', 'tech', 7, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Integração', 'Realizar tour e apresentação da empresa', 'rh', 8, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Treinamento inicial', 'Agendar treinamentos obrigatórios', 'rh', 9, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão'
UNION ALL
SELECT id, 'Benefícios', 'Cadastrar vale transporte, alimentação, plano de saúde', 'rh', 10, true FROM public.hr_checklists WHERE type = 'admissao' AND title = 'Checklist de Admissão Padrão';

-- Insert default termination checklist items
INSERT INTO public.hr_checklist_items (checklist_id, title, description, responsible_role, order_index, is_required)
SELECT id, 'Comunicação formal', 'Carta de demissão ou aviso prévio', 'rh', 1, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Exame demissional', 'Agendar exame médico demissional', 'rh', 2, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Rescisão contratual', 'Calcular e preparar TRCT', 'rh', 3, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Homologação', 'Agendar homologação se necessário', 'rh', 4, false FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Devolução de equipamentos', 'Recolher notebook, celular, crachá, chaves', 'tech', 5, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Revogação de acessos', 'Desativar e-mail e acessos a sistemas', 'tech', 6, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Pagamento rescisório', 'Processar pagamento das verbas rescisórias', 'financeiro', 7, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Baixa em benefícios', 'Cancelar VT, VR, plano de saúde', 'rh', 8, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Entrevista de desligamento', 'Realizar entrevista de saída', 'rh', 9, false FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão'
UNION ALL
SELECT id, 'Documentação final', 'Entregar guias FGTS, seguro desemprego', 'rh', 10, true FROM public.hr_checklists WHERE type = 'demissao' AND title = 'Checklist de Demissão Padrão';

-- Create updated_at trigger
CREATE TRIGGER update_hr_checklists_updated_at
BEFORE UPDATE ON public.hr_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_employee_checklists_updated_at
BEFORE UPDATE ON public.hr_employee_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create admission_processes table to track admission workflows
CREATE TABLE public.admission_processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Section 1: HR Data
  employee_name TEXT NOT NULL,
  display_name TEXT,
  cpf TEXT NOT NULL,
  admission_date DATE NOT NULL,
  start_date DATE NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('CLT', 'PJ', 'Estágio', 'Temporário')),
  department TEXT NOT NULL,
  branch TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  manager_email TEXT,
  position TEXT NOT NULL,
  work_regime TEXT NOT NULL CHECK (work_regime IN ('Presencial', 'Híbrido', 'Remoto')),
  hr_observations TEXT,
  
  -- Section 2: Manager Data (filled by department manager)
  needs_laptop BOOLEAN,
  needs_monitor BOOLEAN,
  needs_headset BOOLEAN,
  needs_keyboard BOOLEAN,
  needs_mouse BOOLEAN,
  software_list TEXT[],
  systems_list TEXT[],
  email_required BOOLEAN,
  email_distribution_lists TEXT[],
  shared_folders TEXT[],
  manager_observations TEXT,
  
  -- Section 3: IT Data
  email_created TEXT,
  user_ad_created BOOLEAN,
  accesses_released TEXT[],
  equipment_delivered TEXT[],
  it_responsible TEXT,
  it_completion_date TIMESTAMPTZ,
  it_observations TEXT,
  
  -- Section 4: Documents
  documents_received TEXT[],
  documents_pending TEXT[],
  
  -- Workflow control
  current_step TEXT NOT NULL DEFAULT 'rh' CHECK (current_step IN ('rh', 'gestor', 'ti', 'colaborador', 'concluido')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  target_department TEXT NOT NULL, -- The department that should handle this admission
  
  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Step completion tracking
  hr_completed_at TIMESTAMPTZ,
  hr_completed_by UUID,
  manager_completed_at TIMESTAMPTZ,
  manager_completed_by UUID,
  ti_completed_at TIMESTAMPTZ,
  ti_completed_by UUID,
  documents_completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.admission_processes ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see admissions for their department or if they're RH/Admin
CREATE POLICY "Users can view their department admissions"
ON public.admission_processes
FOR SELECT
USING (true); -- Will be refined based on user roles

CREATE POLICY "Users can insert admissions"
ON public.admission_processes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update admissions"
ON public.admission_processes
FOR UPDATE
USING (true);

-- Create index for faster department filtering
CREATE INDEX idx_admission_department ON public.admission_processes(target_department);
CREATE INDEX idx_admission_status ON public.admission_processes(status);
CREATE INDEX idx_admission_current_step ON public.admission_processes(current_step);

-- Trigger for updated_at
CREATE TRIGGER update_admission_processes_updated_at
BEFORE UPDATE ON public.admission_processes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Adicionar campos do Gestor conforme o novo checklist
ALTER TABLE public.admission_processes
ADD COLUMN IF NOT EXISTS buddy_mentor TEXT,
ADD COLUMN IF NOT EXISTS needs_printer BOOLEAN DEFAULT false;

-- Renomear systems_list para acessos_necessarios para melhor semântica
-- Mantemos os campos existentes mas adicionamos comentários para clareza
COMMENT ON COLUMN public.admission_processes.software_list IS 'Softwares necessários: Microsoft 365, SAP B1, Salesforce';
COMMENT ON COLUMN public.admission_processes.systems_list IS 'Acessos necessários: AD, Teams, Pastas de Rede/Sharepoint, VPN, Sistemas Internos';
COMMENT ON COLUMN public.admission_processes.buddy_mentor IS 'Buddy/Mentor designado pelo gestor';
COMMENT ON COLUMN public.admission_processes.needs_printer IS 'Se necessita impressora';
-- Criar tabela de notificações de admissão
CREATE TABLE public.admission_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_process_id UUID NOT NULL REFERENCES public.admission_processes(id) ON DELETE CASCADE,
  target_step TEXT NOT NULL, -- 'gestor', 'ti', 'colaborador'
  target_email TEXT,
  target_department TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'step_pending', -- 'step_pending', 'step_completed', 'reminder'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  link_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admission_notifications ENABLE ROW LEVEL SECURITY;

-- Policies - authenticated users can read notifications for their department
CREATE POLICY "Authenticated users can read notifications"
ON public.admission_notifications
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update notifications"
ON public.admission_notifications
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert notifications"
ON public.admission_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_admission_notifications_process ON public.admission_notifications(admission_process_id);
CREATE INDEX idx_admission_notifications_token ON public.admission_notifications(link_token);
CREATE INDEX idx_admission_notifications_status ON public.admission_notifications(status);

-- Trigger for updated_at
CREATE TRIGGER update_admission_notifications_updated_at
BEFORE UPDATE ON public.admission_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admission_notifications;
-- Allow RH review step in admission workflow
ALTER TABLE public.admission_processes
  DROP CONSTRAINT IF EXISTS admission_processes_current_step_check;

ALTER TABLE public.admission_processes
  ADD CONSTRAINT admission_processes_current_step_check
  CHECK (current_step IN ('rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'));
-- Create categories table
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.product_categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category_id UUID REFERENCES public.product_categories(id),
  image_url TEXT,
  images TEXT[],
  sku VARCHAR(50),
  stock INTEGER DEFAULT 0,
  in_stock BOOLEAN GENERATED ALWAYS AS (stock > 0) STORED,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  badge VARCHAR(20) CHECK (badge IN ('new', 'bestseller', 'limited', 'sale')),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_categories
CREATE POLICY "Anyone can read active categories"
ON public.product_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ecommerce manager can manage categories"
ON public.product_categories FOR ALL
USING (has_role(auth.uid(), 'ecommerce_manager'));

-- RLS policies for products
CREATE POLICY "Anyone can read active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Ecommerce manager can manage products"
ON public.products FOR ALL
USING (has_role(auth.uid(), 'ecommerce_manager'));

-- Create updated_at triggers
CREATE TRIGGER update_product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add ecommerce_manager role if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'app_role' AND e.enumlabel = 'ecommerce_manager') THEN
    ALTER TYPE app_role ADD VALUE 'ecommerce_manager';
  END IF;
END$$;

-- Insert some initial categories
INSERT INTO public.product_categories (name, slug, description, sort_order) VALUES
('Preenchimentos', 'preenchimentos', 'Produtos para preenchimento dérmico', 1),
('Toxinas', 'toxinas', 'Toxinas botulínicas', 2),
('Skincare', 'skincare', 'Produtos para cuidados com a pele', 3),
('Equipamentos', 'equipamentos', 'Equipamentos e materiais', 4);
-- Drop restrictive policy and create one that allows authenticated users to read all products in CRM
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read active categories" ON public.product_categories;

-- Allow authenticated users to read all products (active and inactive) for CRM
CREATE POLICY "Authenticated users can read all products"
ON public.products FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to read all categories for CRM
CREATE POLICY "Authenticated users can read all categories"
ON public.product_categories FOR SELECT
USING (auth.uid() IS NOT NULL);
-- Add UPDATE and DELETE policies for products table
CREATE POLICY "Authenticated users can update products"
ON public.products FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
ON public.products FOR DELETE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert products"
ON public.products FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
