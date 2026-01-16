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