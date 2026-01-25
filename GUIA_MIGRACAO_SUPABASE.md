# 🔄 Guia Completo: Migração de Banco de Dados Supabase

## 📝 Resumo
Este guia vai te ajudar a migrar todo o banco de dados de um projeto Supabase para outro.

---

## 🎯 Passo a Passo

### **PARTE 1: Preparação**

#### 1.1 - Informações Necessárias

Você vai precisar de:
- ✅ **Projeto Antigo**: URL e credenciais do Supabase de onde você quer copiar
- ✅ **Projeto Novo**: URL e credenciais do Supabase para onde você quer migrar

**Projeto Atual (do .env):**
- ID: `jurnndpwsgfxfxwvgxec`
- URL: `https://jurnndpwsgfxfxwvgxec.supabase.co`

---

### **PARTE 2: Exportar do Projeto Antigo**

#### 2.1 - Acessar o SQL Editor do Projeto Antigo

1. Abra: `https://supabase.com/dashboard/project/[ID_DO_PROJETO_ANTIGO]/sql/new`
2. Faça login se necessário

#### 2.2 - Exportar os Dados

1. No SQL Editor, cole o conteúdo do arquivo `export_data.sql`
2. Clique em **"Run"** (Executar)
3. **IMPORTANTE**: Copie TODO o resultado que aparecer
4. Cole em um arquivo de texto e salve como `dados_exportados.sql`

---

### **PARTE 3: Importar para o Projeto Novo**

#### 3.1 - Acessar o SQL Editor do Projeto Novo

1. Abra: `https://supabase.com/dashboard/project/[ID_DO_PROJETO_NOVO]/sql/new`
2. Faça login se necessário

#### 3.2 - Criar a Estrutura (Schema)

1. No SQL Editor, cole o conteúdo do arquivo `full_schema.sql`
2. Clique em **"Run"** (Executar)
3. Aguarde a conclusão (pode demorar 1-2 minutos)

#### 3.3 - Importar os Dados

1. No SQL Editor, cole o conteúdo do arquivo `dados_exportados.sql` (que você salvou no passo 2.2)
2. Clique em **"Run"** (Executar)
3. Aguarde a conclusão

#### 3.4 - Adicionar Funcionalidade de Lembretes

1. No SQL Editor, cole o conteúdo do arquivo `sql_contracts_reminders.sql`
2. Clique em **"Run"** (Executar)

---

### **PARTE 4: Atualizar o Projeto**

#### 4.1 - Atualizar o arquivo .env

Edite o arquivo `.env` com as informações do **projeto novo**:

```env
VITE_SUPABASE_PROJECT_ID="[NOVO_PROJECT_ID]"
VITE_SUPABASE_PUBLISHABLE_KEY="[NOVA_ANON_KEY]"
VITE_SUPABASE_URL="https://[NOVO_PROJECT_ID].supabase.co"
```

**Onde encontrar essas informações:**
1. Vá em: `https://supabase.com/dashboard/project/[NOVO_PROJECT_ID]/settings/api`
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

#### 4.2 - Testar a Aplicação

1. No terminal, execute:
   ```bash
   npm run dev
   ```

2. Abra o navegador e teste se:
   - ✅ Os dados aparecem corretamente
   - ✅ Você consegue criar novos contratos
   - ✅ A funcionalidade de lembretes está ativa

---

## ⚠️ Observações Importantes

### **Antes de Começar:**
- ⚠️ Faça backup do projeto antigo antes de qualquer coisa
- ⚠️ Teste primeiro em um projeto de desenvolvimento/teste
- ⚠️ Não delete o projeto antigo até confirmar que tudo está funcionando

### **Durante a Migração:**
- 📝 Execute os scripts na ordem correta (schema → dados → lembretes)
- 🔍 Verifique se há erros após cada execução
- 💾 Salve todos os resultados intermediários

### **Depois da Migração:**
- ✅ Teste todas as funcionalidades principais
- ✅ Verifique se os usuários conseguem fazer login
- ✅ Confirme que os dados estão corretos
- ✅ Teste a criação de novos registros

---

## 🆘 Problemas Comuns

### Erro: "relation already exists"
**Solução:** O schema já foi criado. Pule para o passo 3.3 (importar dados)

### Erro: "permission denied"
**Solução:** Verifique se você está logado como administrador do projeto

### Erro: "foreign key violation"
**Solução:** Execute os INSERTs na ordem correta (tabelas pai antes das tabelas filho)

---

## 📞 Precisa de Ajuda?

Se encontrar algum erro durante o processo:
1. Copie a mensagem de erro completa
2. Me mostre em qual passo você está
3. Vou te ajudar a resolver!

---

## ✅ Checklist Final

Após completar todos os passos, verifique:

- [ ] Schema criado no projeto novo
- [ ] Dados importados com sucesso
- [ ] Colunas de lembrete adicionadas
- [ ] Arquivo .env atualizado
- [ ] Aplicação rodando sem erros
- [ ] Login funcionando
- [ ] Dados visíveis no dashboard
- [ ] Funcionalidade de lembretes ativa

---

**Boa sorte com a migração! 🚀**
