-- Teste de liberação bruta da tabela (Para Isolar o Erro de RLS)
DROP POLICY IF EXISTS "Everyone can read active notices" ON public.notices;
DROP POLICY IF EXISTS "Authenticated users can create notices" ON public.notices;
DROP POLICY IF EXISTS "Creators and Admins/HR can modify notices" ON public.notices;

-- Leitura Total Temporaria
CREATE POLICY "Everyone can read active notices" 
  ON public.notices FOR SELECT 
  USING (true);

-- Escrita Total Temporaria
CREATE POLICY "Authenticated users can create notices" 
  ON public.notices FOR INSERT 
  WITH CHECK (true);

-- Update Total Temporario (Bypassa qualquer role baseada em UID)
CREATE POLICY "Creators and Admins/HR can modify notices" 
  ON public.notices FOR UPDATE 
  USING (true)
  WITH CHECK (true);
