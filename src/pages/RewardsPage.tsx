// Página de Relatório de Tarefas - Análise completa de desempenho

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { getAllAssignments, getHomeMembers, ensureAdminInHomeMembers } from '../services/firestoreService';
import type { DailyAssignment, HomeMember } from '../types';

interface MemberReport {
  userId: string;
  name: string;
  initials: string;
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
  totalWeight: number;
  weightCompleted: number;
  streak: number;
  lastCompletion?: Date;
}

interface TaskReport {
  taskId: string;
  title: string;
  weight: number;
  totalAssignments: number;
  totalCompletions: number;
  completionRate: number;
  lastCompleted?: Date;
}

export function RewardsPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const { user } = useAuth();
  
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [assignments, setAssignments] = useState<DailyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!homeId || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Garantir que o admin está em homeMembers
        await ensureAdminInHomeMembers(homeId, user.id, user.name || 'Usuário');

        const [homeMembers, allAssignments] = await Promise.all([
          getHomeMembers(homeId),
          getAllAssignments(homeId),
        ]);

        setMembers(homeMembers);
        setAssignments(allAssignments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [homeId, user]);

  // Filtrar dados por período
  const getFilteredAssignments = (): DailyAssignment[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return assignments.filter(a => {
      const createdDate = new Date(a.createdAt);
      const assignDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

      if (selectedPeriod === 'week') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return assignDate >= sevenDaysAgo;
      } else if (selectedPeriod === 'month') {
        return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  // Gerar relatório por membro
  const getMemberReports = (): MemberReport[] => {
    const filtered = getFilteredAssignments();

    return members.map(member => {
      const memberAssignments = filtered.filter(a => a.assignedToId === member.userId);
      const completed = memberAssignments.filter(a => a.completed);

      // Calcular streak (dias consecutivos com tarefas completadas)
      let streak = 0;
      if (completed.length > 0) {
        const sortedDates = [...new Set(completed.map(a => a.dateKey))].sort().reverse();
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i]);
          const nextDate = i === 0 
            ? new Date(today)
            : new Date(sortedDates[i + 1]);
          
          const diffDays = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            streak++;
          } else {
            break;
          }
        }
      }

      const totalWeight = memberAssignments.reduce((sum, a) => sum + a.taskWeight, 0);
      const weightCompleted = completed.reduce((sum, a) => sum + a.taskWeight, 0);
      const completionRate = memberAssignments.length > 0
        ? Math.round((completed.length / memberAssignments.length) * 100)
        : 0;

      const initials = (member.userName || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      return {
        userId: member.userId,
        name: member.userName || 'Usuário',
        initials,
        totalAssigned: memberAssignments.length,
        totalCompleted: completed.length,
        completionRate,
        totalWeight,
        weightCompleted,
        streak,
        lastCompletion: completed.length > 0 ? completed[completed.length - 1].completedAt : undefined,
      };
    });
  };

  // Gerar relatório por tarefa
  const getTaskReports = (): TaskReport[] => {
    const filtered = getFilteredAssignments();
    const taskMap = new Map<string, TaskReport>();

    filtered.forEach(assignment => {
      if (!taskMap.has(assignment.taskId)) {
        taskMap.set(assignment.taskId, {
          taskId: assignment.taskId,
          title: assignment.taskTitle,
          weight: assignment.taskWeight,
          totalAssignments: 0,
          totalCompletions: 0,
          completionRate: 0,
          lastCompleted: undefined,
        });
      }

      const report = taskMap.get(assignment.taskId)!;
      report.totalAssignments++;
      if (assignment.completed) {
        report.totalCompletions++;
        if (!report.lastCompleted || assignment.completedAt! > report.lastCompleted) {
          report.lastCompleted = assignment.completedAt;
        }
      }
      report.completionRate = Math.round((report.totalCompletions / report.totalAssignments) * 100);
    });

    return Array.from(taskMap.values()).sort((a, b) => b.completionRate - a.completionRate);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-secondary-600 dark:text-gray-300">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  const memberReports = getMemberReports().sort((a, b) => b.completionRate - a.completionRate);
  const taskReports = getTaskReports();
  const filteredAssignments = getFilteredAssignments();
  const totalCompleted = filteredAssignments.filter(a => a.completed).length;
  const totalAssigned = filteredAssignments.length;

  // Paginação para tarefas
  const totalPages = Math.ceil(taskReports.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = taskReports.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="bg-neutral-white dark:bg-gray-800 shadow-sm border-b border-secondary-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Relatório de Tarefas</h1>
            <p className="text-sm text-secondary-600 dark:text-gray-300 mt-1">Análise completa de desempenho</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Erro */}
        {error && (
          <div className="mb-4 p-4 bg-danger-50 dark:bg-red-900/20 border border-danger-200 dark:border-red-800 rounded-lg">
            <p className="text-danger-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Filtro de Período */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setSelectedPeriod('week');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-600 text-secondary-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500'
            }`}
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => {
              setSelectedPeriod('month');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-600 text-secondary-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500'
            }`}
          >
            Este mês
          </button>
          <button
            onClick={() => {
              setSelectedPeriod('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-600 text-secondary-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500'
            }`}
          >
            Todos os tempos
          </button>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-white dark:bg-gray-800 rounded-lg p-4 border border-secondary-200 dark:border-gray-700">
            <p className="text-sm text-secondary-600 dark:text-gray-300 mb-1">Total Atribuído</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalAssigned}</p>
          </div>
          <div className="bg-neutral-white dark:bg-gray-800 rounded-lg p-4 border border-secondary-200 dark:border-gray-700">
            <p className="text-sm text-secondary-600 dark:text-gray-300 mb-1">Completadas</p>
            <p className="text-3xl font-bold text-success-600 dark:text-success-400">{totalCompleted}</p>
          </div>
          <div className="bg-neutral-white dark:bg-gray-800 rounded-lg p-4 border border-secondary-200 dark:border-gray-700">
            <p className="text-sm text-secondary-600 dark:text-gray-300 mb-1">Taxa Geral</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0}%
            </p>
          </div>
          <div className="bg-neutral-white dark:bg-gray-800 rounded-lg p-4 border border-secondary-200 dark:border-gray-700">
            <p className="text-sm text-secondary-600 dark:text-gray-300 mb-1">Membros Ativos</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{memberReports.length}</p>
          </div>
        </div>

        {/* Desempenho por Membro */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-4">Desempenho por Membro</h2>
          <div className="grid grid-cols-3 gap-4">
            {memberReports.map(member => (
              <div key={member.userId} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center border-2 border-blue-200 dark:border-blue-700">
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{member.initials}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900 dark:text-white">{member.name}</h3>
                      <p className="text-xs text-secondary-500 dark:text-gray-400">
                        {member.totalCompleted}/{member.totalAssigned} tarefas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{member.completionRate}%</p>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-500 dark:bg-blue-400 transition-all"
                    style={{ width: `${member.completionRate}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-700 dark:text-blue-300">Peso Feito</p>
                    <p className="font-bold text-blue-900 dark:text-blue-100">{member.weightCompleted}/{member.totalWeight}</p>
                  </div>
                  <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-700 dark:text-blue-300">Streak</p>
                    <p className="font-bold text-blue-900 dark:text-blue-100">{member.streak}d</p>
                  </div>
                  <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-700 dark:text-blue-300">Última</p>
                    <p className="font-bold text-blue-900 dark:text-blue-100">
                      {member.lastCompletion
                        ? new Date(member.lastCompletion).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Relatório de Tarefas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Desempenho das Tarefas</h2>
            <div className="text-sm text-secondary-600 dark:text-gray-400">
              {startIndex + 1}-{Math.min(endIndex, taskReports.length)} de {taskReports.length} tarefas
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTasks.map(task => (
              <div key={task.taskId} className="bg-neutral-white dark:bg-gray-800 rounded-lg p-4 border border-secondary-200 dark:border-gray-700 hover:shadow-md transition-shadow relative">
                <div className="absolute top-3 right-3 w-2 h-2 bg-green-400 rounded-full" title="Tarefa"></div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-secondary-900 dark:text-white text-sm leading-tight flex-1 pr-2">
                    {task.title}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-semibold whitespace-nowrap">
                    Peso {task.weight}/5
                  </span>
                </div>

                {/* Barra de progresso */}
                <div className="w-full h-3 bg-secondary-200 dark:bg-gray-600 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary-500 dark:bg-primary-400 transition-all duration-300"
                    style={{ width: `${task.completionRate}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-secondary-50 dark:bg-gray-700 rounded">
                    <p className="text-secondary-600 dark:text-gray-300 mb-1">Atribuições</p>
                    <p className="font-bold text-secondary-900 dark:text-white text-lg">{task.totalAssignments}</p>
                  </div>
                  <div className="text-center p-2 bg-secondary-50 dark:bg-gray-700 rounded">
                    <p className="text-secondary-600 dark:text-gray-300 mb-1">Completadas</p>
                    <p className="font-bold text-secondary-900 dark:text-white text-lg">{task.totalCompletions}</p>
                  </div>
                </div>

                {/* Taxa de conclusão */}
                <div className="mt-3 pt-3 border-t border-secondary-100 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-600 dark:text-gray-300">Taxa de Conclusão</span>
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{task.completionRate}%</span>
                  </div>
                </div>

                {/* Última conclusão */}
                {task.lastCompleted && (
                  <div className="mt-2 text-xs text-secondary-500 dark:text-gray-400">
                    Última: {new Date(task.lastCompleted).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-neutral-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-600 rounded-lg text-secondary-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600 dark:text-gray-400">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-neutral-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-600 rounded-lg text-secondary-600 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </main>

      <Navigation />
    </div>
  );
}
