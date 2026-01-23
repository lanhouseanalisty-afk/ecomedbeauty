# 🎯 Busca de Leads - Configuração Rápida

## ✅ O que já está funcionando

- ✅ Interface completa de busca de leads
- ✅ Busca no Google Maps, Instagram e LinkedIn
- ✅ Seleção e importação de leads
- ✅ **Dados de demonstração** (funcionando agora mesmo!)

## 🚀 Para usar APIs reais

### Opção 1: Começar com Google Maps (Recomendado)

1. **Instale o Supabase CLI:**
```bash
npm install -g supabase
```

2. **Faça login e link ao projeto:**
```bash
supabase login
supabase link --project-ref SEU_PROJECT_ID
```

3. **Deploy da função Google Maps:**
```bash
supabase functions deploy search-leads-google-maps
```

4. **Configure a API Key do Google:**
   - Acesse: https://console.cloud.google.com/
   - Ative a **Places API**
   - Crie uma API Key
   - Configure no Supabase:
```bash
supabase secrets set GOOGLE_PLACES_API_KEY=sua_api_key_aqui
```

5. **Teste!**
   - A busca agora usará dados reais do Google Maps
   - Você tem **$200 de crédito grátis/mês** (~28.500 buscas)

### Opção 2: Continuar com dados de demonstração

- Não precisa fazer nada!
- A busca já funciona com dados simulados
- Perfeito para testar e demonstrar o sistema

## 📖 Documentação Completa

Veja o arquivo `LEAD_SEARCH_API_SETUP.md` para:
- Configuração detalhada de todas as APIs
- Custos e limites
- Alternativas econômicas
- Troubleshooting

## 💡 Dica

Comece com os dados de demonstração e configure as APIs reais quando precisar de dados verdadeiros!
