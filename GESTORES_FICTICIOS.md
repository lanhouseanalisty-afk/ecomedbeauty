# Gestores Fictícios - Ecomedbeauty

## 👥 Usuários Gestores Criados

A migration `20260124141000_create_fictitious_managers.sql` cria 4 gestores regionais que podem ser usados como aprovadores no sistema de solicitação de insumos de marketing.

### Lista de Gestores

| Nome | Email | Role | ID |
|------|-------|------|-----|
| **Jaqueline** | jaqueline@ecomedbeauty.com | Regional Manager / Marketing Manager | `11111111-1111-1111-1111-111111111111` |
| **Laice** | laice@ecomedbeauty.com | Regional Manager / Marketing Manager | `22222222-2222-2222-2222-222222222222` |
| **Milena** | milena@ecomedbeauty.com | Regional Manager / Marketing Manager | `33333333-3333-3333-3333-333333333333` |
| **Thiago** | thiago@ecomedbeauty.com | Regional Manager / Marketing Manager | `44444444-4444-4444-4444-444444444444` |

---

## 🔧 Como Usar

### 1. **Executar a Migration**

No Supabase SQL Editor, execute:

```sql
-- Arquivo: supabase/migrations/20260124141000_create_fictitious_managers.sql
```

### 2. **Verificar Gestores Criados**

Para ver todos os gestores disponíveis:

```sql
SELECT 
  p.id, 
  p.full_name, 
  p.email, 
  array_agg(ur.role) as roles
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role IN ('admin', 'marketing_manager', 'regional_manager')
GROUP BY p.id, p.full_name, p.email;
```

### 3. **Usar no Formulário de Solicitação**

Quando criar uma solicitação de insumos em `/crm/marketing/solicitacao-insumos`, você verá estes gestores no campo **"Gestor Aprovador"**.

---

## ⚠️ Importante - Produção vs Desenvolvimento

### **Desenvolvimento/Testes**
✅ Estes usuários fictícios são perfeitos para:
- Testar o fluxo de aprovação
- Demonstrações do sistema
- Desenvolvimento local

### **Produção**
⚠️ Para usar em produção, você precisa:

1. **Criar usuários reais no Supabase Auth:**
   ```sql
   -- No Supabase Dashboard > Authentication > Users
   -- Criar usuários com os mesmos IDs ou atualizar a migration
   ```

2. **Ou atualizar os IDs:**
   - Após criar usuários reais via Supabase Auth
   - Atualizar a tabela `user_roles` com os IDs corretos
   - Adicionar os roles apropriados

---

## 🔐 Permissões dos Gestores

### **Marketing Manager**
- ✅ Ver todas as solicitações de marketing
- ✅ Aprovar/Rejeitar solicitações
- ✅ Atualizar status das solicitações
- ✅ Ver dashboard de marketing

### **Regional Manager**
- ✅ Ver todas as solicitações de marketing
- ✅ Aprovar/Rejeitar solicitações atribuídas
- ✅ Criar solicitações

### **Admin**
- ✅ Acesso total ao sistema
- ✅ Ver e gerenciar todas as solicitações
- ✅ Configurações do sistema

---

## 📝 Exemplo de Uso

### **Cenário: Criar e Aprovar uma Solicitação**

1. **Como Usuário Normal:**
   - Acesse `/crm/marketing/solicitacao-insumos`
   - Preencha o formulário
   - Selecione "Jaqueline" como gestor aprovador
   - Envie a solicitação

2. **Como Gestor (Jaqueline):**
   - Acesse `/crm/marketing/gerenciar-solicitacoes`
   - Veja a solicitação pendente
   - Aprove ou rejeite com comentários

3. **Acompanhamento:**
   - O solicitante vê o status atualizado em `/crm/marketing/solicitacoes`

---

## 🔄 Atualizar Roles

Para adicionar ou remover roles de um gestor:

```sql
-- Adicionar role
INSERT INTO user_roles (user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Remover role
DELETE FROM user_roles 
WHERE user_id = '11111111-1111-1111-1111-111111111111' 
AND role = 'marketing_manager';
```

---

## 📊 Consultas Úteis

### Ver solicitações pendentes de aprovação:
```sql
SELECT 
  mr.request_id,
  mr.event_name,
  mr.consultant_name,
  mr.status,
  p.full_name as approver_name,
  mr.created_at
FROM marketing_requests mr
LEFT JOIN profiles p ON mr.approver_id = p.id
WHERE mr.status = 'pending'
ORDER BY mr.created_at DESC;
```

### Ver histórico de aprovações de um gestor:
```sql
SELECT 
  mr.request_id,
  mr.event_name,
  mr.status,
  mr.notes,
  mr.updated_at
FROM marketing_requests mr
WHERE mr.approver_id = '11111111-1111-1111-1111-111111111111'
ORDER BY mr.updated_at DESC;
```

---

## 🎯 Próximos Passos

1. ✅ Executar a migration
2. ✅ Testar criação de solicitação
3. ✅ Testar fluxo de aprovação
4. ⚠️ Em produção: substituir por usuários reais

---

**Gestores fictícios prontos para uso! 🎉**
