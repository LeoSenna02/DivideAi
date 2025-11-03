# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# DivideAí - Frontend

Aplicativo de compartilhamento de tarefas com sistema de pontuação de justiça.

## Estrutura de Pastas

```
src/
├── components/       # Componentes React reutilizáveis (botões, cards, modais, etc)
├── pages/           # Páginas/telas do aplicativo
├── hooks/           # Hooks customizados (useApi, useAuth, etc)
├── services/        # Serviços de integração com API (client HTTP)
├── context/         # Context API para gerenciamento de estado global (auth, user, etc)
├── types/           # Definições de tipos TypeScript (compartilhadas com backend)
├── utils/           # Funções utilitárias e helpers
├── styles/          # Arquivos de estilo globais
├── App.tsx          # Componente raiz
└── main.tsx         # Ponto de entrada
```

## Padrões de Projeto

### 1. **Separação de Preocupações (SoC)**
- **Pages**: Estrutura das telas
- **Components**: Elementos reutilizáveis
- **Services**: Comunicação com backend
- **Hooks**: Lógica compartilhada entre componentes
- **Context**: Estado global da aplicação

### 2. **Autenticação com Firebase**
- Autenticação em tempo real com Firebase Auth
- Dados do usuário sincronizados com Firestore
- Redirecionamento automático para login se não autenticado

### 3. **Tipagem Forte com TypeScript**
- Todos os tipos compartilhados em `src/types/index.ts`
- Tipagem em hooks e serviços
- Type-only imports para tipos

## Instalação

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com suas credenciais do Firebase:

```env
VITE_ENV=development
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173/`

## Build

```bash
npm run build
```

## Próximas Etapas

- [x] Instalar dependências: `firebase`, `react-router-dom`, `tailwindcss`
- [x] Criar páginas principais (Login, Home, Tarefas, Placar)
- [x] Configurar roteamento com React Router
- [x] Implementar componentes reutilizáveis
- [x] Configurar estilos globais
- [x] Integrar Firebase (Auth + Firestore)
- [ ] Implementar funcionalidades CRUD com Firestore
- [ ] Testar aplicação completa

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
