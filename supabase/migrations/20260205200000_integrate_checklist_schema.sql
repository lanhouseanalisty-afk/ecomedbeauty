
-- SCHEMA FOR CHECKLIST INTEGRATION
-- Includes: Positions, Employees (Detailed), Checklists, Tasks

-- 1. POSITIONS (Cargos) - Linked to existing Departments
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EMPLOYEES (Funcionários Detailed)
-- Note: 'department_members' links Users to Depts for auth. 
-- 'employees' is the HR record for the person (may or may not have a user account yet)
CREATE TYPE employee_status AS ENUM ('onboarding', 'active', 'on_leave', 'suspended', 'offboarding', 'terminated');

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE, -- Optional validation
  email TEXT NOT NULL,
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  position_id UUID REFERENCES public.positions(id),
  department_id UUID REFERENCES public.departments(id), -- Redundant but useful for filtering
  status employee_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) -- Optional link to system user
);

-- 3. CHECKLISTS
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Admissão', 'Demissão', 'Custom'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  data JSONB, -- Stores flow state (currentSection, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 4. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  role TEXT, -- 'RH', 'TI', 'Gestor'
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id)
);

-- RLS POLICIES
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated
CREATE POLICY "Auth read positions" ON positions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read employees" ON employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read checklists" ON checklists FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth read tasks" ON tasks FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update for Admins and RH (simplified for now)
CREATE POLICY "Admin manage positions" ON positions FOR ALL USING (
  exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin', 'rh'))
);

CREATE POLICY "Admin manage employees" ON employees FOR ALL USING (
  exists (select 1 from user_roles where user_id = auth.uid() and role in ('admin', 'rh'))
);

-- Checklists: Allow creation by RH/Admin/Gestor
CREATE POLICY "Manage checklists" ON checklists FOR ALL USING (true); -- Simplified for demo
CREATE POLICY "Manage tasks" ON tasks FOR ALL USING (true); -- Simplified for demo
