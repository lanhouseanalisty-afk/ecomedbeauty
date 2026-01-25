# 🔍 Busca de Leads por API - Quick Start

## ⚡ **Início Rápido**

### **1. Instalar Supabase CLI**
```bash
npm install -g supabase
```

### **2. Fazer Login**
```bash
supabase login
```

### **3. Linkar Projeto**
```bash
supabase link --project-ref hxdfbwptgtthaqddneyr
```

### **4. Configurar Chave da API**
```bash
supabase secrets set GOOGLE_MAPS_API_KEY=SUA_CHAVE_AQUI
```

### **5. Deploy**
```bash
supabase functions deploy search-leads-google-maps
```

---

## 🎯 **Ou use o script automatizado:**

```powershell
.\deploy-busca-leads.ps1
```

---

## 📚 **Documentação Completa**

Consulte o arquivo `GUIA_BUSCA_LEADS_API.md` para:
- Como obter a chave da API do Google Maps
- Configuração detalhada
- Exemplos de uso
- Troubleshooting
- Informações sobre custos

---

## ✅ **Testando**

1. Acesse: http://localhost:8080/crm/comercial
2. Clique em "Buscar Leads"
3. Preencha:
   - **Categoria**: "clínicas estéticas"
   - **Localização**: "São Paulo, SP"
4. Clique em "Buscar no Google Maps"
5. Selecione e importe os leads

---

**Pronto para buscar leads! 🚀**
