# Configuração de Busca de Leads - APIs Externas

Este guia explica como configurar as APIs para busca de leads no Google Maps, Instagram e LinkedIn.

## 📋 Pré-requisitos

- Conta no Supabase
- Supabase CLI instalado
- Contas de desenvolvedor nas plataformas (Google, Meta, LinkedIn)

## 🔧 Passo 1: Instalar Supabase CLI

```bash
npm install -g supabase
```

## 🚀 Passo 2: Deploy das Edge Functions

### 2.1. Login no Supabase
```bash
supabase login
```

### 2.2. Link ao seu projeto
```bash
supabase link --project-ref SEU_PROJECT_ID
```

### 2.3. Deploy das funções
```bash
supabase functions deploy search-leads-google-maps
supabase functions deploy search-leads-instagram
supabase functions deploy search-leads-linkedin
```

## 🔑 Passo 3: Configurar API Keys

### 3.1. Google Places API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Places API** e **Places API (New)**
4. Crie credenciais (API Key)
5. Configure a API Key no Supabase:

```bash
supabase secrets set GOOGLE_PLACES_API_KEY=sua_api_key_aqui
```

**Importante:** Restrinja a API Key para aceitar apenas requisições do domínio do Supabase.

### 3.2. Instagram Graph API (Opcional)

1. Acesse o [Meta for Developers](https://developers.facebook.com/)
2. Crie um app
3. Adicione o produto "Instagram Basic Display"
4. Gere um Access Token
5. Configure no Supabase:

```bash
supabase secrets set INSTAGRAM_ACCESS_TOKEN=seu_token_aqui
```

**Nota:** A API do Instagram tem limitações para busca pública. Considere usar scraping ético ou ferramentas de terceiros.

### 3.3. LinkedIn API (Opcional)

1. Acesse o [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Crie um app
3. Solicite acesso à API de People Search
4. Gere um Access Token OAuth 2.0
5. Configure no Supabase:

```bash
supabase secrets set LINKEDIN_ACCESS_TOKEN=seu_token_aqui
```

**Nota:** A API do LinkedIn requer aprovação e tem custos. Considere usar LinkedIn Sales Navigator API ou ferramentas de terceiros.

## 🧪 Passo 4: Testar as Funções

### Testar Google Maps
```bash
supabase functions invoke search-leads-google-maps --data '{"query":"clínicas estéticas","location":"São Paulo, SP"}'
```

### Testar Instagram
```bash
supabase functions invoke search-leads-instagram --data '{"username":"exemplo"}'
```

### Testar LinkedIn
```bash
supabase functions invoke search-leads-linkedin --data '{"keywords":"gerente","company":"empresa"}'
```

## 💰 Custos Estimados

### Google Places API
- **Gratuito:** 
  - $200 de crédito mensal
  - ~28.500 requisições de Text Search por mês
- **Pago:** $0.032 por requisição de Text Search
- **Detalhes:** $0.017 por requisição de Place Details

### Instagram Graph API
- **Gratuito:** Uso básico
- **Limitações:** Rate limits e restrições de busca

### LinkedIn API
- **Pago:** Requer LinkedIn Sales Navigator ou planos enterprise
- **Custo:** Variável, geralmente $79.99+/mês

## 🔒 Segurança

1. **Nunca exponha API Keys no frontend**
2. **Use Edge Functions** para manter as keys seguras
3. **Configure rate limiting** no Supabase
4. **Monitore o uso** para evitar custos inesperados

## 📊 Alternativas Econômicas

### Para Google Maps:
- Use a versão gratuita com limite de 28.500 requisições/mês
- Implemente cache de resultados

### Para Instagram:
- Use scraping ético com bibliotecas como `instagram-scraper`
- Considere ferramentas de terceiros como Apify

### Para LinkedIn:
- Use LinkedIn Sales Navigator (mais acessível)
- Considere ferramentas de terceiros como PhantomBuster ou Apify

## 🛠️ Troubleshooting

### Erro: "API Key não configurada"
```bash
# Verifique se a secret foi configurada
supabase secrets list

# Configure novamente se necessário
supabase secrets set GOOGLE_PLACES_API_KEY=sua_key
```

### Erro: "CORS"
- Verifique se o arquivo `_shared/cors.ts` existe
- Certifique-se de que as funções retornam os headers CORS

### Erro: "Rate limit exceeded"
- Implemente cache no frontend
- Adicione debouncing nas buscas
- Considere usar um serviço de proxy

## 📝 Próximos Passos

1. ✅ Deploy das Edge Functions
2. ✅ Configurar Google Places API (recomendado começar por esta)
3. ⏳ Configurar Instagram API (opcional)
4. ⏳ Configurar LinkedIn API (opcional)
5. ✅ Testar no ambiente de produção

## 🆘 Suporte

- [Documentação Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)
