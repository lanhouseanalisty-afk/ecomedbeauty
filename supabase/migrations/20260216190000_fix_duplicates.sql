-- Migration to CLEAN DUPLICATES from contracts (Templates and Active Drafts)
-- Run this in Supabase SQL Editor to fix repeating headers/footers.

DO $$
DECLARE
    -- Define the HEADER block exactly as used before
    v_header TEXT := 'Pelo presente instrumento particular, de um lado:

CONTRATANTE: {{CONTRATANTE_NOME}}, inscrito(a) no CNPJ/CPF sob nº {{CONTRATANTE_DOC}}, com sede/endereço à {{CONTRATANTE_ENDERECO}}, neste ato representado por {{CONTRATANTE_REPRESENTANTE}}, doravante denominado(a) simplesmente CONTRATANTE;

E, de outro lado:

CONTRATADO: {{CONTRATADO_NOME}}, inscrito(a) no CNPJ/CPF sob nº {{CONTRATADO_DOC}}, com sede/endereço à {{CONTRATADO_ENDERECO}}, neste ato representado por {{CONTRATADO_REPRESENTANTE}}, doravante denominado(a) simplesmente CONTRATADO;

Têm entre si, justo e contratado, o presente Contrato de Prestação de Serviços Profissionais, que se regerá pelas cláusulas e condições seguintes:

';

    -- Define the FOOTER block exactly as used before
    v_footer TEXT := '

E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em ___ (_____) vias de igual teor e forma, na presença de duas testemunhas, para que produza seus jurídicos e legais efeitos.

{{CIDADE}}, ___ de ___________________ de ______.

<br>

CONTRATANTE:

Nome: {{CONTRATANTE_NOME}}
CPF/CNPJ: {{CONTRATANTE_DOC}}
Cargo (se aplicável): {{CONTRATANTE_CARGO}}

<br>

CONTRATADO:

Nome: {{CONTRATADO_NOME}}
CPF/CNPJ: {{CONTRATADO_DOC}}

<br><br>

TESTEMUNHAS:

Nome: {{TESTEMUNHA1_NOME}}
CPF: {{TESTEMUNHA1_CPF}}

Nome: {{TESTEMUNHA2_NOME}}
CPF: {{TESTEMUNHA2_CPF}}
';

BEGIN
    -- 1. CLEAN TEMPLATES (contract_templates.content)
    -- Remove ALL occurrences first to clear duplicates
    UPDATE public.contract_templates
    SET content = REPLACE(content, v_header, '');

    UPDATE public.contract_templates
    SET content = REPLACE(content, v_footer, '');

    -- Remove any remaining "-- HEADER" comments
    UPDATE public.contract_templates
    SET content = REPLACE(content, '-- HEADER', '');

    -- Add ONE header and ONE footer back correctly
    UPDATE public.contract_templates
    SET content = v_header || content || v_footer
    WHERE active = true;


    -- 2. CLEAN ACTIVE DRAFTS (legal_contracts.terms_summary)
    -- Note: The column is 'terms_summary', not 'description'!
    
    -- Remove ALL occurrences from current drafts so users don't see duplicates
    UPDATE public.legal_contracts
    SET terms_summary = REPLACE(terms_summary, v_header, '')
    WHERE status = 'draft';

    UPDATE public.legal_contracts
    SET terms_summary = REPLACE(terms_summary, v_footer, '')
    WHERE status = 'draft';

    UPDATE public.legal_contracts
    SET terms_summary = REPLACE(terms_summary, '-- HEADER', '')
    WHERE status = 'draft';

    -- Add ONE header and ONE footer back to drafts
    UPDATE public.legal_contracts
    SET terms_summary = v_header || terms_summary || v_footer
    WHERE status = 'draft';

END $$;
