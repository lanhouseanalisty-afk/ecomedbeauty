-- Create notices table
create table public.notices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  priority text check (priority in ('urgent', 'notice', 'info')) default 'info',
  target_sector text, -- Null values imply 'General/All Sectors'
  created_by uuid references auth.users(id),
  active boolean default true
);

-- RLS Policies
alter table public.notices enable row level security;

-- Everyone can read active notices
create policy "Everyone can read active notices"
  on public.notices for select
  using (active = true);

-- Only admins and sector managers can insert (simplified for now to authenticated)
create policy "Authenticated users can create notices"
  on public.notices for insert
  with check (auth.role() = 'authenticated');

-- Only admins/creators can update/delete
create policy "Creators can update their notices"
  on public.notices for update
  using (auth.uid() = created_by);
