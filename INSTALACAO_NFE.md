# Guia de Instalação do Sistema NFE

## 📋 Passo a Passo - Aplicar Migration no Supabase

Como o Supabase CLI não está instalado, vamos aplicar a migration diretamente pelo painel web do Supabase.

### Opção 1: Via SQL Editor (Recomendado - Mais Rápido)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Faça login
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Cole o SQL da Migration**
   - Abra o arquivo: `supabase/migrations/create_nfe_system.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor

4. **Execute a Migration**
   - Clique em **Run** (ou pressione Ctrl+Enter)
   - Aguarde a confirmação de sucesso

5. **Verifique as Tabelas**
   - No menu lateral, clique em **Table Editor**
   - Você deve ver as novas tabelas:
     - `nfe_records`
     - `nfe_attachments`
     - `nfe_notifications`

---

### Opção 2: Via Table Editor (Alternativa)

Se preferir criar manualmente:

1. **Criar Tabelas**
   - Table Editor → New Table
   - Criar cada tabela conforme o schema

2. **Criar Funções**
   - SQL Editor → New Query
   - Copiar apenas as funções do arquivo de migration

---

## 📦 Configurar Storage Bucket

1. **Acesse Storage**
   - No menu lateral do Supabase, clique em **Storage**

2. **Criar Novo Bucket**
   - Clique em **New Bucket**
   - **Name**: `nfe-documents`
   - **Public bucket**: Desmarcar (deixar privado)
   - Clique em **Create bucket**

3. **Configurar Políticas de Acesso**
   - Clique no bucket `nfe-documents`
   - Vá em **Policies**
   - Clique em **New Policy**
   - Selecione **Custom Policy**
   - **Policy name**: `Allow authenticated users to upload`
   - **Target roles**: `authenticated`
   - **Policy definition**:
     ```sql
     (bucket_id = 'nfe-documents'::text)
     ```
   - Marque as operações: **INSERT**, **SELECT**, **UPDATE**, **DELETE**
   - Clique em **Save**

---

## ✅ Verificar Instalação

Após aplicar a migration, execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'nfe%';

-- Verificar funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%nfe%';
```

Você deve ver:
- **Tabelas**: nfe_records, nfe_attachments, nfe_notifications
- **Funções**: calculate_next_due_date, create_due_notification, process_nfe_due_dates

---

## 🚀 Testar o Sistema

1. **Acesse a página NFE**
   ```
   http://localhost:5173/crm/tech/nfe
   ```

2. **Cadastre uma NFE de teste**
   - Clique em "Nova NFE"
   - Preencha os campos
   - Anexe arquivos (opcional)
   - Salve

3. **Verifique no Supabase**
   - Table Editor → nfe_records
   - Você deve ver o registro criado

---

## 🔧 Troubleshooting

### Erro: "relation nfe_records does not exist"
- A migration não foi aplicada corretamente
- Execute novamente o SQL no SQL Editor

### Erro ao fazer upload de arquivo
- Verifique se o bucket `nfe-documents` foi criado
- Verifique as políticas de acesso do bucket

### Erro de permissão
- Verifique se você está logado no sistema
- Verifique as RLS policies das tabelas

---

## 📞 Suporte

Se encontrar algum problema:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Me avise para ajudar a resolver!
