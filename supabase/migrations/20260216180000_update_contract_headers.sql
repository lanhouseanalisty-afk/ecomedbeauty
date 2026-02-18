-- Migration to standardize contract LOGO, HEADERS and FOOTERS
-- Run this in your Supabase SQL Editor to update ALL contract templates.

UPDATE public.contract_templates
SET content = 
-- LOGO (Assuming the image is accessible relative to the app root or via a public URL)
-- Using a relative path which usually works for PDF generation if handled correctly, or standard HTML display.
'<div style="text-align: center; margin-bottom: 2rem;">
    <img src="/skinstore-logo.png" alt="SKYNSTORE S.A." style="max-height: 80px;" />
</div>

-- HEADER
Pelo presente instrumento particular, de um lado:

CONTRATANTE: {{CONTRATANTE_NOME}}, inscrito(a) no CNPJ/CPF sob nº {{CONTRATANTE_DOC}}, com sede/endereço à {{CONTRATANTE_ENDERECO}}, neste ato representado por {{CONTRATANTE_REPRESENTANTE}}, doravante denominado(a) simplesmente CONTRATANTE;

E, de outro lado:

CONTRATADO: {{CONTRATADO_NOME}}, inscrito(a) no CNPJ/CPF sob nº {{CONTRATADO_DOC}}, com sede/endereço à {{CONTRATADO_ENDERECO}}, neste ato representado por {{CONTRATADO_REPRESENTANTE}}, doravante denominado(a) simplesmente CONTRATADO;

Têm entre si, justo e contratado, o presente Contrato de Prestação de Serviços Profissionais, que se regerá pelas cláusulas e condições seguintes:

' || content || 
-- FOOTER
'

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
'
WHERE active = true;
