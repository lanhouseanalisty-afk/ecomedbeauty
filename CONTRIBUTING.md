# Guia de Contribuição - EcomedBeauty

Obrigado pelo interesse em contribuir para o projeto EcomedBeauty! Este documento estabelece as diretrizes para desenvolvimento, testes e envio de alterações.

## 🚀 Começando

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Inicie o servidor de desenvolvimento: `npm run dev`

## 🛠️ Stack Tecnológica

- **Frontend**: React, TypeScript, Vite
- **UI**: Tailwind CSS, Shadcn/UI
- **State Management**: TanStack Query (React Query)
- **Backend/Database**: Supabase
- **Testes**: Vitest, React Testing Library

## 📏 Padrões de Código

### TypeScript
- Use tipagem estrita sempre que possível.
- Evite `any`. Use `unknown` se necessário.
- Defina interfaces para props de componentes e modelos de dados.

### Componentes
- Componentes devem ser funcionais (React Hooks).
- Coloque componentes reutilizáveis em `src/components/ui`.
- Componentes de domínio específico em `src/components/crm/[modulo]`.

### Estilização
- Use classes do Tailwind CSS.
- Evite CSS modules ou styled-components a menos que estritamente necessário.
- Mantenha a consistência com o design system (cores, espaçamentos).

## 🧪 Testes

O projeto usa Vitest para testes. Todo novo código deve ser testado.

- **Unitários**: Para utilitários e hooks (`npm run test`)
- **Componentes**: Testes de interação e renderização (`npm run test`)

Para rodar os testes:
```bash
npm run test
npm run test:ui # Interface gráfica
npm run test:coverage # Relatório de cobertura
```

## 📝 Processo de Pull Request

1. Crie uma branch para sua feature/fix: `git checkout -b feature/nova-funcionalidade`
2. Commit suas alterações seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: adiciona login`
   - `fix: corrige erro no formulário`
   - `docs: atualiza readme`
3. Garanta que os testes passem: `npm run test`
4. Abra um Pull Request descrevendo suas mudanças.

## 🐛 Reportando Bugs

Use as Issues do GitHub para reportar bugs. Inclua:
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots se aplicável
