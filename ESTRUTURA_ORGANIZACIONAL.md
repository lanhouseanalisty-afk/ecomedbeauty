# Estrutura Organizacional Completa - MedBeauty

## 📊 Visão Geral

**Total de Departamentos:** 15
- 10 Departamentos Principais
- 5 Sub-Setores (Comercial)

---

## 🏢 Departamentos Principais e Gestores

### 1. **Administração**
- **Gestor:** Pedro Miguel
- **E-mail:** pedro.miguel@medbeauty.com.br
- **Código:** `admin`
- **Descrição:** Gestão Geral

### 2. **RH (Recursos Humanos)**
- **Gestor:** Gleice Silva
- **E-mail:** gleice.silva@medbeauty.com.br
- **Código:** `rh`
- **Descrição:** Gestão de Pessoas

### 3. **Financeiro**
- **Gestor:** Lucas Voltarelli
- **E-mail:** lucas.voltarelli@medbeauty.com.br
- **Código:** `financeiro`
- **Descrição:** Gestão Financeira e Contábil

### 4. **Marketing**
- **Gestor:** Viviane Toledo
- **E-mail:** viviane.toledo@medbeauty.com.br
- **Código:** `marketing`
- **Descrição:** Campanhas e Comunicação

### 5. **Comercial**
- **Código:** `comercial`
- **Descrição:** Vendas e Relacionamento com Clientes
- **Sub-Setores:** 5 (veja abaixo)

### 6. **Logística**
- **Gestor:** Luciana Borri
- **E-mail:** luciana.borri@medbeauty.com.br
- **Código:** `logistica`
- **Descrição:** Distribuição e Armazenagem

### 7. **Jurídico**
- **Gestor:** Denis Ranieri
- **E-mail:** denis.ranieri@medbeauty.com.br
- **Código:** `juridico`
- **Descrição:** Contratos e Compliance

### 8. **Tech / Suporte**
- **Gestor:** Marcelo Ravagnani
- **E-mail:** marcelo.ravagnani@medbeauty.com.br
- **Código:** `tech`
- **Descrição:** TI e Infraestrutura

### 9. **Compras**
- **Gestor:** Gilcimar Gil
- **E-mail:** gilcimar.gil@medbeauty.com.br
- **Código:** `compras`
- **Descrição:** Aquisições e Fornecedores

### 10. **Manutenção**
- **Gestor:** Laércio
- **E-mail:** laercio@medbeauty.com.br
- **Código:** `manutencao`
- **Descrição:** Infraestrutura e Facilities

---

## 🌍 Sub-Setores do Comercial

### 5.1 **Inside Sales**
- **Gestor:** Cesar Camargo
- **E-mail:** cesar.camargo@medbeauty.com.br
- **Código:** `comercial_inside_sales`
- **Descrição:** Vendas Internas

### 5.2 **Sudeste**
- **Gestor:** Milena Fireman
- **E-mail:** milena.fireman@medbeauty.com.br
- **Código:** `comercial_sudeste`
- **Estados:** SP, RJ, MG, ES

### 5.3 **Sul**
- **Gestor:** Jaqueline Grasel
- **E-mail:** jaqueline.grasel@medbeauty.com.br
- **Código:** `comercial_sul`
- **Estados:** PR, SC, RS

### 5.4 **Centro**
- **Gestor:** Laice Santos
- **E-mail:** laice.santos@medbeauty.com.br
- **Código:** `comercial_centro`
- **Estados:** GO, MT, MS, DF

### 5.5 **Norte**
- **Gestor:** Thiago Carvalho
- **E-mail:** thiago.carvalho@medbeauty.com.br
- **Código:** `comercial_norte`
- **Estados:** AM, PA, AC, RO, RR, AP, TO

---

## 📋 Lista Completa de Gestores (Ordem Alfabética)

| Nome | Departamento | E-mail |
|------|--------------|--------|
| **Cesar Camargo** | Inside Sales | cesar.camargo@medbeauty.com.br |
| **Denis Ranieri** | Jurídico | denis.ranieri@medbeauty.com.br |
| **Gilcimar Gil** | Compras | gilcimar.gil@medbeauty.com.br |
| **Gleice Silva** | RH | gleice.silva@medbeauty.com.br |
| **Jaqueline Grasel** | Sul | jaqueline.grasel@medbeauty.com.br |
| **Laércio** | Manutenção | laercio@medbeauty.com.br |
| **Laice Santos** | Centro | laice.santos@medbeauty.com.br |
| **Lucas Voltarelli** | Financeiro | lucas.voltarelli@medbeauty.com.br |
| **Luciana Borri** | Logística | luciana.borri@medbeauty.com.br |
| **Marcelo Ravagnani** | Tech / Suporte | marcelo.ravagnani@medbeauty.com.br |
| **Milena Fireman** | Sudeste | milena.fireman@medbeauty.com.br |
| **Pedro Miguel** | Administração | pedro.miguel@medbeauty.com.br |
| **Thiago Carvalho** | Norte | thiago.carvalho@medbeauty.com.br |
| **Viviane Toledo** | Marketing | viviane.toledo@medbeauty.com.br |

**Total:** 14 Gestores

---

## 🗂️ Estrutura Hierárquica Visual

```
MedBeauty
│
├── 📋 Administração (Pedro Miguel)
│
├── 👥 RH (Gleice Silva)
│
├── 💰 Financeiro (Lucas Voltarelli)
│
├── 📢 Marketing (Viviane Toledo)
│
├── 🤝 Comercial
│   ├── 💼 Inside Sales (Cesar Camargo)
│   ├── 🌆 Sudeste (Milena Fireman)
│   ├── 🌲 Sul (Jaqueline Grasel)
│   ├── 🌾 Centro (Laice Santos)
│   └── 🌴 Norte (Thiago Carvalho)
│
├── 🚚 Logística (Luciana Borri)
│
├── ⚖️ Jurídico (Denis Ranieri)
│
├── 💻 Tech / Suporte (Marcelo Ravagnani)
│
├── 🛒 Compras (Gilcimar Gil)
│
└── 🔧 Manutenção (Laércio)
```

---

## 🚀 Como Executar as Migrations

### **1. Estrutura Organizacional Base**
```sql
-- Execute no Supabase SQL Editor:
supabase/migrations/20260124142000_create_organizational_structure.sql
```

### **2. Todos os Departamentos**
```sql
-- Execute no Supabase SQL Editor:
supabase/migrations/20260124143000_add_all_departments.sql
```

---

## 📊 Consultas Úteis

### **Ver Todos os Departamentos**
```sql
SELECT 
  name as "Departamento",
  manager_name as "Gestor",
  manager_email as "Email"
FROM departments
WHERE parent_id IS NULL
ORDER BY name;
```

### **Ver Estrutura Completa**
```sql
SELECT 
  CASE 
    WHEN parent_id IS NULL THEN name
    ELSE '  └─ ' || name
  END as "Estrutura",
  manager_name as "Gestor"
FROM departments
ORDER BY COALESCE(parent_id, id), name;
```

### **Buscar Gestor por Departamento**
```sql
SELECT 
  manager_name,
  manager_email
FROM departments
WHERE code = 'rh';
```

---

## 🎯 Próximos Passos

1. ✅ Executar as 2 migrations no Supabase
2. ✅ Verificar se todos os departamentos foram criados
3. 📝 Cadastrar colaboradores em cada departamento
4. 🎨 Criar páginas de organograma para outros setores (similar ao Comercial)
5. 📊 Implementar dashboards por departamento

---

**Estrutura organizacional completa! 15 departamentos com 14 gestores cadastrados! 🎉**
