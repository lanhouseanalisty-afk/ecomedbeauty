
-- Adicionar coluna email na tabela consultores para vínculo com usuário
ALTER TABLE consultores 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Opcional: Criar índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_consultores_email ON consultores(email);

-- Exemplo de vínculo (O USUÁRIO TEM QUE RODAR ISSO MANUALMENTE COM OS EMAILS REAIS)
-- UPDATE consultores SET email = 'usuario@exemplo.com' WHERE nome = 'Nome do Consultor';
