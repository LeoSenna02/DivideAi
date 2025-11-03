# 📅 Documentação - Tela de Calendário (Atualizada)

## Visão Geral

A tela de Calendário do DivideAí permite visualizar e gerenciar tarefas por data, com suporte a filtros, estatísticas mensais e interações com as atribuições diárias. Agora inclui **visualizações mensais e semanais completas**.

## 🆕 **Novidades - Visualização Semanal**

- ✅ **Cards detalhados** para cada dia da semana
- ✅ **Navegação entre semanas** com botões anterior/próximo
- ✅ **Barra de progresso** por dia
- ✅ **Lista de tarefas** com scroll interno
- ✅ **Layout responsivo** (1-7 colunas dependendo da tela)

## Arquitetura

A implementação segue a **Clean Architecture** com separação de responsabilidades:

### 1. **Componente `Calendar.tsx`** (UI Reutilizável)
- **Responsabilidade**: Renderizar o calendário visual e lidar com interações de UI
- **Props**:
  - `currentDate: Date` - Data atual do calendário
  - `onDateChange: (date: Date) => void` - Callback ao mudar mês/semana
  - `assignments: DailyAssignment[]` - Tarefas a exibir
  - `onAssignmentSelect: (assignment) => void` - Callback ao selecionar tarefa
  - `isLoading?: boolean` - Estado de carregamento

- **Funcionalidades**:
  - **Visualização Mensal**: Grid 7x6 (semanas completas) com indicadores visuais
  - **Visualização Semanal**: Cards detalhados para cada dia da semana
  - Navegação entre meses/semanas
  - Indicadores visuais de tarefas por dia (barra de progresso)
  - Destaque do dia atual
  - Exibição de até 2 tarefas por dia (com contador de extras)
  - Layout responsivo para mobile e desktop

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

## Visualizações Disponíveis

### 📅 **Visualização Mensal**
- Exibe o mês em um grid de 7 colunas × 6 linhas
- Destaca o dia atual com ring azul
- Mostra dias de meses anteriores/próximos em tom mais claro
- Barra de progresso indicando conclusão de tarefas
- Exibe até 2 tarefas por dia com ícones de status

### 📆 **Visualização Semanal** ⭐ **NOVO**
- Mostra os 7 dias da semana atual (segunda a domingo)
- Cards detalhados para cada dia com:
  - Nome do dia da semana e data
  - Barra de progresso de conclusão
  - Lista das tarefas do dia (até 3 visíveis)
  - Scroll para dias com muitas tarefas
- Navegação entre semanas
- Destaque visual para o dia atual

## Como Usar

### Acessar o Calendário
```tsx
// Em App.tsx, a rota é:
<Route path="/home/:homeId/calendar" element={<CalendarPage />} />
```

### Alternar entre Visualizações
- Use os botões "Mês" e "Semana" no header do calendário
- A navegação (setas) se adapta automaticamente à visualização atual

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

## Funcionalidades Principais

### 1. **Navegação Inteligente**
- **Mensal**: Botões anterior/próximo navegam entre meses
- **Semanal**: Botões anterior/próximo navegam entre semanas
- **Hoje**: Retorna à data atual independente da visualização

### 2. **Indicadores Visuais**
- **Barra de Progresso**: Mostra % de conclusão das tarefas
- **Cores de Status**: Verde (concluído), Amarelo (pendente)
- **Destaque do Dia Atual**: Ring azul e fundo claro
- **Contadores**: Número de tarefas por dia

### 3. **Interações**
- **Clique no Dia**: Seleciona o dia (visualização mensal)
- **Clique na Tarefa**: Abre modal de detalhes
- **Scroll**: Dias com muitas tarefas têm scroll interno

### 4. **Filtros e Estatísticas**
- **Filtro por Membro**: Mostra tarefas de membros específicos
- **Mostrar/Ocultar Concluídas**: Controle de visibilidade
- **Estatísticas do Mês**: Cards com métricas gerais

### 5. **Modal de Detalhes**
- Exibe informações completas da tarefa
- Botão para marcar como concluída (se pendente)
- Data e hora de conclusão (se aplicável)
- Status visual (concluída/pendente)

## Responsividade

### 📱 **Mobile**
- Header vertical com navegação compacta
- Cards de estatísticas em 2 colunas
- Dias do calendário menores (min-h-16)
- Modal otimizado para telas pequenas
- Texto e ícones ajustados

### 💻 **Desktop**
- Header horizontal completo
- Cards de estatísticas em 4 colunas
- Dias maiores com mais espaço
- Visualização semanal em grid responsivo (1-7 colunas)

## Performance

- **Carregamento Lazy**: Assignments carregados uma vez no hook
- **Memoização**: Funções filtro são otimizadas internamente
- **Feedback Imediato**: Atualizações de UI antes da confirmação Firestore

## Melhorias Futuras

1. **Visualização de Dia**: Detalhes completos de um dia específico
2. **Agendamento de Tarefas**: Arrastar tarefas entre datas
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

### Visualização semanal não funciona
1. Verificar se o botão "Semana" está sendo clicado
2. Confirmar que `currentDate` está sendo atualizada corretamente
3. Verificar se `getCurrentWeekDays()` está retornando datas válidas

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
- Sem exposição de dados sensíveis em URLs</content>
<parameter name="filePath">c:\Users\lorra\OneDrive\Casamento\Área de Trabalho\DivideAí\md\CALENDAR_PAGE_V2.md