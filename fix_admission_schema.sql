-- Add missing columns for Section 3 (TI) and Section 2 (Manager) to admission_processes
ALTER TABLE public.admission_processes 
ADD COLUMN IF NOT EXISTS needs_laptop BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_monitor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_headset BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_keyboard BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_mouse BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_printer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS buddy_mentor TEXT,
ADD COLUMN IF NOT EXISTS software_list TEXT[],
ADD COLUMN IF NOT EXISTS systems_list TEXT[],
ADD COLUMN IF NOT EXISTS shared_folders TEXT[],
ADD COLUMN IF NOT EXISTS manager_observations TEXT,
ADD COLUMN IF NOT EXISTS email_created TEXT,
ADD COLUMN IF NOT EXISTS user_ad_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS microsoft_licenses TEXT[],
ADD COLUMN IF NOT EXISTS vpn_configured TEXT,
ADD COLUMN IF NOT EXISTS sap_user_created TEXT,
ADD COLUMN IF NOT EXISTS salesforce_profile_created TEXT,
ADD COLUMN IF NOT EXISTS network_folders_released TEXT,
ADD COLUMN IF NOT EXISTS printers_configured TEXT,
ADD COLUMN IF NOT EXISTS general_tests_done TEXT,
ADD COLUMN IF NOT EXISTS it_responsible TEXT,
ADD COLUMN IF NOT EXISTS it_completion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS it_observations TEXT;

-- Update current_step check constraint to include 'rh_review' if not already present
-- Note: We drop and recreate because there's no "ADD TO CHECK" command
ALTER TABLE public.admission_processes
DROP CONSTRAINT IF EXISTS admission_processes_current_step_check;

ALTER TABLE public.admission_processes
ADD CONSTRAINT admission_processes_current_step_check 
CHECK (current_step IN ('rh', 'gestor', 'ti', 'rh_review', 'colaborador', 'concluido'));

-- Ensure target_department index exists
CREATE INDEX IF NOT EXISTS idx_admission_target_dept ON public.admission_processes(target_department);
