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