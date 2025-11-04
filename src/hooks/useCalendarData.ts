import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { DailyAssignment, Task } from '../types';

interface UseCalendarDataOptions {
  homeId: string;
  tasks?: Task[]; // Adicionar tarefas como parâmetro opcional
}

export function useCalendarData({ homeId, tasks = [] }: UseCalendarDataOptions) {
  const [assignments, setAssignments] = useState<DailyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Criar uma versão serializada de tasks para usar como dependência
  // Isso evita re-renders quando tasks é um novo array mas com os mesmos valores
  const tasksKey = tasks.map(t => t.id).join(',');

  // Carregar todas as atribuições do lar com listener em tempo real
  useEffect(() => {
    if (!homeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query para todas as atribuições do lar
    const assignmentsQuery = query(
      collection(db, 'dailyAssignments'),
      where('homeId', '==', homeId)
    );

    const unsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const assignmentsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            taskId: data.taskId,
            taskTitle: data.taskTitle,
            taskWeight: data.taskWeight,
            assignedToId: data.assignedToId,
            assignedToName: data.assignedToName,
            homeId: data.homeId,
            dateKey: data.dateKey,
            completed: data.completed || false,
            completedAt: data.completedAt?.toDate?.(),
            skipped: data.skipped || false,
            skippedAt: data.skippedAt?.toDate?.(),
            skippedBy: data.skippedBy,
            swapped: data.swapped || false,
            swappedAt: data.swappedAt?.toDate?.(),
            swappedWith: data.swappedWith,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          };
        });

        // Gerar atribuições virtuais para tarefas recorrentes que ainda não foram atribuídas
        const virtualAssignments = generateVirtualAssignments(tasks, assignmentsData, homeId);

        // Combinar atribuições reais com virtuais
        const allAssignments = [...assignmentsData, ...virtualAssignments];

        setAssignments(allAssignments);
        setIsLoading(false);
      },
      (err) => {
        const message = err instanceof Error ? err.message : 'Erro ao carregar tarefas';
        setError(message);
        console.error('Erro ao ouvir mudanças nas atribuições:', err);
        setIsLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [homeId, tasksKey]);

  // Filtrar atribuições por intervalo de datas
  const getAssignmentsByDateRange = (startDate: Date, endDate: Date): DailyAssignment[] => {
    const startKey = formatDateKey(startDate);
    const endKey = formatDateKey(endDate);

    return assignments.filter(assignment => {
      const assignmentKey = assignment.dateKey;
      return assignmentKey >= startKey && assignmentKey <= endKey;
    });
  };

  // Filtrar atribuições por mês
  const getAssignmentsByMonth = (date: Date): DailyAssignment[] => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;

    return assignments.filter(assignment =>
      assignment.dateKey.startsWith(monthKey)
    );
  };

  // Filtrar atribuições por membro
  const getAssignmentsByUser = (userId: string): DailyAssignment[] => {
    return assignments.filter(assignment => assignment.assignedToId === userId);
  };

  // Contar tarefas por status em um intervalo de datas
  const getTaskCountsByDateRange = (startDate: Date, endDate: Date) => {
    const dateAssignments = getAssignmentsByDateRange(startDate, endDate);
    return {
      total: dateAssignments.length,
      completed: dateAssignments.filter(a => a.completed).length,
      pending: dateAssignments.filter(a => !a.completed).length,
    };
  };

  // Obter estatísticas por mês
  const getMonthStats = (date: Date) => {
    const monthAssignments = getAssignmentsByMonth(date);
    const byUser = new Map<string, DailyAssignment[]>();

    monthAssignments.forEach(assignment => {
      if (!byUser.has(assignment.assignedToId)) {
        byUser.set(assignment.assignedToId, []);
      }
      byUser.get(assignment.assignedToId)!.push(assignment);
    });

    const stats = {
      total: monthAssignments.length,
      completed: monthAssignments.filter(a => a.completed).length,
      pending: monthAssignments.filter(a => !a.completed).length,
      byUser: Array.from(byUser.entries()).map(([userId, userAssignments]) => ({
        userId,
        userName: userAssignments[0]?.assignedToName || 'Desconhecido',
        total: userAssignments.length,
        completed: userAssignments.filter(a => a.completed).length,
        pending: userAssignments.filter(a => !a.completed).length,
      })),
    };

    return stats;
  };

  // Formatar chave de data (YYYY-MM-DD)
  function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Marcar atribuição como completa
  const markAssignmentAsCompleted = async (assignmentId: string) => {
    try {
      // Atualizar o estado localmente para feedback imediato
      setAssignments(prev =>
        prev.map(a =>
          a.id === assignmentId
            ? { ...a, completed: true, completedAt: new Date() }
            : a
        )
      );

      // Atualizar no Firestore
      const { completeAssignment } = await import('../services/firestoreService');
      await completeAssignment(assignmentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao marcar tarefa como completa';
      setError(message);
      console.error('Erro ao marcar atribuição como completa:', err);
    }
  };

  return {
    assignments,
    isLoading,
    error,
    getAssignmentsByDateRange,
    getAssignmentsByMonth,
    getAssignmentsByUser,
    getTaskCountsByDateRange,
    getMonthStats,
    markAssignmentAsCompleted,
  };
}

// Função auxiliar para gerar atribuições virtuais de tarefas recorrentes
function generateVirtualAssignments(tasks: Task[], existingAssignments: DailyAssignment[], homeId: string): DailyAssignment[] {
  const virtualAssignments: DailyAssignment[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Gerar datas para o mês atual (do primeiro dia até o último)
  const firstDay = new Date(currentYear, currentMonth, 1);
  firstDay.setHours(0, 0, 0, 0);
  
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  lastDay.setHours(0, 0, 0, 0);

  // Para cada tarefa recorrente
  tasks.filter(task => task.frequency === 'diaria' || task.frequency === 'semanal' || task.frequency === 'quinzenal').forEach(task => {
    // Para cada dia do mês
    const currentDateLoop = new Date(firstDay);
    
    while (currentDateLoop <= lastDay) {
      const dateKey = formatDateKey(currentDateLoop);
      let shouldCreateVirtual = false;

      if (task.frequency === 'diaria') {
        // Tarefas diárias aparecem todos os dias
        shouldCreateVirtual = true;
      } else if (task.frequency === 'semanal') {
        // Tarefas semanais aparecem a cada 7 dias a partir da data de criação
        const createdDate = new Date(task.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDateLoop.getTime() - createdDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Aparece no dia da criação e a cada 7 dias depois
        shouldCreateVirtual = diffDays >= 0 && diffDays % 7 === 0;
      } else if (task.frequency === 'quinzenal') {
        // Tarefas quinzenais aparecem a cada 15 dias a partir da data de criação
        const createdDate = new Date(task.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDateLoop.getTime() - createdDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Aparece no dia da criação e a cada 15 dias depois
        shouldCreateVirtual = diffDays >= 0 && diffDays % 15 === 0;
      }

      if (shouldCreateVirtual) {
        // Verificar se já existe uma atribuição real para esta tarefa neste dia
        const existingAssignment = existingAssignments.find(a =>
          a.taskId === task.id && a.dateKey === dateKey && !a.isVirtual
        );

        if (!existingAssignment) {
          // Criar atribuição virtual
          virtualAssignments.push({
            id: `virtual-${task.id}-${dateKey}`, // ID virtual único
            taskId: task.id,
            taskTitle: task.title,
            taskWeight: task.weight,
            taskFrequency: task.frequency, // Adicionar frequência da tarefa
            assignedToId: '', // Ainda não atribuído
            assignedToName: 'Não atribuído', // Placeholder
            homeId,
            dateKey,
            completed: false,
            createdAt: new Date(),
            isVirtual: true, // Flag para identificar atribuições virtuais
          });
        }
      }
      
      // Avançar para o próximo dia
      currentDateLoop.setDate(currentDateLoop.getDate() + 1);
    }
  });

  return virtualAssignments;
}

// Formatar chave de data (YYYY-MM-DD) - função auxiliar
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
