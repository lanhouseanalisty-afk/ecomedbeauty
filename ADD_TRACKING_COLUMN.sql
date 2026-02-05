-- Adicionar coluna de rastreio na tabela de marketing_requests
ALTER TABLE IF EXISTS marketing_requests 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Comentário para facilitar identificação
COMMENT ON COLUMN marketing_requests.tracking_number IS 'Código de rastreio do envio (Logística)';
