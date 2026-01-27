-- Create termination_processes table
create table if not exists public.termination_processes (
  id uuid default gen_random_uuid() primary key,
  
  -- Employee Info
  employee_id uuid references public.employees(id),
  employee_name text not null,
  department text,
  "position" text,
  manager_name text,
  
  -- Workflow Status
  current_step text not null default 'rh' check (current_step in ('rh', 'gestor', 'ti', 'dp', 'concluido')),
  status text not null default 'in_progress' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  
  -- RH Section
  notice_date date,
  last_day date,
  reason text,
  notice_type text,
  hr_observations text,
  equipment_list text, -- Lista de equipamentos (importado da admissão ou manual)
  
  -- Manager Section
  equipment_returned text check (equipment_returned in ('Sim', 'Nao', 'Parcial')),
  pending_items text,
  backup_done boolean default false,
  project_transferred boolean default false,
  access_keys_returned boolean default false,
  manager_observations text,
  
  -- TI Section
  ad_blocked boolean default false,
  email_blocked boolean default false,
  vpn_revoked boolean default false,
  licenses_removed boolean default false,
  equipment_collected boolean default false,
  ti_observations text,
  
  -- DP Section
  exam_status text,
  exam_date date,
  severance_calc_status text,
  payment_date date,
  ctps_lowered boolean default false,
  esocial_sent boolean default false,
  final_observations text,
  
  -- Metadata
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.termination_processes enable row level security;

-- Policies (Adjust strictly as needed, simple for now)
create policy "Enable read access for authenticated users"
  on public.termination_processes for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users"
  on public.termination_processes for insert
  to authenticated
  with check (true);

create policy "Enable update for authenticated users"
  on public.termination_processes for update
  to authenticated
  using (true);

-- Create termination_notifications table (Optional, but good for workflow)
create table if not exists public.termination_notifications (
  id uuid default gen_random_uuid() primary key,
  termination_process_id uuid references public.termination_processes(id) on delete cascade,
  target_step text not null,
  target_email text,
  notification_type text default 'step_pending',
  status text default 'pending', -- pending, sent, failed
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  sent_at timestamptz
);

alter table public.termination_notifications enable row level security;

create policy "Enable all for authenticated users"
  on public.termination_notifications for all
  to authenticated
  using (true);
