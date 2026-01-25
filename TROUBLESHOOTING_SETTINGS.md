# 🔧 Troubleshooting - Tela Branca Resolvida

## ✅ **Problema Resolvido**

A tela branca ao acessar `/crm/admin/settings` foi causada pela falta dos tipos TypeScript para a tabela `system_settings`.

### **Correções Aplicadas:**

1. ✅ **Criado arquivo de tipos**: `src/types/systemSettings.ts`
   - Define os tipos `SystemSetting`, `SystemSettingInsert`, `SystemSettingUpdate`

2. ✅ **Atualizado hook**: `src/hooks/useSystemSettings.ts`
   - Agora importa os tipos corretos
   - Evita erros de compilação TypeScript

---

## 🔄 **Próximos Passos:**

### **1. Recarregar a Página**

Pressione `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac) para fazer um hard refresh e limpar o cache.

### **2. Verificar o Console**

Se ainda houver problemas:
1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Procure por erros em vermelho
4. Me envie uma captura de tela dos erros

### **3. Verificar se o Servidor Está Rodando**

Certifique-se de que `npm run dev` está rodando sem erros.

---

## 🎯 **Testando a Página**

1. ✅ Acesse: `http://localhost:8080/crm/admin/settings`
2. ✅ Você deve ver:
   - Título: "Configurações do Sistema"
   - Aba: "Chaves de API"
   - 3 campos de configuração:
     - Google Maps API Key
     - Instagram API Token
     - LinkedIn API Key

---

## 🔐 **Configurando a Chave**

1. ✅ No campo "Google Maps API Key"
2. ✅ Cole sua chave
3. ✅ Clique em "Salvar"
4. ✅ Você verá uma mensagem de sucesso

---

**A página deve estar funcionando agora!** 🎉

Se ainda houver problemas, me avise e vou investigar mais a fundo.
