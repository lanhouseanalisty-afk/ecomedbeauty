
-- Tabela de Consultores (Ex: Jean)
CREATE TABLE IF NOT EXISTS consultores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Configuração do Mês (Metas, Previsão via input)
CREATE TABLE IF NOT EXISTS mes_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  meta DECIMAL(18,2),
  previsao DECIMAL(18,2), -- Previsão manual/macro
  meta_adicional DECIMAL(18,2),
  campanha BOOLEAN DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(ano, mes)
);

-- Tabela de Lançamentos Diários (Valor realizado/forecast por dia)
CREATE TABLE IF NOT EXISTS lancamentos_diarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultor_id UUID REFERENCES consultores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  valor DECIMAL(18,2), -- Valor realizado
  etiqueta TEXT, -- 'feriado', 'campanha', 'sabado'
  origem TEXT, -- 'import-xlsx', 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(consultor_id, data)
);

-- Auditoria (Simples)
CREATE TABLE IF NOT EXISTS auditoria_planilha (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor TEXT, -- usuario que fez a ação
  acao TEXT, -- CREATE, UPDATE, DELETE, IMPORT
  entidade TEXT, -- Tabela afetada
  detalhes JSONB, -- Dados antes/depois
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seeding inicial (Opcional, para testes)
INSERT INTO consultores (nome) VALUES ('Jean') ON CONFLICT DO NOTHING;
