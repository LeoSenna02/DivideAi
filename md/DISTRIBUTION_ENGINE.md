# Motor de Distribuição de Tarefas - DivideAí

## 🎯 Visão Geral

O **Motor de Distribuição** é o coração do DivideAí. Ele implementa um algoritmo de distribuição justa de tarefas domésticas que combina **sorte** (aleatoriedade) com **igualdade** (equilíbrio de esforço), garantindo que todos os membros da família contribuam de forma equilibrada ao longo do mês.

## 🧠 Como Funciona

### 1. **Placar de Justiça**

Cada membro do lar possui um placar mensal que:
- **Zera no início de cada mês**
- **Acumula pontos** baseados no peso das tarefas atribuídas
- **É usado para ponderar** sorteios futuros

**Exemplo:**
```
Início do mês:
- Pai: 0 pontos
- Mãe: 0 pontos

Após 1 semana:
- Pai: 15 pontos (tarefas de peso 3+4+5+3)
- Mãe: 13 pontos (tarefas de peso 2+3+5+3)
```

### 2. **Algoritmo de Distribuição**

O motor executa os seguintes passos:

#### **Passo 1: Identificar Tarefas do Dia**
- Verifica quais tarefas do "Banco de Tarefas" precisam ser feitas hoje
- Considera a frequência: diária, semanal ou quinzenal
- Ignora tarefas já atribuídas hoje

#### **Passo 2: Sorteio Ponderado**
Para cada tarefa:
1. **Consulta o placar atual** de todos os membros
2. **Calcula pesos invertidos**: quem tem menos pontos recebe peso maior
3. **Realiza sorteio**: probabilidade proporcional ao peso invertido
4. **Atribui a tarefa** ao membro sorteado
5. **Atualiza o placar** somando o peso da tarefa

**Fórmula do Peso Invertido:**
```typescript
peso = (maxScore + 10) - scoreDoMembro
```

**Exemplo de Sorteio:**
```
Placar atual:
- Pai: 15 pontos → Peso invertido: 10
- Mãe: 10 pontos → Peso invertido: 15

Probabilidades:
- Pai: 10/25 = 40%
- Mãe: 15/25 = 60% (tem mais chance por ter menos pontos)
```

#### **Passo 3: Repetição e Equilibrio**
- O processo se repete para cada tarefa do dia
- Após cada atribuição, os placares se aproximam
- No fim do mês, todos terão contribuído de forma equilibrada

### 3. **Frequências de Tarefas**

| Frequência | Descrição | Exemplo |
|------------|-----------|---------|
| **Diária** | Toda vez que o motor roda (idealmente diariamente) | Lavar louça, passear com cachorro |
| **Semanal** | A cada 7 dias desde a última atribuição | Limpar banheiros, trocar lençóis |
| **Quinzenal** | A cada 14 dias desde a última atribuição | Limpar geladeira, lavar o carro |

### 4. **Pesos das Tarefas**

O peso representa o esforço/complexidade da tarefa:

| Peso | Descrição | Exemplo |
|------|-----------|---------|
| 1 | Muito leve - tarefa rápida | Tirar o lixo (2 min) |
| 2 | Leve - tarefa simples | Dar comida ao pet (5 min) |
| 3 | Médio - tarefa normal | Lavar a louça (15 min) |
| 4 | Pesado - tarefa trabalhosa | Limpar banheiro (30 min) |
| 5 | Muito pesado - tarefa complexa | Lavar roupas completo (1h+) |

## 📊 Índice de Justiça

O sistema calcula um **Índice de Justiça** que mede o quão equilibrada está a distribuição:

```typescript
fairnessIndex = 100 - (spread / average) * 100
```

- **100 = Perfeitamente Justo**: todos têm o mesmo placar
- **0 = Muito Desigual**: grande diferença entre os placares

## 🔧 Implementação Técnica

### **Estrutura de Arquivos**

```
src/
├── services/
│   ├── distributionService.ts   # Lógica do motor
│   └── firestoreService.ts       # Funções de banco de dados
├── hooks/
│   └── useTaskDistribution.ts    # Hook para gerenciar distribuição
├── pages/
│   └── TasksPage.tsx             # Interface da distribuição
└── types/
    └── index.ts                  # Tipos MonthlyScore e DailyAssignment
```

### **Tipos de Dados**

#### **MonthlyScore**
```typescript
interface MonthlyScore {
  id: string;
  userId: string;
  homeId: string;
  monthKey: string;      // 'YYYY-MM' (ex: '2025-11')
  score: number;         // Pontuação acumulada
  tasksAssigned: number; // Número de tarefas atribuídas
  totalWeight: number;   // Soma dos pesos
  lastUpdated: Date;
}
```

#### **DailyAssignment**
```typescript
interface DailyAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  taskWeight: number;
  assignedToId: string;
  assignedToName: string;
  homeId: string;
  dateKey: string;       // 'YYYY-MM-DD' (ex: '2025-11-03')
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}
```

### **Funções Principais**

#### **distributeDailyTasks**
Função principal do motor que executa a distribuição:
```typescript
const result = distributeDailyTasks(
  allTasks,           // Todas as tarefas cadastradas
  members,            // Membros do lar
  monthlyScores,      // Placares do mês
  existingAssignments,// Atribuições anteriores
  homeId              // ID do lar
);
```

#### **weightedRandomSelection**
Realiza sorteio ponderado baseado nos placares:
```typescript
const selectedUserId = weightedRandomSelection(members, currentScores);
```

#### **shouldTaskRunToday**
Verifica se uma tarefa deve ser executada hoje:
```typescript
const shouldRun = shouldTaskRunToday(task, lastAssignment);
```

## 🎮 Como Usar

### **Na Interface (TasksPage)**

1. **Botão "Distribuir Tarefas de Hoje"**
   - Clique para executar o motor de distribuição
   - Tarefas serão atribuídas automaticamente
   - Placares serão atualizados

2. **Visualização das Tarefas**
   - Agrupadas por pessoa
   - Mostram progresso (X/Y concluídas)
   - Checkbox para marcar como completa

3. **Informação de Peso**
   - Cada tarefa mostra seu peso (1-5)
   - Indica o esforço necessário

### **Via Hook (useTaskDistribution)**

```typescript
const { 
  assignments,      // Tarefas do dia
  monthlyScores,    // Placares do mês
  loading,          // Estado de carregamento
  error,            // Mensagem de erro
  distribute,       // Função para distribuir tarefas
  completeTask,     // Função para completar tarefa
  refresh           // Função para recarregar dados
} = useTaskDistribution(homeId);

// Distribuir tarefas
await distribute();

// Marcar como completa
await completeTask(assignmentId);
```

## 🔮 Exemplo Prático

### **Cenário: Segunda-feira de manhã**

**Tarefas cadastradas:**
- Lavar louça (Peso 3, Diária)
- Tirar lixo (Peso 2, Diária)
- Limpar banheiro (Peso 5, Semanal)
- Passear com cachorro (Peso 2, Diária)

**Placar atual (meio do mês):**
- Pai: 45 pontos
- Mãe: 38 pontos

**Execução do Motor:**

1. **Tarefa: Limpar banheiro (Peso 5)**
   - Mãe tem 60% de chance (score menor)
   - Pai tem 40% de chance
   - **Sorteio:** Mãe é selecionada
   - **Placar atualizado:** Pai: 45, Mãe: 43

2. **Tarefa: Lavar louça (Peso 3)**
   - Mãe tem 52% de chance
   - Pai tem 48% de chance (quase igual agora!)
   - **Sorteio:** Pai é selecionado
   - **Placar atualizado:** Pai: 48, Mãe: 43

3. **Tarefa: Passear com cachorro (Peso 2)**
   - Mãe tem 55% de chance
   - Pai tem 45% de chance
   - **Sorteio:** Mãe é selecionada
   - **Placar atualizado:** Pai: 48, Mãe: 45

4. **Tarefa: Tirar lixo (Peso 2)**
   - Probabilidades quase iguais
   - **Sorteio:** Pai é selecionado
   - **Placar final:** Pai: 50, Mãe: 45

**Resultado:** Distribuição equilibrada com diferença de apenas 5 pontos!

## 🚀 Próximos Passos

### **Melhorias Futuras**

1. **Execução Automática**
   - Implementar Firebase Cloud Functions para rodar à meia-noite
   - Notificações push com as tarefas do dia

2. **Preferências**
   - Permitir que membros indiquem tarefas preferidas/detestadas
   - Considerar disponibilidade (ex: trabalha de manhã)

3. **Análises**
   - Gráficos de evolução do placar
   - Estatísticas de conclusão
   - Ranking mensal

4. **Gamificação**
   - Badges por sequências de dias
   - Desafios semanais
   - Sistema de recompensas

## 📚 Referências Técnicas

- **Algoritmo:** Weighted Random Selection
- **Padrão:** Strategy Pattern (diferentes frequências)
- **Banco de Dados:** Firestore (NoSQL)
- **Estado:** Custom Hooks (React)
- **Segurança:** Firestore Rules

---

**Desenvolvido com ❤️ para tornar a divisão de tarefas domésticas justa e divertida!**
