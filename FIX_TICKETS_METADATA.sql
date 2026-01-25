-- FIX_TICKETS_METADATA.sql
-- Adiciona a coluna metadata na tabela tickets para suportar Setor, Horário e Print

ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
