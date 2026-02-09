-- Create documents table for internal library
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  title text not null,
  description text,
  
  category text check (category in ('manual', 'video', 'onboarding', 'policy')) default 'manual',
  
  -- Can be a direct link (e.g. YouTube, PDF url) or rich text content
  content_type text check (content_type in ('url', 'text')) default 'text',
  content text not null, 
  
  target_sector text, -- Null = All, or specific sector like 'tech'
  
  created_by uuid references auth.users(id),
  active boolean default true
);

-- RLS
alter table public.documents enable row level security;

create policy "Everyone can read active documents"
  on public.documents for select
  using (active = true);

create policy "Admins can manage documents"
  on public.documents for all
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Basic trigger for updated_at
create trigger update_documents_updated_at
  before update on public.documents
  for each row execute procedure update_updated_at();
