-- =====================================================
-- EXPORTAÇÃO COMPLETA DE DADOS
-- Execute no SQL Editor do PROJETO ATUAL
-- =====================================================

-- Este script vai gerar comandos INSERT para copiar no projeto novo
-- IMPORTANTE: Execute cada seção separadamente e copie os resultados

-- =====================================================
-- SEÇÃO 1: LEADS
-- =====================================================

SELECT 
  'INSERT INTO public.leads (id, name, email, phone, source, topic, opt_in_marketing, lgpd_consent_at, created_at, updated_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || REPLACE(name, '''', '''''') || ''', ' ||
  '''' || REPLACE(email, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(phone, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(source, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(topic, '''', '''''') || '''', 'NULL') || ', ' ||
  opt_in_marketing || ', ' ||
  COALESCE('''' || lgpd_consent_at || '''::timestamptz', 'NULL') || ', ' ||
  '''' || created_at || '''::timestamptz, ' ||
  '''' || updated_at || '''::timestamptz);' as comando_sql
FROM public.leads;

-- =====================================================
-- SEÇÃO 2: CHAT_CONVERSATIONS
-- =====================================================

SELECT 
  'INSERT INTO public.chat_conversations (id, session_id, lead_id, created_at, updated_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || REPLACE(session_id, '''', '''''') || ''', ' ||
  COALESCE('''' || lead_id || '''::uuid', 'NULL') || ', ' ||
  '''' || created_at || '''::timestamptz, ' ||
  '''' || updated_at || '''::timestamptz);' as comando_sql
FROM public.chat_conversations;

-- =====================================================
-- SEÇÃO 3: CHAT_MESSAGES
-- =====================================================

SELECT 
  'INSERT INTO public.chat_messages (id, conversation_id, role, content, created_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || conversation_id || '''::uuid, ' ||
  '''' || role || ''', ' ||
  '''' || REPLACE(REPLACE(content, '''', ''''''), E'\n', '\n') || ''', ' ||
  '''' || created_at || '''::timestamptz);' as comando_sql
FROM public.chat_messages;

-- =====================================================
-- SEÇÃO 4: CRM_ACCOUNTS
-- =====================================================

SELECT 
  'INSERT INTO public.crm_accounts (id, name, cnpj, cpf, type, industry, website, phone, email, is_active, created_at, updated_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || REPLACE(name, '''', '''''') || ''', ' ||
  COALESCE('''' || cnpj || '''', 'NULL') || ', ' ||
  COALESCE('''' || cpf || '''', 'NULL') || ', ' ||
  COALESCE('''' || type || '''', 'NULL') || ', ' ||
  COALESCE('''' || industry || '''', 'NULL') || ', ' ||
  COALESCE('''' || website || '''', 'NULL') || ', ' ||
  COALESCE('''' || phone || '''', 'NULL') || ', ' ||
  COALESCE('''' || email || '''', 'NULL') || ', ' ||
  COALESCE(is_active::text, 'true') || ', ' ||
  '''' || created_at || '''::timestamptz, ' ||
  '''' || updated_at || '''::timestamptz);' as comando_sql
FROM public.crm_accounts;

-- =====================================================
-- SEÇÃO 5: CRM_CONTACTS
-- =====================================================

SELECT 
  'INSERT INTO public.crm_contacts (id, account_id, first_name, last_name, email, phone, mobile, position, department, is_primary, is_active, created_at, updated_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  COALESCE('''' || account_id || '''::uuid', 'NULL') || ', ' ||
  '''' || REPLACE(first_name, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(last_name, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || email || '''', 'NULL') || ', ' ||
  COALESCE('''' || phone || '''', 'NULL') || ', ' ||
  COALESCE('''' || mobile || '''', 'NULL') || ', ' ||
  COALESCE('''' || position || '''', 'NULL') || ', ' ||
  COALESCE('''' || department || '''', 'NULL') || ', ' ||
  COALESCE(is_primary::text, 'false') || ', ' ||
  COALESCE(is_active::text, 'true') || ', ' ||
  '''' || created_at || '''::timestamptz, ' ||
  '''' || updated_at || '''::timestamptz);' as comando_sql
FROM public.crm_contacts;

-- =====================================================
-- SEÇÃO 6: CRM_LEADS
-- =====================================================

SELECT 
  'INSERT INTO public.crm_leads (id, first_name, last_name, email, phone, company, position, source, status, score, created_at, updated_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || REPLACE(first_name, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(last_name, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || email || '''', 'NULL') || ', ' ||
  COALESCE('''' || phone || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(company, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || position || '''', 'NULL') || ', ' ||
  COALESCE('''' || source || '''', 'NULL') || ', ' ||
  '''' || COALESCE(status::text, 'new') || '''::crm_lead_status, ' ||
  COALESCE(score::text, '0') || ', ' ||
  '''' || created_at || '''::timestamptz, ' ||
  '''' || updated_at || '''::timestamptz);' as comando_sql
FROM public.crm_leads;

-- =====================================================
-- SEÇÃO 7: LEGAL_CONTRACTS
-- =====================================================

SELECT 
  'INSERT INTO public.legal_contracts (id, contract_number, title, type, status, party_name, value, start_date, end_date, renewal_notice_days, created_at, updated_at) VALUES (' ||
  '''' || id || '''::uuid, ' ||
  '''' || REPLACE(contract_number, '''', '''''') || ''', ' ||
  '''' || REPLACE(title, '''', '''''') || ''', ' ||
  '''' || type || ''', ' ||
  '''' || COALESCE(status::text, 'draft') || '''::contract_status, ' ||
  COALESCE('''' || REPLACE(party_name, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE(value::text, 'NULL') || ', ' ||
  COALESCE('''' || start_date || '''::date', 'NULL') || ', ' ||
  COALESCE('''' || end_date || '''::date', 'NULL') || ', ' ||
  COALESCE(renewal_notice_days::text, '30') || ', ' ||
  '''' || created_at || '''::timestamptz, ' ||
  '''' || updated_at || '''::timestamptz);' as comando_sql
FROM public.legal_contracts;

-- =====================================================
-- FIM - INSTRUÇÕES
-- =====================================================

SELECT '-- =====================================================' as info
UNION ALL SELECT '-- EXPORTAÇÃO CONCLUÍDA!'
UNION ALL SELECT '-- '
UNION ALL SELECT '-- COMO USAR:'
UNION ALL SELECT '-- 1. Execute cada SEÇÃO acima SEPARADAMENTE'
UNION ALL SELECT '-- 2. Para cada seção, COPIE os resultados da coluna "comando_sql"'
UNION ALL SELECT '-- 3. No PROJETO NOVO, cole e execute os comandos'
UNION ALL SELECT '-- '
UNION ALL SELECT '-- ORDEM DE EXECUÇÃO NO PROJETO NOVO:'
UNION ALL SELECT '-- 1. Execute full_schema.sql primeiro'
UNION ALL SELECT '-- 2. Execute os INSERTs de cada seção'
UNION ALL SELECT '-- 3. Execute sql_contracts_reminders.sql'
UNION ALL SELECT '-- =====================================================';
