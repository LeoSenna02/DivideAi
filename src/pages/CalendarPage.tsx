import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Calendar } from '../components/Calendar';
import { Select } from '../components/Select';
import { Checkbox } from '../components/Checkbox';
import { useCalendarData } from '../hooks/useCalendarData';
import { ensureAdminInHomeMembers, getHomeTasksById } from '../services/firestoreService';
import type { DailyAssignment, Task } from '../types';
import { FiX, FiCheck, FiClock, FiUser } from 'react-icons/fi';

export function CalendarPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAssignment, setSelectedAssignment] = useState<DailyAssignment | null>(null);
  const [filterUser, setFilterUser] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const modalRef = useRef<HTMLDivElement>(null);

  // Garantir que o admin está em homeMembers e carregar tarefas
  useEffect(() => {
    const loadData = async () => {
      if (homeId && user) {
        try {
          // Garantir admin
          await ensureAdminInHomeMembers(homeId, user.id, user.name || 'Usuário');
          
          // Carregar tarefas
          const homeTasks = await getHomeTasksById(homeId);
          setTasks(homeTasks);
        } catch (err) {
          console.error('Erro ao carregar dados:', err);
        }
      }
    };

    loadData();
  }, [homeId, user]);

  // Controla o scroll do body quando modal está aberto
  useEffect(() => {
    if (selectedAssignment) {
      // Salva o scroll atual
      const scrollY = window.scrollY;
      // Previne scroll do body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Restaura quando modal fecha
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedAssignment]);

  // Handler para click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  const {
    isLoading,
    error,
    getAssignmentsByMonth,
    getMonthStats,
    markAssignmentAsCompleted,
  } = useCalendarData({ homeId: homeId || '', tasks });

  if (!homeId) {
    return (
      <div className="min-h-screen bg-secondary-50 pb-20">
        <Navigation />
        <div className="text-center py-12">
          <p className="text-secondary-600">Erro: Lar não encontrado</p>
        </div>
      </div>
    );
  }

  // Obter tarefas do mês atual
  const monthAssignments = getAssignmentsByMonth(currentDate);
  
  // Aplicar filtros
  let filteredAssignments = monthAssignments;
  if (filterUser) {
    // Manter atribuições virtuais (sem assignedToId) e atribuições filtradas do usuário
    filteredAssignments = filteredAssignments.filter(a => 
      a.isVirtual || a.assignedToId === filterUser
    );
  }
  if (!showCompleted) {
    filteredAssignments = filteredAssignments.filter(a => !a.completed);
  }

  // Obter estatísticas do mês
  const monthStats = getMonthStats(currentDate);

  // Usuários únicos no mês
  const uniqueUsers = Array.from(
    new Map(
      monthAssignments
        .filter(a => a.assignedToId && a.assignedToId.trim() !== '') // Filtrar apenas assignments com assignedToId válido
        .map(a => [a.assignedToId, a.assignedToName])
    )
  ).map(([id, name]) => ({ id, name }));

  // Fechar modal de detalhes
  const closeModal = () => {
    setSelectedAssignment(null);
  };

  // Marcar como completa
  const handleCompleteAssignment = async () => {
    if (!selectedAssignment) return;
    try {
      await markAssignmentAsCompleted(selectedAssignment.id);
      setSelectedAssignment(null);
    } catch (err) {
      console.error('Erro ao marcar tarefa como completa:', err);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 pb-20">
      {/* Header */}
      <header className="bg-neutral-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Calendário</h1>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">Visualize e gerencie tarefas por data</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
            {error}
          </div>
        )}

        {/* Estatísticas do Mês */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-3 sm:p-4 border-l-4 border-primary-500">
            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Total de Tarefas</div>
            <div className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mt-1">{monthStats.total}</div>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-3 sm:p-4 border-l-4 border-success-500">
            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Concluídas</div>
            <div className="text-2xl sm:text-3xl font-bold text-success-600 dark:text-success-400 mt-1">{monthStats.completed}</div>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-3 sm:p-4 border-l-4 border-warning-500">
            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Pendentes</div>
            <div className="text-2xl sm:text-3xl font-bold text-warning-600 dark:text-warning-400 mt-1">{monthStats.pending}</div>
          </div>
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-3 sm:p-4 border-l-4 border-secondary-300 dark:border-secondary-600">
            <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 font-medium">Taxa de Conclusão</div>
            <div className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-100 mt-1">
              {monthStats.total > 0 ? Math.round((monthStats.completed / monthStats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 items-start sm:items-start">
            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-max">
              <Select
                label="Filtrar por Membro:"
                value={filterUser || ''}
                onChange={(e) => setFilterUser(e.target.value || null)}
                options={[
                  { value: '', label: 'Todos os membros' },
                  ...uniqueUsers.map(user => ({
                    value: user.id,
                    label: user.name
                  }))
                ]}
                placeholder="Todos os membros"
                fullWidth
              />
            </div>

            <div className="flex items-center w-full sm:w-auto sm:self-end sm:mb-2">
              <Checkbox
                label="Mostrar concluídas"
                checked={showCompleted}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowCompleted(e.target.checked)}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Calendário */}
        <Calendar
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          assignments={filteredAssignments}
          onAssignmentSelect={setSelectedAssignment}
          isLoading={isLoading}
        />

        {/* Resumo da Semana Selecionada */}
        {currentDate && (
          <div className="mt-6 sm:mt-8 bg-white dark:bg-secondary-800 rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
              Tarefas de {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>

            {filteredAssignments.filter(a => {
              // Comparar diretamente as chaves de data (formato YYYY-MM-DD)
              const currentDateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
              return a.dateKey === currentDateKey;
            }).length > 0 ? (
              <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg border border-secondary-200 dark:border-secondary-600">
                <div className="max-h-80 overflow-y-auto scroll-elegant">
                  <div className="divide-y divide-secondary-100 dark:divide-secondary-600">
                    {filteredAssignments
                      .filter(a => {
                        // Comparar diretamente as chaves de data (formato YYYY-MM-DD)
                        const currentDateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                        return a.dateKey === currentDateKey;
                      })
                      .sort((a, b) => {
                        // Tarefas não completadas primeiro (false vem antes de true)
                        if (a.completed !== b.completed) {
                          return a.completed ? 1 : -1;
                        }
                        // Se ambas têm o mesmo status, manter a ordem original
                        return 0;
                      })
                      .map(assignment => (
                        <div
                          key={assignment.id}
                          onClick={() => !assignment.isVirtual && setSelectedAssignment(assignment)}
                          className={`p-3 sm:p-4 cursor-pointer transition-all hover:bg-secondary-100 dark:hover:bg-secondary-600 ${
                            assignment.completed
                              ? 'bg-success-25 dark:bg-success-900/20'
                              : assignment.isVirtual
                              ? 'bg-gray-25 dark:bg-gray-800 opacity-60'
                              : 'bg-warning-25 dark:bg-warning-900/20 hover:bg-warning-50 dark:hover:bg-warning-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                                assignment.completed ? 'bg-success-500' : assignment.isVirtual ? 'bg-gray-400 dark:bg-gray-500' : 'bg-warning-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium text-sm sm:text-base truncate ${
                                  assignment.completed ? 'line-through text-secondary-500 dark:text-secondary-400' : assignment.isVirtual ? 'text-secondary-400 dark:text-secondary-500' : 'text-secondary-900 dark:text-secondary-100'
                                }`}>
                                  {assignment.taskTitle}
                                </h4>
                                <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                                  <div className="flex items-center gap-1">
                                    <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="truncate">{assignment.isVirtual ? 'Não atribuído' : assignment.assignedToName}</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-secondary-100 dark:bg-secondary-600 px-2 py-0.5 rounded text-xs">
                                    Peso: {assignment.taskWeight}
                                  </div>
                                  {assignment.isVirtual && (
                                    <span className="text-gray-500 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                      {assignment.taskFrequency === 'semanal' ? 'Semanal' : assignment.taskFrequency === 'quinzenal' ? 'Quinzenal' : 'Diária'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 ml-3">
                              {assignment.completed ? (
                                <div className="flex items-center gap-1 text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900/50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                  <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Concluída</span>
                                </div>
                              ) : assignment.isVirtual ? (
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Aguardando</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="hidden sm:inline">Pendente</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-secondary-600 dark:text-secondary-400">
                <p className="text-sm sm:text-base">Nenhuma tarefa para este dia</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Detalhes da Tarefa */}
      {selectedAssignment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          <div
            ref={modalRef}
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-xl max-w-sm sm:max-w-md w-full animate-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Previne que clicks dentro do modal fechem ele
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-white">Detalhes da Tarefa</h3>
              <button
                onClick={closeModal}
                className="text-white hover:bg-primary-700 p-1 rounded transition-colors"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400 block mb-1">
                  Tarefa
                </label>
                <h4 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                  {selectedAssignment.taskTitle}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400 block mb-1">
                    Responsável
                  </label>
                  <p className="text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">{selectedAssignment.assignedToName}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400 block mb-1">
                    Peso
                  </label>
                  <p className="text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">{selectedAssignment.taskWeight}</p>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400 block mb-1">
                  Data
                </label>
                <p className="text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">
                  {new Date(selectedAssignment.dateKey).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400 block mb-1">
                  Status
                </label>
                <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                  style={{
                    backgroundColor: selectedAssignment.completed ? '#D1FAE5' : '#FEF3C7',
                    color: selectedAssignment.completed ? '#059669' : '#B45309',
                  }}
                >
                  {selectedAssignment.completed ? (
                    <>
                      <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      Concluída
                    </>
                  ) : (
                    <>
                      <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                      Pendente
                    </>
                  )}
                </div>
              </div>

              {selectedAssignment.completedAt && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400 block mb-1">
                    Concluída em
                  </label>
                  <p className="text-secondary-900 dark:text-secondary-100 text-sm sm:text-base">
                    {new Date(selectedAssignment.completedAt).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-secondary-50 dark:bg-secondary-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-2 sm:gap-3 border-t border-secondary-200 dark:border-secondary-600">
              <button
                onClick={closeModal}
                className="flex-1 px-3 sm:px-4 py-2 border border-secondary-300 dark:border-secondary-500 rounded-lg text-secondary-700 dark:text-secondary-300 font-medium hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-colors text-sm sm:text-base"
              >
                Fechar
              </button>
              {!selectedAssignment.completed && (
                <button
                  onClick={handleCompleteAssignment}
                  className="flex-1 px-3 sm:px-4 py-2 bg-success-600 text-white rounded-lg font-medium hover:bg-success-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  Marcar como Concluída
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
