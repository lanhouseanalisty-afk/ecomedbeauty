# 🚀 MIGRAÇÃO RÁPIDA - RESUMO EXECUTIVO

## O que você precisa fazer:

### 📦 **PASSO 1: No Projeto ANTIGO (de onde você quer copiar)**

1. Abra: https://supabase.com/dashboard
2. Entre no projeto antigo
3. Clique em "SQL Editor" no menu lateral
4. Clique em "New Query"
5. Cole o conteúdo do arquivo `export_data.sql`
6. Clique em "Run"
7. **COPIE TODO O RESULTADO** e salve em um arquivo

---

### 📥 **PASSO 2: No Projeto NOVO (para onde você quer migrar)**

1. Abra: https://supabase.com/dashboard
2. Entre no projeto novo
3. Clique em "SQL Editor" no menu lateral

#### 2.1 - Criar Estrutura
- Cole o conteúdo de `full_schema.sql`
- Clique em "Run"
- Aguarde terminar

#### 2.2 - Importar Dados
- Cole o resultado que você salvou no Passo 1
- Clique em "Run"
- Aguarde terminar

#### 2.3 - Adicionar Lembretes
- Cole o conteúdo de `sql_contracts_reminders.sql`
- Clique em "Run"

---

### ⚙️ **PASSO 3: Atualizar o Projeto**

1. Vá em: Settings → API do projeto novo
2. Copie as 3 informações:
   - Project URL
   - Project ID
   - anon public key

3. Edite o arquivo `.env` com esses valores

4. Teste rodando:
   ```bash
   npm run dev
   ```

---

## ✅ Pronto!

Seu banco de dados foi migrado com sucesso! 🎉

---

## ⚠️ IMPORTANTE:

- Não delete o projeto antigo até confirmar que tudo está funcionando
- Teste bem antes de usar em produção
- Faça backup antes de começar
