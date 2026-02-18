-- Adicionando colunas faltantes na tabela legal_contracts
-- Para alinhar com o uso no Frontend e no Dashboard

DO $$
BEGIN
    -- 1. Coluna description (Objeto/Descrição)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_contracts' AND column_name = 'description') THEN
        ALTER TABLE public.legal_contracts ADD COLUMN description TEXT;
    END IF;

    -- 2. Coluna sap_request_id (ID SAP)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_contracts' AND column_name = 'sap_request_id') THEN
        ALTER TABLE public.legal_contracts ADD COLUMN sap_request_id TEXT;
    END IF;

    -- 3. Coluna department_id (UUID) - Caso não tenha sido criada corretamente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_contracts' AND column_name = 'department_id') THEN
        ALTER TABLE public.legal_contracts ADD COLUMN department_id UUID REFERENCES public.departments(id);
    END IF;
    
    -- 4. Copiar dados de terms_summary para description se terms_summary existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'legal_contracts' AND column_name = 'terms_summary') THEN
        UPDATE public.legal_contracts SET description = terms_summary WHERE description IS NULL;
    END IF;

    -- 5. Copiar dados de payment_terms para sap_request_id se houver confusão de nomes anterior
    -- (Opcional, mas útil se o form estava salvando trocado)
    UPDATE public.legal_contracts SET sap_request_id = payment_terms WHERE sap_request_id IS NULL AND payment_terms LIKE 'REQ-%';

END $$;
