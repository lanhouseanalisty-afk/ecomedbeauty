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