// Motor de Distribuição de Tarefas - A Lógica Central do DivideAí
// Garante distribuição justa e equilibrada de tarefas baseada em sorteio ponderado

import type { Task, HomeMember, MonthlyScore, DailyAssignment } from '../types';

// ============ UTILITÁRIOS DE DATA ============

/**
 * Gera chave do mês no formato YYYY-MM
 */
export const getMonthKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Gera chave do dia no formato YYYY-MM-DD
 */
export const getDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Verifica se uma tarefa deve ser executada hoje baseado na frequência
 */
export const shouldTaskRunToday = (task: Task, lastAssignment?: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Se nunca foi atribuída, deve rodar hoje
  if (!lastAssignment) {
    return true;
  }

  const lastDate = new Date(lastAssignment);
  lastDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (task.frequency) {
    case 'diaria':
      return daysDiff >= 1;
    case 'semanal':
      return daysDiff >= 7;
    case 'quinzenal':
      return daysDiff >= 14;
    default:
      return false;
  }
};

// ============ PLACAR DE JUSTIÇA ============

/**
 * Calcula o placar atual de todos os membros para o mês corrente
 */
export const calculateCurrentScores = (
  members: HomeMember[],
  monthlyScores: MonthlyScore[]
): Map<string, number> => {
  const scoreMap = new Map<string, number>();

  // Inicializar todos os membros com score 0
  members.forEach(member => {
    scoreMap.set(member.userId, 0);
  });

  // Aplicar scores do mês atual
  const currentMonth = getMonthKey();
  monthlyScores
    .filter(score => score.monthKey === currentMonth)
    .forEach(score => {
      scoreMap.set(score.userId, score.score);
    });

  return scoreMap;
};

// ============ SORTEIO PONDERADO ============

/**
 * Realiza sorteio ponderado: membros com menor score têm maior chance
 * Algoritmo:
 * 1. Calcula o "peso inverso" de cada membro (quanto menor o score, maior o peso)
 * 2. Sorteia baseado nesses pesos
 */
export const weightedRandomSelection = (
  members: HomeMember[],
  currentScores: Map<string, number>
): string => {
  if (members.length === 0) {
    throw new Error('Nenhum membro disponível para sorteio');
  }

  if (members.length === 1) {
    return members[0].userId;
  }

  // Calcular peso inverso para cada membro
  // Fórmula: peso = (maxScore + 1) - score
  // +1 para evitar peso zero quando todos têm o mesmo score
  const scores = members.map(m => currentScores.get(m.userId) || 0);
  const maxScore = Math.max(...scores);
  
  const weights = members.map(member => {
    const score = currentScores.get(member.userId) || 0;
    // Quanto menor o score, maior o peso
    return maxScore + 10 - score; // +10 para dar uma base mínima de chance
  });

  // Calcular soma total dos pesos
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Gerar número aleatório entre 0 e totalWeight
  const random = Math.random() * totalWeight;

  // Selecionar membro baseado no peso
  let accumulated = 0;
  for (let i = 0; i < members.length; i++) {
    accumulated += weights[i];
    if (random <= accumulated) {
      return members[i].userId;
    }
  }

  // Fallback (não deveria acontecer)
  return members[members.length - 1].userId;
};

// ============ MOTOR DE DISTRIBUIÇÃO ============

export interface DistributionResult {
  assignments: DailyAssignment[];
  updatedScores: Map<string, number>;
  success: boolean;
  message?: string;
}

/**
 * Distribui tarefas do dia de forma justa e equilibrada
 * Este é o coração do DivideAí!
 * 
 * Algoritmo:
 * 1. Identifica tarefas que devem rodar hoje
 * 2. Para cada tarefa:
 *    a) Verifica placar atual
 *    b) Faz sorteio ponderado (quem tem menos pontos tem mais chance)
 *    c) Atribui tarefa ao sorteado
 *    d) Atualiza placar
 * 3. Retorna atribuições e placares atualizados
 */
export const distributeDailyTasks = (
  allTasks: Task[],
  members: HomeMember[],
  monthlyScores: MonthlyScore[],
  existingAssignments: DailyAssignment[],
  homeId: string
): DistributionResult => {
  try {
    if (members.length === 0) {
      return {
        assignments: [],
        updatedScores: new Map(),
        success: false,
        message: 'Nenhum membro no lar para distribuir tarefas'
      };
    }

    const today = getDateKey();
    const assignments: DailyAssignment[] = [];

    // Filtrar tarefas já atribuídas hoje
    const assignedTaskIds = existingAssignments
      .filter(a => a.dateKey === today)
      .map(a => a.taskId);

    // Identificar tarefas que precisam rodar hoje e ainda não foram atribuídas
    const tasksForToday = allTasks.filter(task => {
      if (assignedTaskIds.includes(task.id)) {
        return false; // Já foi atribuída hoje
      }

      // Buscar última atribuição desta tarefa (ordenar por dateKey, não createdAt)
      const lastAssignment = existingAssignments
        .filter(a => a.taskId === task.id)
        .sort((a, b) => b.dateKey.localeCompare(a.dateKey))[0];

      // Converter dateKey para Date para verificar frequência
      const lastAssignmentDate = lastAssignment ? new Date(lastAssignment.dateKey + 'T00:00:00') : undefined;

      return shouldTaskRunToday(task, lastAssignmentDate);
    });

    if (tasksForToday.length === 0) {
      return {
        assignments: [],
        updatedScores: calculateCurrentScores(members, monthlyScores),
        success: true,
        message: 'Nenhuma tarefa nova para hoje'
      };
    }

    // Inicializar placar atual
    const currentScores = calculateCurrentScores(members, monthlyScores);

    // Distribuir cada tarefa
    tasksForToday.forEach(task => {
      // Sortear membro baseado no placar
      const selectedUserId = weightedRandomSelection(members, currentScores);
      const selectedMember = members.find(m => m.userId === selectedUserId)!;

      // Criar atribuição
      const assignment: DailyAssignment = {
        id: '', // Será gerado pelo Firestore
        taskId: task.id,
        taskTitle: task.title,
        taskWeight: task.weight,
        assignedToId: selectedUserId,
        assignedToName: selectedMember.userName || 'Usuário',
        homeId,
        dateKey: today,
        completed: false,
        createdAt: new Date()
      };

      assignments.push(assignment);

      // Atualizar placar local
      const currentScore = currentScores.get(selectedUserId) || 0;
      currentScores.set(selectedUserId, currentScore + task.weight);
    });

    return {
      assignments,
      updatedScores: currentScores,
      success: true,
      message: `${assignments.length} tarefa(s) distribuída(s) com sucesso`
    };

  } catch (error) {
    return {
      assignments: [],
      updatedScores: new Map(),
      success: false,
      message: `Erro na distribuição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};

// ============ ANÁLISE E RELATÓRIOS ============

/**
 * Calcula estatísticas do placar para visualização
 */
export const calculateScoreStatistics = (
  members: HomeMember[],
  monthlyScores: MonthlyScore[]
) => {
  const currentScores = calculateCurrentScores(members, monthlyScores);
  const scores = Array.from(currentScores.values());

  if (scores.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      spread: 0,
      fairnessIndex: 100 // 100% justo se não há dados
    };
  }

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const spread = max - min;

  // Índice de justiça: quanto menor o spread em relação à média, mais justo
  // 100 = perfeito, 0 = muito desigual
  const fairnessIndex = average > 0 
    ? Math.max(0, 100 - (spread / average) * 100)
    : 100;

  return {
    average: Math.round(average * 10) / 10,
    min,
    max,
    spread,
    fairnessIndex: Math.round(fairnessIndex)
  };
};

// ============ VALIDAÇÃO DE MEMBROS ============

/**
 * Valida e garante que todos os membros (admin e member) estão inclusos
 * IMPORTANTE: Admins SEMPRE devem participar da distribuição!
 */
export const validateMembersForDistribution = (members: HomeMember[]): HomeMember[] => {
  if (members.length === 0) {
    return [];
  }

  // Remover duplicatas e garantir que todos estão presentes
  const uniqueMembers = new Map<string, HomeMember>();
  members.forEach(member => {
    // Incluir TODOS os membros: admin, member, ou qualquer outro role
    uniqueMembers.set(member.userId, member);
  });

  const validatedMembers = Array.from(uniqueMembers.values());

  return validatedMembers;
};
