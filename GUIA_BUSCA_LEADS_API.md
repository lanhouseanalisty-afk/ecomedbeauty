# 🔍 Guia de Configuração - Busca de Leads por API

## 📋 **Visão Geral**

Este guia explica como configurar e usar a funcionalidade de busca de leads por API do Google Maps no sistema EcoMedBeauty.

---

## 🎯 **Funcionalidades**

- ✅ Busca de leads no **Google Maps** (clínicas, restaurantes, empresas, etc.)
- ✅ Busca por **categoria** e **localização**
- ✅ Retorna: Nome, Endereço, Telefone, Website, Avaliação
- ✅ Importação direta para o CRM
- ✅ Fallback para dados de demonstração se a API não estiver configurada

---

## 🔧 **Pré-requisitos**

### 1. **Conta Google Cloud Platform**

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Ative a **Places API**:
   - Vá em "APIs & Services" > "Library"
   - Procure por "Places API"
   - Clique em "Enable"

### 2. **Chave de API do Google Maps**

1. Vá em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Copie a chave gerada
4. **Recomendado**: Restrinja a chave:
   - Clique na chave criada
   - Em "API restrictions", selecione "Restrict key"
   - Marque apenas "Places API"
   - Salve

### 3. **Supabase CLI Instalado**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Verificar instalação
supabase --version
```

---

## 🚀 **Configuração**

### **Passo 1: Fazer Login no Supabase**

```bash
supabase login
```

### **Passo 2: Linkar ao Projeto**

```bash
# No diretório do projeto
supabase link --project-ref hxdfbwptgtthaqddneyr
```

### **Passo 3: Configurar a Chave da API**

```bash
# Definir a variável de ambiente no Supabase
supabase secrets set GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

**Substitua `SUA_CHAVE_AQUI` pela chave que você copiou do Google Cloud Platform.**

### **Passo 4: Deploy da Edge Function**

```bash
# Deploy da função
supabase functions deploy search-leads-google-maps
```

---

## 📊 **Como Usar**

### **Na Interface do Sistema:**

1. ✅ Acesse a página **Comercial** (`/crm/comercial`)
2. ✅ Clique no botão **"Buscar Leads"** (ícone de lupa)
3. ✅ Preencha os campos:
   - **Categoria**: Ex: "clínicas estéticas", "restaurantes", "academias"
   - **Localização**: Ex: "São Paulo, SP", "Rio de Janeiro, RJ"
4. ✅ Clique em **"Buscar no Google Maps"**
5. ✅ Selecione os leads que deseja importar
6. ✅ Clique em **"Importar Selecionados"**

### **Exemplo de Busca:**

```
Categoria: clínicas estéticas
Localização: São Paulo, SP
```

**Resultado:**
- Clínica Estética Bella Vita
  - 📍 Av. Paulista, 1000 - São Paulo, SP
  - 📞 (11) 98765-4321
  - 🌐 www.bellavita.com.br
  - ⭐ 4.8/5

---

## 🔍 **Testando a API**

### **Teste Manual via cURL:**

```bash
curl -X POST 'https://hxdfbwptgtthaqddneyr.supabase.co/functions/v1/search-leads-google-maps' \
  -H 'Authorization: Bearer SUA_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "clínicas estéticas",
    "location": "São Paulo, SP"
  }'
```

**Substitua:**
- `SUA_ANON_KEY` pela sua chave `anon public key` do Supabase

---

## ⚠️ **Troubleshooting**

### **Erro: "API do Google Maps não configurada"**

**Solução:**
```bash
# Verificar se a chave está configurada
supabase secrets list

# Se não estiver, configurar novamente
supabase secrets set GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

### **Erro: "ZERO_RESULTS"**

**Causas:**
- Busca muito específica
- Localização incorreta
- Categoria não encontrada

**Solução:**
- Tente termos mais genéricos
- Verifique a ortografia da localização
- Use categorias mais amplas

### **Erro: "OVER_QUERY_LIMIT"**

**Causa:** Limite de requisições da API excedido

**Solução:**
- Aguarde alguns minutos
- Verifique os limites da sua conta no Google Cloud
- Considere aumentar a cota se necessário

---

## 💰 **Custos**

### **Google Maps Places API:**

- **Grátis**: $200 de crédito mensal
- **Text Search**: $32 por 1000 requisições
- **Place Details**: $17 por 1000 requisições

**Estimativa de custo por busca:**
- 1 busca = 1 Text Search + até 20 Place Details
- Custo aproximado: $0.032 + (20 × $0.017) = **$0.372 por busca**

**Com $200 de crédito gratuito:**
- Aproximadamente **537 buscas gratuitas por mês**

---

## 🔐 **Segurança**

### **Boas Práticas:**

1. ✅ **Restrinja a chave da API** apenas para Places API
2. ✅ **Monitore o uso** no Google Cloud Console
3. ✅ **Configure alertas** de uso excessivo
4. ✅ **Não exponha a chave** no código frontend
5. ✅ **Use a Edge Function** (backend) para chamadas à API

---

## 📚 **Recursos Adicionais**

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)

---

## ✅ **Checklist de Configuração**

- [ ] Conta Google Cloud Platform criada
- [ ] Places API ativada
- [ ] Chave de API gerada e restrita
- [ ] Supabase CLI instalado
- [ ] Projeto linkado ao Supabase
- [ ] Variável `GOOGLE_MAPS_API_KEY` configurada
- [ ] Edge Function deployada
- [ ] Teste realizado com sucesso

---

**Pronto! Agora você pode buscar leads diretamente do Google Maps!** 🎉
