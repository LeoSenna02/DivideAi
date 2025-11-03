# 📅 Documentação - Tela de Calendário

## Visão Geral

A tela de Calendário do DivideAí permite visualizar e gerenciar tarefas por data, com suporte a filtros, estatísticas mensais e interações com as atribuições diárias.

## Arquitetura

A implementação segue a **Clean Architecture** com separação de responsabilidades:

### 1. **Componente `Calendar.tsx`** (UI Reutilizável)
- **Responsabilidade**: Renderizar o calendário visual e lidar com interações de UI
- **Props**:
  - `currentDate: Date` - Data atual do calendário
  - `onDateChange: (date: Date) => void` - Callback ao mudar mês
  - `assignments: DailyAssignment[]` - Tarefas a exibir
  - `onAssignmentSelect: (assignment) => void` - Callback ao selecionar tarefa
  - `isLoading?: boolean` - Estado de carregamento

- **Funcionalidades**:
  - Visualização mensal com grid 7x6 (semanas completas)
  - Navegação entre meses
  - Indicadores visuais de tarefas por dia (barra de progresso)
  - Cores diferentes para mês atual/anterior
  - Destaque do dia atual
  - Exibição de até 2 tarefas por dia (com contador de extras)

### 2. **Hook `useCalendarData.ts`** (Lógica de Negócios)
- **Responsabilidade**: Gerenciar dados e lógica do calendário
- **Retorna**:
  - `assignments: DailyAssignment[]` - Todas as atribuições
  - `isLoading: boolean` - Estado de carregamento
  - `error: string | null` - Mensagens de erro
  - Funções utilitárias:
    - `getAssignmentsByDateRange()` - Filtrar por intervalo de datas
    - `getAssignmentsByMonth()` - Filtrar por mês
    - `getAssignmentsByUser()` - Filtrar por usuário
    - `getTaskCountsByDateRange()` - Contar tarefas em intervalo
    - `getMonthStats()` - Obter estatísticas do mês
    - `markAssignmentAsCompleted()` - Marcar tarefa como concluída

### 3. **Page `CalendarPage.tsx`** (Container/Orquestrador)
- **Responsabilidade**: Integrar componentes e gerenciar estado da página
- **Funcionalidades**:
  - Exibição de estatísticas do mês (total, concluídas, pendentes, taxa)
  - Filtros por membro e status
  - Modal de detalhes da tarefa
  - Listagem de tarefas do dia selecionado
  - Integração com Firestore

## Fluxo de Dados

```
CalendarPage (Container)
    ↓
  useCalendarData (Hook - Lógica)
    ↓
  Calendar (Componente - UI)
    ↓
  Firestore (Database)
```

## Como Usar

### Acessar o Calendário
```tsx
// Em App.tsx, a rota é:
<Route path="/home/:homeId/calendar" element={<CalendarPage />} />
```

### Integrar o Componente Calendar Isoladamente
```tsx
import { Calendar } from '@/components/Calendar';
import { useCalendarData } from '@/hooks/useCalendarData';

function MyComponent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState(null);
  
  const { assignments, isLoading } = useCalendarData({ homeId: 'home-123' });

  return (
    <Calendar
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      assignments={assignments}
      onAssignmentSelect={setSelected}
      isLoading={isLoading}
    />
  );
}
```

## Tipos de Dados

```typescript
interface DailyAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  taskWeight: number;
  assignedToId: string;
  assignedToName: string;
  homeId: string;
  dateKey: string; // Formato: 'YYYY-MM-DD'
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}
```

## Funcionalidades Principais

### 1. Visualização do Calendário
- Exibe o mês em um grid de 7 colunas × 6 linhas
- Destaca o dia atual com ring azul
- Mostra dias de meses anteriores/próximos em tom mais claro
- Barra de progresso indicando conclusão de tarefas
- Exibe até 2 tarefas por dia com ícones de status

### 2. Navegação
- Botões anterior/próximo para navegação entre meses
- Botão "Hoje" para retornar ao mês atual
- Abas para alternar entre visualizações (mês/semana)
- **Nota**: Visualização de semana está planejada para versão futura

### 3. Filtros
- **Filtro por Membro**: Mostrar tarefas de um membro específico
- **Mostrar Concluídas**: Checkbox para incluir/excluir tarefas concluídas

### 4. Estatísticas
- **Total de Tarefas**: Soma de todas as atribuições do mês
- **Concluídas**: Contagem de tarefas completadas
- **Pendentes**: Contagem de tarefas não completadas
- **Taxa de Conclusão**: Percentual de conclusão

### 5. Modal de Detalhes
- Exibe informações completas da tarefa
- Botão para marcar como concluída (se pendente)
- Data e hora de conclusão (se aplicável)
- Status visual (concluída/pendente)

### 6. Listagem Diária
- Exibe todas as tarefas do dia selecionado
- Cards com informações de responsável, peso e status
- Integração com o modal ao clicar

## Styling e Design System

O componente utiliza classes Tailwind do design system:
- **Cores Primárias**: `primary-*` (azul)
- **Cores de Status**: 
  - `success-*` (verde) - Tarefas concluídas
  - `warning-*` (amarelo) - Tarefas pendentes
  - `danger-*` (vermelho) - Erros
- **Cores Secundárias**: `secondary-*` (cinza)

## Performance

- **Carregamento Lazy**: Assignments carregados uma vez no hook
- **Memoização**: Funções filtro são otimizadas internamente
- **Feedback Imediato**: Atualizações de UI antes da confirmação Firestore

## Melhorias Futuras

1. **Visualização de Semana**: Implementar vista de semana com mais detalhes
2. **Agendamento de Tarefas**: Permitir arrastar tarefas entre datas
3. **Notificações**: Alertas para tarefas próximas do vencimento
4. **Exportação**: Baixar calendário em iCalendar (.ics)
5. **Integração com Google Calendar**: Sincronização bidirecional
6. **Repetição de Tarefas**: Suporte melhor para tarefas recorrentes
7. **Lembretes**: Sistema de notificações para tarefas pendentes

## Troubleshooting

### Tarefas não aparecem no calendário
1. Verificar se `homeId` está correto
2. Validar que as tarefas têm campo `dateKey` preenchido
3. Verificar permissões de leitura no Firestore

### Atualização não reflete imediatamente
1. O hook recarrega apenas ao montar e ao mudar `homeId`
2. Para atualização em tempo real, considere usar listeners do Firestore

### Performance lenta com muitas tarefas
1. Implementar paginação na listagem diária
2. Usar virtualização para calendários com muitas tarefas
3. Considerar agregação no backend

## Segurança

- Validação de `homeId` antes de executar queries
- Filtros respeitam permissões do usuário (via Firestore rules)
- Sem exposição de dados sensíveis em URLs
