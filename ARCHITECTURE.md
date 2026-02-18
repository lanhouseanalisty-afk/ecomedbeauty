# Arquitetura do Projeto - EcomedBeauty

Este documento descreve a arquitetura técnica do projeto EcomedBeauty, um sistema CRM modular construído com React, Supabase e Vite.

## 🏗️ Visão Geral

O sistema é uma aplicação SPA (Single Page Application) que gerencia múltiplos módulos de negócios (CRM): RH, Comercial, Logística, Jurídico, Marketing, Financeiro, etc.

### Stack Tecnológica
- **Linguagem**: TypeScript
- **Framework Web**: React 18
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS + Shadcn/UI
- **Gerenciamento de Estado**: TanStack Query (Server State) + React Context (Global UI State)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Roteamento**: React Router Dom
- **Analytics/Logging**: Sentry (Errors), Custom Logger

## 📂 Estrutura de Diretórios

```
src/
├── components/          # Componentes reutilizáveis
│   ├── crm/             # Componentes específicos de módulos CRM
│   ├── layout/          # Layouts globais (Sidebar, Navbar)
│   └── ui/              # Componentes base (Shadcn)
├── contexts/            # Contextos globais (Auth, Cart, Theme)
├── hooks/               # Custom Hooks (Lógica de negócio)
├── i18n/                # Configuração de Internacionalização
├── lib/                 # Utilitários e wrappers de bibliotecas (Logger, Sentry)
├── pages/               # Páginas da aplicação (Roteamento)
│   ├── crm/             # Páginas dos módulos CRM
│   └── [outras]         # Páginas públicas/admin
├── types/               # Definições de tipos TypeScript
└── utils/               # Funções utilitárias puras
```

## 🔄 Fluxo de Dados

1. **Autenticação**: Gerenciada pelo `AuthProvider` (via Supabase Auth). O token JWT é armazenado e renovado automaticamente.
2. **Data Fetching**: Utiliza `TanStack Query` para cache, refetching e estado de loading/error. Hooks personalizados em `src/hooks/use[Modulo].ts` encapsulam as chamadas ao Supabase.
3. **Estado Global**: Contextos React são usados apenas para estados UI globais (Carrinho, Tema) ou dados de sessão crítica (Usuário).

## 🧩 Módulos Principais

### CRM Core
O CRM é dividido em departamentos. Cada departamento possui:
- **Dashboard**: Visão geral e métricas.
- **Páginas Específicas**: Funcionalidades do departamento.
- **Permissões**: Controladas via RLS no Supabase e `ProtectedRoute` no frontend.

### Componentes UI
Baseados em Shadcn/UI, construídos sobre Radix UI para acessibilidade e Tailwind para estilo.

## 🛡️ Segurança e Permissões

- **Frontend**: `ProtectedRoute` verifica roles do usuário antes de renderizar rotas.
- **Backend**: Row Level Security (RLS) no PostgreSQL garante que usuários só acessem dados permitidos.

## 🚀 Padrões e Boas Práticas

- **Lazy Loading**: Páginas são carregadas sob demanda para performance inicial.
- **Erros**: `ErrorBoundary` global captura falhas de renderização e envia para Sentry.
- **Logging**: `src/lib/logger.ts` centraliza logs com níveis (INFO, WARN, ERROR).
