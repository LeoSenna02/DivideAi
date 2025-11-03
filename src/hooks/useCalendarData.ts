import { useState, useEffect } from 'react';
import type { DailyAssignment } from '../types';
import { getAllAssignments } from '../services/firestoreService';

interface UseCalendarDataOptions {
  homeId: string;
}

export function useCalendarData({ homeId }: UseCalendarDataOptions) {
  const [assignments, setAssignments] = useState<DailyAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar todas as atribuições do lar
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllAssignments(homeId);
        setAssignments(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar tarefas';
        setError(message);
        console.error('Erro ao carregar atribuições:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (homeId) {
      loadAssignments();
    }
  }, [homeId]);

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
