-- =====================================================
-- SCRIPT DE EXPORTAÇÃO DE DADOS - VERSÃO SIMPLIFICADA
-- Execute este script no PROJETO ANTIGO para exportar os dados
-- =====================================================

-- Este script vai listar todas as tabelas e seus dados
-- Copie o resultado e execute no projeto novo

-- =====================================================
-- PARTE 1: GERAR LISTA DE TABELAS
-- =====================================================

SELECT 
  '-- Tabela: ' || tablename as info
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;

-- =====================================================
-- PARTE 2: EXPORTAR DADOS DAS PRINCIPAIS TABELAS
-- =====================================================

-- LEADS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    RAISE NOTICE 'Exportando tabela: leads';
  END IF;
END $$;

SELECT 
  'INSERT INTO public.leads (id, name, email, phone, source, topic, opt_in_marketing, lgpd_consent_at, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(name) || ', ' ||
  quote_literal(email) || ', ' ||
  COALESCE(quote_literal(phone), 'NULL') || ', ' ||
  COALESCE(quote_literal(source), 'NULL') || ', ' ||
  COALESCE(quote_literal(topic), 'NULL') || ', ' ||
  opt_in_marketing || ', ' ||
  COALESCE(quote_literal(lgpd_consent_at::text), 'NULL') || '::timestamptz, ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM public.leads
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads');

-- CRM_ACCOUNTS
SELECT 
  'INSERT INTO public.crm_accounts (id, name, cnpj, cpf, type, industry, website, phone, email, address, owner_id, sap_card_code, salesforce_id, annual_revenue, employee_count, is_active, tags, custom_fields, lgpd_consent_at, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(cnpj), 'NULL') || ', ' ||
  COALESCE(quote_literal(cpf), 'NULL') || ', ' ||
  COALESCE(quote_literal(type), 'NULL') || ', ' ||
  COALESCE(quote_literal(industry), 'NULL') || ', ' ||
  COALESCE(quote_literal(website), 'NULL') || ', ' ||
  COALESCE(quote_literal(phone), 'NULL') || ', ' ||
  COALESCE(quote_literal(email), 'NULL') || ', ' ||
  COALESCE(quote_literal(address::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(owner_id::text), 'NULL') || '::uuid, ' ||
  COALESCE(quote_literal(sap_card_code), 'NULL') || ', ' ||
  COALESCE(quote_literal(salesforce_id), 'NULL') || ', ' ||
  COALESCE(annual_revenue::text, 'NULL') || ', ' ||
  COALESCE(employee_count::text, 'NULL') || ', ' ||
  COALESCE(is_active::text, 'true') || ', ' ||
  COALESCE(quote_literal(tags::text), 'NULL') || '::text[], ' ||
  COALESCE(quote_literal(custom_fields::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(lgpd_consent_at::text), 'NULL') || '::timestamptz, ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM public.crm_accounts
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crm_accounts');

-- CRM_CONTACTS
SELECT 
  'INSERT INTO public.crm_contacts (id, account_id, first_name, last_name, email, phone, mobile, position, department, is_primary, is_active, address, social_profiles, preferences, lgpd_consent_at, opt_in_marketing, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  COALESCE(quote_literal(account_id::text), 'NULL') || '::uuid, ' ||
  quote_literal(first_name) || ', ' ||
  COALESCE(quote_literal(last_name), 'NULL') || ', ' ||
  COALESCE(quote_literal(email), 'NULL') || ', ' ||
  COALESCE(quote_literal(phone), 'NULL') || ', ' ||
  COALESCE(quote_literal(mobile), 'NULL') || ', ' ||
  COALESCE(quote_literal(position), 'NULL') || ', ' ||
  COALESCE(quote_literal(department), 'NULL') || ', ' ||
  COALESCE(is_primary::text, 'false') || ', ' ||
  COALESCE(is_active::text, 'true') || ', ' ||
  COALESCE(quote_literal(address::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(social_profiles::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(preferences::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(lgpd_consent_at::text), 'NULL') || '::timestamptz, ' ||
  COALESCE(opt_in_marketing::text, 'false') || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM public.crm_contacts
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crm_contacts');

-- CRM_LEADS
SELECT 
  'INSERT INTO public.crm_leads (id, first_name, last_name, email, phone, company, position, source, source_detail, utm_params, status, score, owner_id, converted_account_id, converted_contact_id, converted_at, notes, custom_fields, lgpd_consent_at, opt_in_marketing, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(first_name) || ', ' ||
  COALESCE(quote_literal(last_name), 'NULL') || ', ' ||
  COALESCE(quote_literal(email), 'NULL') || ', ' ||
  COALESCE(quote_literal(phone), 'NULL') || ', ' ||
  COALESCE(quote_literal(company), 'NULL') || ', ' ||
  COALESCE(quote_literal(position), 'NULL') || ', ' ||
  COALESCE(quote_literal(source), 'NULL') || ', ' ||
  COALESCE(quote_literal(source_detail), 'NULL') || ', ' ||
  COALESCE(quote_literal(utm_params::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(status::text), '''new''') || '::crm_lead_status, ' ||
  COALESCE(score::text, '0') || ', ' ||
  COALESCE(quote_literal(owner_id::text), 'NULL') || '::uuid, ' ||
  COALESCE(quote_literal(converted_account_id::text), 'NULL') || '::uuid, ' ||
  COALESCE(quote_literal(converted_contact_id::text), 'NULL') || '::uuid, ' ||
  COALESCE(quote_literal(converted_at::text), 'NULL') || '::timestamptz, ' ||
  COALESCE(quote_literal(notes), 'NULL') || ', ' ||
  COALESCE(quote_literal(custom_fields::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(lgpd_consent_at::text), 'NULL') || '::timestamptz, ' ||
  COALESCE(opt_in_marketing::text, 'false') || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM public.crm_leads
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crm_leads');

-- LEGAL_CONTRACTS
SELECT 
  'INSERT INTO public.legal_contracts (id, contract_number, title, type, status, party_account_id, party_name, party_document, value, currency, payment_terms, start_date, end_date, auto_renew, renewal_notice_days, responsible_id, document_url, signed_document_url, signed_at, signers, terms_summary, special_clauses, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(contract_number) || ', ' ||
  quote_literal(title) || ', ' ||
  quote_literal(type) || ', ' ||
  COALESCE(quote_literal(status::text), '''draft''') || '::contract_status, ' ||
  COALESCE(quote_literal(party_account_id::text), 'NULL') || '::uuid, ' ||
  COALESCE(quote_literal(party_name), 'NULL') || ', ' ||
  COALESCE(quote_literal(party_document), 'NULL') || ', ' ||
  COALESCE(value::text, 'NULL') || ', ' ||
  COALESCE(quote_literal(currency), '''BRL''') || ', ' ||
  COALESCE(quote_literal(payment_terms), 'NULL') || ', ' ||
  COALESCE(quote_literal(start_date::text), 'NULL') || '::date, ' ||
  COALESCE(quote_literal(end_date::text), 'NULL') || '::date, ' ||
  COALESCE(auto_renew::text, 'false') || ', ' ||
  COALESCE(renewal_notice_days::text, '30') || ', ' ||
  COALESCE(quote_literal(responsible_id::text), 'NULL') || '::uuid, ' ||
  COALESCE(quote_literal(document_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(signed_document_url), 'NULL') || ', ' ||
  COALESCE(quote_literal(signed_at::text), 'NULL') || '::timestamptz, ' ||
  COALESCE(quote_literal(signers::text), 'NULL') || '::jsonb, ' ||
  COALESCE(quote_literal(terms_summary), 'NULL') || ', ' ||
  COALESCE(quote_literal(special_clauses), 'NULL') || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM public.legal_contracts
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_contracts');

-- CHAT_CONVERSATIONS
SELECT 
  'INSERT INTO public.chat_conversations (id, session_id, lead_id, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(session_id) || ', ' ||
  COALESCE(quote_literal(lead_id::text), 'NULL') || '::uuid, ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM public.chat_conversations
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_conversations');

-- CHAT_MESSAGES
SELECT 
  'INSERT INTO public.chat_messages (id, conversation_id, role, content, created_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(conversation_id::text) || '::uuid, ' ||
  quote_literal(role) || ', ' ||
  quote_literal(content) || ', ' ||
  quote_literal(created_at::text) || '::timestamptz);'
FROM public.chat_messages
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages');

-- =====================================================
-- INSTRUÇÕES FINAIS
-- =====================================================

SELECT '-- =====================================================' AS instrucoes
UNION ALL SELECT '-- EXPORTAÇÃO CONCLUÍDA!'
UNION ALL SELECT '-- '
UNION ALL SELECT '-- PRÓXIMOS PASSOS:'
UNION ALL SELECT '-- 1. Copie todo o resultado acima'
UNION ALL SELECT '-- 2. No PROJETO NOVO, execute primeiro o full_schema.sql'
UNION ALL SELECT '-- 3. Depois execute este script de dados'
UNION ALL SELECT '-- 4. Execute o sql_contracts_reminders.sql'
UNION ALL SELECT '-- =====================================================';
