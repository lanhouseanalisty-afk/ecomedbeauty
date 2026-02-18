# EcomedBeauty CRM

Sistema de CRM e Gestão Empresarial integrado, desenvolvido para atender as necessidades dos departamentos da EcomedBeauty (RH, Comercial, Financeiro, Logística, Marketing, Jurídico, etc.).

## 🚀 Sobre o Projeto

Este projeto é uma Single Page Application (SPA) moderna construída com React e TypeScript, focada em performance, usabilidade e modularidade. Integra-se com Supabase para backend e banco de dados.

### Principais Funcionalidades

- **Gestão de Departamentos**: Módulos específicos para cada área da empresa.
- **Controle de Acesso (RBAC)**: Visibilidade e permissões baseadas em cargos.
- **Integrações**: Conexão com sistemas externos e ferramentas de automação.
- **Dashboards**: Visualização de métricas e KPIs em tempo real.

## 🛠️ Stack Tecnológica

- **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **UI & Estilo**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
- **Estado & Data**: [TanStack Query](https://tanstack.com/query/latest), [Zustand](https://github.com/pmndrs/zustand) (se aplicável), Context API
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Testes**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)

## 🏁 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/ecomedbeauty.git
   cd ecomedbeauty
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Copie o arquivo `.env.example` para `.env` e preencha as chaves necessárias (Supabase, Sentry, etc.).
   ```bash
   cp .env.example .env
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:8080`.

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila a aplicação para produção.
- `npm run preview`: Visualiza a versão de produção localmente.
- `npm run lint`: Verifica problemas de linting no código.
- `npm test`: Executa os testes unitários.
- `npm run test:ui`: Executa testes com interface gráfica.
- `npm run test:coverage`: Gera relatório de cobertura de testes.

## 📚 Documentação Adicional

- [Arquitetura do Projeto](./ARCHITECTURE.md): Detalhes sobre a estrutura e decisões técnicas.
- [Guia de Contribuição](./CONTRIBUTING.md): Padrões de código e como contribuir.
- [Segurança](./SECURITY.md): Políticas de segurança e reporte de vulnerabilidades.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o [Guia de Contribuição](./CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo de envio de pull requests.

## 📄 Licença

Este projeto é proprietário e confidencial da EcomedBeauty.
