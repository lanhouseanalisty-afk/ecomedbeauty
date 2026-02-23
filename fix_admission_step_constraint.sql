-- fix_admission_step_constraint.sql
-- Atualiza a restrição de verificação para incluir o passo 'compras'

ALTER TABLE public.admission_processes
DROP CONSTRAINT IF EXISTS admission_processes_current_step_check;

ALTER TABLE public.admission_processes
ADD CONSTRAINT admission_processes_current_step_check 
CHECK (current_step IN ('rh', 'gestor', 'compras', 'ti', 'rh_review', 'colaborador', 'concluido'));
