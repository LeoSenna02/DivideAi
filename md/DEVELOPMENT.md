# 📋 Instruções de Desenvolvimento - Frontend DivideAí

## Padrões de Código

### 1. Componentes
- Usar componentes funcionais com TypeScript
- Sempre tipificar props com interfaces
- Exportar interface de Props do componente

```typescript
// ✅ Correto
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={`btn-${variant}`}>{label}</button>;
}
```

### 2. Hooks Customizados
- Manter lógica de negócio separada de componentes
- Tipificar retornos
- Prefixar com `use`

```typescript
// ✅ Correto
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  
  return { tasks, loading };
}
```

### 3. Services
- Usar Firebase SDK diretamente (Auth + Firestore)
- Tratamento de erro consistente
- Tipificar operações de banco de dados

```typescript
// ✅ Correto
export async function getTasks(homeId: string): Promise<Task[]> {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('homeId', '==', homeId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Task[];
}
```

### 4. Context API
- Usar para estado global apenas
- Criar custom hooks para consumir context
- Lançar erro se usado fora do Provider

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Estrutura de Pastas - Convenções

```
src/
├── components/
│   ├── common/          # Componentes globais (Header, Footer, Sidebar)
│   ├── form/            # Componentes de formulário
│   ├── task/            # Componentes específicos de tarefas
│   └── home/            # Componentes específicos de lares
├── pages/
│   ├── LoginPage.tsx
│   ├── HomePage.tsx
│   ├── TasksPage.tsx
│   └── ScoreBoardPage.tsx
├── hooks/
│   ├── useTasks.ts      # Hook para gerenciar tarefas
│   └── useHomes.ts      # Hook para gerenciar lares
├── services/
│   ├── firebase.ts      # Configuração do Firebase
│   ├── authService.ts   # Operações de autenticação
│   └── firestoreService.ts # Operações de banco de dados
├── context/
│   ├── AuthContext.tsx  # Contexto de autenticação
│   └── HomeContext.tsx  # Contexto de lar selecionado
├── types/
│   └── index.ts         # Todas as interfaces
├── utils/
│   ├── helpers.ts       # Funções auxiliares
│   └── validators.ts    # Validação de formulários
└── styles/
    ├── globals.css      # Estilos globais
    └── variables.css    # Variáveis CSS
```

## Checklist de Qualidade

- [ ] TypeScript: sem erros de tipo
- [ ] Linting: sem warnings do ESLint
- [ ] Nomes: claros e em inglês
- [ ] Componentes: tipados corretamente
- [ ] Services: tratam erros apropriadamente
- [ ] Hooks: retornam tipos corretos
- [ ] Imports: usam type-only quando necessário
- [ ] Componentes: sem lógica de negócio (apenas com hooks)

## Stack Recomendada

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Backend**: Firebase (Auth + Firestore)
- **Routing**: React Router v6
- **CSS Framework**: Tailwind CSS (recomendado)
- **State Management**: Context API + Hooks (para estado simples)
- **Form Handling**: React Hook Form (se necessário)
- **Validation**: Zod (tipagem em runtime)
