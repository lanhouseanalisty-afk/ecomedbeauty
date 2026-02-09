
-- ADD_MISSING_COLUMNS.sql
-- Adiciona colunas faltantes na tabela tech_assets para suportar a importação do legado

ALTER TABLE public.tech_assets 
ADD COLUMN IF NOT EXISTS hostname TEXT,
ADD COLUMN IF NOT EXISTS company TEXT;

-- Atualiza permissões caso necessário (geralmente automático para novas colunas, mas garantindo)
GRANT ALL ON TABLE public.tech_assets TO authenticated;
GRANT ALL ON TABLE public.tech_assets TO service_role;
