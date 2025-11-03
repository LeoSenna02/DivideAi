// Página de tarefas de um lar específico - MOTOR DE DISTRIBUIÇÃO INTEGRADO

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { Fab } from '../components/Fab';
import { TaskCard } from '../components/TaskCard';
import { useTaskDistribution } from '../hooks/useTaskDistribution';
import { getHomeMembers, ensureAdminInHomeMembers, skipAssignment } from '../services/firestoreService';
import type { DailyAssignment } from '../types';
import type { HomeMember } from '../types';

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

  // Carregar membros do lar e garantir que admin está registrado
  useEffect(() => {
    const loadMembers = async () => {
      if (!homeId || !user) return;
      
      try {
        setLoadingMembers(true);
        
        // Garantir que o admin está em homeMembers
        await ensureAdminInHomeMembers(homeId, user.id, user.name || 'Usuário');
        
        // Depois carregar membros
        const homeMembers = await getHomeMembers(homeId);
        setMembers(homeMembers);
      } catch (err) {
        console.error('Erro ao carregar membros:', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasksByPerson.map((person) => (
            <TaskCard
              key={person.userId}
              person={person}
              otherMembers={members.filter(m => m.userId !== person.userId)}
              onTaskToggle={handleTaskToggle}
              onSkipTask={handleSkipTask}
            />
          ))}
        </div>
      </main>

      {/* FAB: aparece somente na tela de Início do lar (rota /home/:homeId) */}
      {showFab && (
        <Fab onClick={() => navigate(`/home/${homeId}/manage-tasks`)} label="Adicionar Tarefa" />
      )}

      <Navigation />
    </div>
  );
}