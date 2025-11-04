// Página de tarefas de um lar específico - MOTOR DE DISTRIBUIÇÃO INTEGRADO

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Fab } from '../components/Fab';
import { TaskCard } from '../components/TaskCard';
import { SwapTaskModal } from '../components/SwapTaskModal';
import { useTaskDistribution } from '../hooks/useTaskDistribution';
import { getHomeMembers, ensureAdminInHomeMembers, skipAssignment, isHomeAdmin, createTaskSwapRequest, acceptTaskSwapRequest, declineTaskSwapRequest } from '../services/firestoreService';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { DailyAssignment } from '../types';
import type { HomeMember, TaskSwapRequest } from '../types';

interface TasksByPerson {
  userId: string;
  name: string;
  avatar?: string;
  initials: string;
  completed: number;
  total: number;
  currentScore: number;
  assignments: DailyAssignment[];
}

export function TasksPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Hook do motor de distribuição
  const { assignments, monthlyScores, loading, error, distribute, completeTask } = useTaskDistribution(homeId);
  
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedAssignmentForSwap, setSelectedAssignmentForSwap] = useState<DailyAssignment | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [pendingSwapRequests, setPendingSwapRequests] = useState<TaskSwapRequest[]>([]);

  // Verificar se o usuário é membro do lar e carregar dados
  useEffect(() => {
    const loadMembers = async () => {
      if (!homeId || !user) return;
      
      try {
        setLoadingMembers(true);
        setAccessDenied(false);
        
        // Garantir que o admin está em homeMembers
        await ensureAdminInHomeMembers(homeId, user.id, user.name || 'Usuário');
        
        // Depois carregar membros
        const homeMembers = await getHomeMembers(homeId);
        
        // Verificar se o usuário é membro do lar
        const isMember = homeMembers.some(m => m.userId === user.id);
        if (!isMember && !await isHomeAdmin(homeId, user.id)) {
          setAccessDenied(true);
          console.error(`Acesso negado: Usuário ${user.id} não é membro do lar ${homeId}`);
          return;
        }

        setMembers(homeMembers);
      } catch (err) {
        console.error('Erro ao carregar membros:', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [homeId, user]);

  // Buscar solicitações de troca pendentes em tempo real
  useEffect(() => {
    if (!homeId || !user) return;

    const swapRequestsRef = collection(db, 'taskSwapRequests');
    const q = query(
      swapRequestsRef,
      where('homeId', '==', homeId),
      where('requestedToUserId', '==', user.id),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        respondedAt: doc.data().respondedAt?.toDate?.() || undefined,
      })) as TaskSwapRequest[];
      setPendingSwapRequests(requests);
    }, (error) => {
      console.error('Erro ao ouvir solicitações de troca:', error);
    });

    return () => unsubscribe();
  }, [homeId, user]);

  // Distribuir tarefas
  const handleDistribute = async () => {
    try {
      setDistributing(true);
      await distribute();
    } catch (err) {
      console.error('Erro ao distribuir:', err);
    } finally {
      setDistributing(false);
    }
  };

  // Marcar tarefa como completa
  const handleTaskToggle = async (assignmentId: string) => {
    try {
      await completeTask(assignmentId);
    } catch (err) {
      console.error('Erro ao completar tarefa:', err);
    }
  };

  // Pular tarefa com penalidade
  const handleSkipTask = async (assignmentId: string) => {
    try {
      if (!homeId || !user) return;
      
      const membersForSkip = members.map(m => ({
        userId: m.userId,
        userName: m.userName || 'Usuário',
      }));
      
      await skipAssignment(assignmentId, user.id, homeId, membersForSkip);
      
      // Os listeners em tempo real do useTaskDistribution atualizarão automaticamente
      // quando Firestore refletir as mudanças
    } catch (err) {
      console.error('Erro ao pular tarefa:', err);
    }
  };

  // Iniciar troca de tarefa
  const handleSwapTask = (assignment: DailyAssignment) => {
    setSelectedAssignmentForSwap(assignment);
    setSwapModalOpen(true);
  };

  // Confirmar troca de tarefa
  const handleSwapConfirm = async (swapRequest: Omit<TaskSwapRequest, 'id' | 'createdAt'>) => {
    try {
      setSwapLoading(true);
      if (!user) return;

      const completeSwapRequest: TaskSwapRequest = {
        ...swapRequest,
        id: '', // Será gerado pelo Firestore
        createdAt: new Date(),
        requestedByUserId: user.id,
        requestedByName: user.name || 'Usuário',
      };

      await createTaskSwapRequest(completeSwapRequest);
    } catch (err) {
      console.error('Erro ao propor troca:', err);
      throw err; // Re-throw para o modal mostrar o erro
    } finally {
      setSwapLoading(false);
    }
  };

  // Fechar modal de troca
  const handleSwapModalClose = () => {
    setSwapModalOpen(false);
    setSelectedAssignmentForSwap(null);
  };

  // Aceitar solicitação de troca
  const handleAcceptSwap = async (requestId: string) => {
    try {
      await acceptTaskSwapRequest(requestId, user?.id || '');
      
      // O listener em tempo real atualizará automaticamente as solicitações pendentes
      // e o useTaskDistribution atualizará as tarefas automaticamente
    } catch (error) {
      console.error('Erro ao aceitar troca:', error);
      throw error; // Re-throw para o modal mostrar o erro
    }
  };

  // Recusar solicitação de troca
  const handleDeclineSwap = async (requestId: string) => {
    try {
      await declineTaskSwapRequest(requestId, user?.id || '');
      
      // O listener em tempo real atualizará automaticamente as solicitações pendentes
    } catch (error) {
      console.error('Erro ao recusar troca:', error);
      throw error; // Re-throw para o modal mostrar o erro
    }
  };

  // Agrupar tarefas por pessoa
  const getTasksByPerson = (): TasksByPerson[] => {
    const grouped = new Map<string, TasksByPerson>();

    // Inicializar todos os membros
    members.forEach(member => {
      const initials = (member.userName || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      // Buscar pontuação atual do membro
      const memberScore = monthlyScores.find(score => score.userId === member.userId)?.score || 0;

      grouped.set(member.userId, {
        userId: member.userId,
        name: member.userName || 'Usuário',
        initials,
        completed: 0,
        total: 0,
        currentScore: memberScore,
        assignments: [],
      });
    });

    // Adicionar atribuições
    assignments.forEach(assignment => {
      const person = grouped.get(assignment.assignedToId);
      if (person) {
        person.assignments.push(assignment);
        person.total++;
        if (assignment.completed) {
          person.completed++;
        }
      }
    });

    // Retornar apenas pessoas com tarefas
    return Array.from(grouped.values()).filter(p => p.total > 0);
  };

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };
    return new Date().toLocaleDateString('pt-BR', options);
  };

  if (loading || loadingMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-danger-600 mb-2">Acesso Negado</h1>
          <p className="text-secondary-600 mb-6">Você não tem permissão para acessar este lar.</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="btn btn-primary"
          >
            Voltar aos Meus Lares
          </button>
        </div>
      </div>
    );
  }

  const tasksByPerson = getTasksByPerson();
  const homePath = `/home/${homeId}`;
  const showFab = location.pathname === homePath || location.pathname === `${homePath}/`;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-neutral-white shadow-sm border-b border-secondary-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Tarefas de Hoje</h1>
                <p className="text-sm text-secondary-600 mt-1 capitalize">{getTodayDate()}</p>
              </div>
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Erro */}
        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700">{error}</p>
          </div>
        )}

        {/* Botão Distribuir Tarefas */}
        <div className="mb-6">
          <button
            onClick={handleDistribute}
            disabled={distributing}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {distributing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Distribuindo...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Distribuir Tarefas de Hoje
              </>
            )}
          </button>
        </div>

        {/* Lista de Tarefas por Pessoa */}
        {tasksByPerson.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-primary-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-3">Tudo em Ordem!</h2>
              <p className="text-secondary-600 mb-8 leading-relaxed">
                Não há tarefas distribuídas para hoje. Clique em "Distribuir Tarefas" para começar a dividir as responsabilidades de forma justa e equilibrada.
              </p>
              <div className="flex justify-center">
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 max-w-sm">
                  <p className="text-sm text-primary-700 font-medium">
                    💡 Dica: Adicione tarefas no menu de gerenciamento para ter mais opções na distribuição.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksByPerson.map((person) => (
              <TaskCard
                key={person.userId}
                person={person}
                otherMembers={members.filter(m => m.userId !== person.userId)}
                onTaskToggle={handleTaskToggle}
                onSkipTask={handleSkipTask}
                onSwapTask={handleSwapTask}
                pendingSwapRequests={pendingSwapRequests}
                onAcceptSwap={handleAcceptSwap}
                onDeclineSwap={handleDeclineSwap}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB: aparece somente na tela de Início do lar (rota /home/:homeId) */}
      {showFab && (
        <Fab onClick={() => navigate(`/home/${homeId}/manage-tasks`)} label="Adicionar Tarefa" />
      )}

      {/* Modal de Troca de Tarefa */}
      <SwapTaskModal
        isOpen={swapModalOpen}
        onClose={handleSwapModalClose}
        myAssignment={selectedAssignmentForSwap}
        otherMembers={members.filter(m => selectedAssignmentForSwap && m.userId !== selectedAssignmentForSwap.assignedToId)}
        allAssignments={assignments}
        onConfirm={handleSwapConfirm}
        loading={swapLoading}
      />

      <Navigation />
    </div>
  );
}