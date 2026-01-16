-- Allow RH review step in admission workflow
ALTER TABLE public.admission_processes
  DROP CONSTRAINT IF EXISTS admission_processes_current_step_check;

ALTER TABLE public.admission_processes
  ADD CONSTRAINT admission_processes_current_step_check
  CHECK (current_step IN ('rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'));
