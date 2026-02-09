-- Create sector_requests table for generic internal requests
create table public.sector_requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  title text not null,
  description text,
  
  source_sector text not null,
  target_sector text not null, -- 'tech', 'marketing', 'rh', etc.
  
  priority text check (priority in ('urgent', 'high', 'medium', 'low')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed', 'rejected')) default 'pending',
  
  sla_hours integer default 24,
  due_at timestamp with time zone,
  
  assigned_to uuid references auth.users(id),
  created_by uuid references auth.users(id)
);

-- Comments/History for requests
create table public.request_comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  request_id uuid references public.sector_requests(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  is_internal boolean default false -- If true, visible only to target sector team
);

-- RLS Policies
alter table public.sector_requests enable row level security;
alter table public.request_comments enable row level security;

-- Policies for requests
create policy "Users can view their requests or requests to their sector"
  on public.sector_requests for select
  using (
    auth.uid() = created_by or 
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'department_code' = target_sector or
    auth.uid() = assigned_to
    -- ideally checking user_roles or a generic 'department' field in auth.users
  );

create policy "Authenticated users can create requests"
  on public.sector_requests for insert
  with check (auth.role() = 'authenticated');

create policy "Target sector can update status and assignment"
  on public.sector_requests for update
  using (true); -- Simplified for prototype, ideally strictly filtering by role matches target_sector

-- Triggers
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_sector_requests_updated_at
  before update on public.sector_requests
  for each row execute procedure update_updated_at();

-- Calculate due_at based on SLA hours on insert
create or replace function set_request_sla()
returns trigger as $$
begin
  if new.sla_hours is not null then
    new.due_at = now() + (new.sla_hours || ' hours')::interval;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_request_sla_trigger
  before insert on public.sector_requests
  for each row execute procedure set_request_sla();
