// Hook personalizado para gerenciar distribuição automática de tarefas
// Aciona o motor de distribuição e gerencia o estado das atribuições

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getHomeTasksById,
  getHomeMembers,
  getMonthlyScores,
  getDailyAssignments,
  getAllAssignments,
  saveDailyAssignments,
  updateMonthlyScoresFromAssignments,
  completeAssignment as completeAssignmentService,
} from '../services/firestoreService';
import { distributeDailyTasks, validateMembersForDistribution } from '../services/distributionService';
import { onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getDateKey, getMonthKey } from '../services/distributionService';
import type { DailyAssignment, MonthlyScore } from '../types';

interface UseTaskDistributionReturn {
  assignments: DailyAssignment[];
  monthlyScores: MonthlyScore[];
  loading: boolean;
  error: string | null;
  distribute: () => Promise<void>;
  completeTask: (assignmentId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useTaskDistribution = (homeId: string | undefined): UseTaskDistributionReturn => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<DailyAssignment[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega dados necessários para a distribuição (usado apenas para distribuição, não para tempo real)
   */
  const loadData = useCallback(async () => {
    if (!homeId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar atribuições do dia e placar mensal
      const [todayAssignments, scores] = await Promise.all([
        getDailyAssignments(homeId),
        getMonthlyScores(homeId),
      ]);

      setAssignments(todayAssignments);
      setMonthlyScores(scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [homeId, user]);

  /**
   * Configura listeners em tempo real para atribuições e placares
   */
  const setupRealtimeListeners = useCallback(() => {
    if (!homeId) return;

    setLoading(true);
    setError(null);

    // Listener para atribuições diárias
    const today = getDateKey();
    const assignmentsQuery = query(
      collection(db, 'dailyAssignments'),
      where('homeId', '==', homeId),
      where('dateKey', '==', today)
    );

    const assignmentsUnsubscribe = onSnapshot(
      assignmentsQuery,
      (snapshot) => {
        const assignmentsData = snapshot.docs
          .map(doc => {
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
              createdAt: data.createdAt?.toDate?.() || new Date(),
              skipped: data.skipped || false,
              skippedAt: data.skippedAt?.toDate?.(),
              skippedBy: data.skippedBy,
            };
          })
          .filter(assignment => !assignment.skipped); // Filtra tarefas puladas
        setAssignments(assignmentsData);
        setLoading(false);
      },
      (_error) => {
        setError('Erro ao ouvir mudanças nas atribuições');
        setLoading(false);
      }
    );

    // Listener para placares mensais
    const currentMonth = getMonthKey();
    const scoresQuery = query(
      collection(db, 'monthlyScores'),
      where('homeId', '==', homeId),
      where('monthKey', '==', currentMonth)
    );

    const scoresUnsubscribe = onSnapshot(
      scoresQuery,
      (snapshot) => {
        const scoresData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            homeId: data.homeId,
            monthKey: data.monthKey,
            score: data.score || 0,
            tasksAssigned: data.tasksAssigned || 0,
            totalWeight: data.totalWeight || 0,
            lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
          };
        });
        setMonthlyScores(scoresData);
      },
      (_error) => {
        setError('Erro ao ouvir mudanças nos placares');
      }
    );

    // Retornar função de cleanup
    return () => {
      assignmentsUnsubscribe();
      scoresUnsubscribe();
    };
  }, [homeId]);

  /**
   * Executa a distribuição automática de tarefas
   */
  const distribute = useCallback(async () => {
    if (!homeId || !user) {
      setError('ID do lar ou usuário não disponível');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Carregar dados necessários
      const [allTasks, members, scores, existingAssignments] = await Promise.all([
        getHomeTasksById(homeId),
        getHomeMembers(homeId),
        getMonthlyScores(homeId),
        getAllAssignments(homeId),
      ]);

      // Validar que todos os membros estão inclusos (admin e member)
      const validatedMembers = validateMembersForDistribution(members);

      if (allTasks.length === 0) {
        setError('Nenhuma tarefa cadastrada. Cadastre tarefas antes de distribuir.');
        setLoading(false);
        return;
      }

      // Executar algoritmo de distribuição
      const result = distributeDailyTasks(
        allTasks,
        validatedMembers,
        scores,
        existingAssignments,
        homeId
      );

      if (!result.success) {
        setError(result.message || 'Erro na distribuição');
        setLoading(false);
        return;
      }

      if (result.assignments.length === 0) {
        // Nenhuma tarefa nova, apenas recarregar
        await loadData();
        return;
      }

      // Salvar atribuições no Firestore
      await saveDailyAssignments(result.assignments);

      // Atualizar placares mensais
      await updateMonthlyScoresFromAssignments(homeId, result.updatedScores);

      // Recarregar dados
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao distribuir tarefas');
    } finally {
      setLoading(false);
    }
  }, [homeId, user, loadData]);

  /**
   * Marca uma tarefa como completa
   */
  const completeTask = useCallback(async (assignmentId: string) => {
    try {
      setError(null);
      await completeAssignmentService(assignmentId);
      // Não precisa atualizar estado local - os listeners farão isso automaticamente
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar tarefa');
      throw err;
    }
  }, []);

  /**
   * Recarrega todos os dados (usado apenas para distribuição)
   */
  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Configurar listeners em tempo real ao montar
  useEffect(() => {
    if (!homeId) return;

    const cleanup = setupRealtimeListeners();
    return cleanup; // Cleanup na desmontagem
  }, [setupRealtimeListeners]);

  return {
    assignments,
    monthlyScores,
    loading,
    error,
    distribute,
    completeTask,
    refresh,
  };
};
