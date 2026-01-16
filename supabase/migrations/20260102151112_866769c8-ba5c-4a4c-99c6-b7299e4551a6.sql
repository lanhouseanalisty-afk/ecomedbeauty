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