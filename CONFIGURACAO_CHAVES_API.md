# 🎯 Configuração de Chaves de API - Interface Web

## ✅ **Configuração Simplificada**

Agora você pode configurar as chaves de API diretamente pela interface do sistema, sem precisar usar linha de comando!

---

## 📋 **Passo a Passo**

### **1. Executar o SQL de Criação da Tabela**

Primeiro, crie a tabela de configurações no banco de dados:

1. ✅ Acesse o SQL Editor do Supabase: https://supabase.com/dashboard/project/hxdfbwptgtthaqddneyr/sql/new
2. ✅ Copie o conteúdo do arquivo `create_system_settings.sql`
3. ✅ Cole no SQL Editor
4. ✅ Clique em "Correr" (Run)

### **2. Acessar a Página de Configurações**

1. ✅ Faça login no sistema como **admin**
2. ✅ Acesse: `http://localhost:8080/crm/admin/settings`
3. ✅ Você verá a página de "Configurações do Sistema"

### **3. Configurar a Chave do Google Maps**

1. ✅ Na seção "Chaves de API Externas"
2. ✅ Encontre o campo "Chave da API do Google Maps para busca de leads"
3. ✅ Cole sua chave da API do Google Maps
4. ✅ Clique em "Salvar"

---

## 🔑 **Como Obter a Chave do Google Maps**

1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Ative a "Places API":
   - Vá em "APIs & Services" > "Library"
   - Procure por "Places API"
   - Clique em "Enable"
4. Crie uma chave de API:
   - Vá em "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
   - Copie a chave gerada
5. **Recomendado**: Restrinja a chave:
   - Clique na chave criada
   - Em "API restrictions", selecione "Restrict key"
   - Marque apenas "Places API"
   - Salve

---

## 🚀 **Testar a Funcionalidade**

1. ✅ Acesse: `http://localhost:8080/crm/comercial`
2. ✅ Clique em "Buscar Leads"
3. ✅ Preencha:
   - **Categoria**: "clínicas estéticas"
   - **Localização**: "São Paulo, SP"
4. ✅ Clique em "Buscar no Google Maps"
5. ✅ Veja os resultados reais da API!

---

## 🔒 **Segurança**

- ✅ As chaves são armazenadas no banco de dados
- ✅ Apenas usuários **admin** podem visualizar e editar
- ✅ As chaves são mascaradas por padrão (clique no ícone de olho para visualizar)
- ✅ A Edge Function busca a chave diretamente do banco

---

## 💡 **Vantagens desta Abordagem**

1. ✅ **Sem linha de comando**: Configure tudo pela interface
2. ✅ **Fácil de atualizar**: Troque a chave a qualquer momento
3. ✅ **Múltiplas chaves**: Suporte para Instagram, LinkedIn, etc.
4. ✅ **Controle de acesso**: Apenas admins podem configurar
5. ✅ **Interface amigável**: Visualização mascarada e botão de salvar individual

---

## 📊 **Próximos Passos**

Depois de configurar a chave:

1. ✅ Teste a busca de leads
2. ✅ Importe alguns leads para o CRM
3. ✅ Configure outras chaves de API conforme necessário

---

**Pronto! Agora você pode gerenciar todas as chaves de API pela interface!** 🎉
