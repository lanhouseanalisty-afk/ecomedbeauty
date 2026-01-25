-- Tabela para armazenar configurações do sistema (chaves de API, etc.)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ler
CREATE POLICY "Admins can read settings"
ON public.system_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Política: Apenas admins podem inserir
CREATE POLICY "Admins can insert settings"
ON public.system_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Política: Apenas admins podem atualizar
CREATE POLICY "Admins can update settings"
ON public.system_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Política: Apenas admins podem deletar
CREATE POLICY "Admins can delete settings"
ON public.system_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.system_settings (key, value, description, category) VALUES
  ('google_maps_api_key', '', 'Chave da API do Google Maps para busca de leads', 'api_keys'),
  ('instagram_api_token', '', 'Token da API do Instagram para busca de leads', 'api_keys'),
  ('linkedin_api_key', '', 'Chave da API do LinkedIn para busca de leads', 'api_keys')
ON CONFLICT (key) DO NOTHING;

-- Comentário na tabela
COMMENT ON TABLE public.system_settings IS 'Configurações do sistema, incluindo chaves de API e outras configurações globais';
