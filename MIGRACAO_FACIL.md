# 🚀 GUIA SIMPLIFICADO - MIGRAÇÃO DE BANCO SUPABASE

## Método Mais Fácil: Usar o Backup do Supabase

### 📥 PASSO 1: Fazer Backup do Projeto Atual

1. Abra o projeto atual no Supabase: https://supabase.com/dashboard/project/jurnndpwsgfxfxwvgxec

2. No menu lateral, clique em **"Database"** (Banco de Dados)

3. Clique na aba **"Backups"** (Cópias de Segurança)

4. Clique em **"Create backup"** (Criar backup)
   - Ou use um backup existente se já tiver um

5. Depois que o backup estiver pronto, clique nos **3 pontinhos** ao lado do backup

6. Clique em **"Download"** (Baixar)
   - Isso vai baixar um arquivo `.sql` com todo o banco de dados

---

### 📤 PASSO 2: Restaurar no Projeto Novo

1. Abra o projeto novo no Supabase

2. Vá em **"Database"** → **"Backups"**

3. Clique em **"Restore from file"** (Restaurar de arquivo)

4. Selecione o arquivo `.sql` que você baixou no Passo 1

5. Aguarde a restauração (pode demorar alguns minutos)

---

### ✅ PASSO 3: Atualizar o .env

Depois que a restauração terminar:

1. Vá em **Settings** → **API** do projeto novo

2. Copie:
   - Project URL
   - Project ID  
   - anon public key

3. Atualize o arquivo `.env`:

```env
VITE_SUPABASE_PROJECT_ID="[NOVO_PROJECT_ID]"
VITE_SUPABASE_PUBLISHABLE_KEY="[NOVA_ANON_KEY]"
VITE_SUPABASE_URL="https://[NOVO_PROJECT_ID].supabase.co"
```

4. Teste rodando:
```bash
npm run dev
```

---

## 🎯 PRONTO!

Seu banco foi migrado! 🎉

---

## ⚠️ IMPORTANTE:

Se o projeto novo não tiver a opção de "Restore from file", use o método alternativo abaixo:

### Método Alternativo: SQL Editor

1. Abra o arquivo `.sql` que você baixou no Passo 1
2. Copie TODO o conteúdo
3. No projeto novo, vá em **SQL Editor**
4. Cole o conteúdo
5. Clique em **Run**

---

## 🆘 Problemas?

Se der algum erro, me avise qual foi a mensagem!
