-- =====================================================
-- VERIFICAR QUAIS TABELAS TÊM DADOS
-- Execute este script primeiro para ver o que precisa exportar
-- =====================================================

SELECT 
  'leads' as tabela,
  COUNT(*) as total_registros
FROM public.leads
UNION ALL
SELECT 
  'chat_conversations' as tabela,
  COUNT(*) as total_registros
FROM public.chat_conversations
UNION ALL
SELECT 
  'chat_messages' as tabela,
  COUNT(*) as total_registros
FROM public.chat_messages
UNION ALL
SELECT 
  'crm_accounts' as tabela,
  COUNT(*) as total_registros
FROM public.crm_accounts
UNION ALL
SELECT 
  'crm_contacts' as tabela,
  COUNT(*) as total_registros
FROM public.crm_contacts
UNION ALL
SELECT 
  'crm_leads' as tabela,
  COUNT(*) as total_registros
FROM public.crm_leads
UNION ALL
SELECT 
  'crm_opportunities' as tabela,
  COUNT(*) as total_registros
FROM public.crm_opportunities
UNION ALL
SELECT 
  'legal_contracts' as tabela,
  COUNT(*) as total_registros
FROM public.legal_contracts
UNION ALL
SELECT 
  'employees' as tabela,
  COUNT(*) as total_registros
FROM public.employees
UNION ALL
SELECT 
  'departments' as tabela,
  COUNT(*) as total_registros
FROM public.departments
ORDER BY total_registros DESC;
