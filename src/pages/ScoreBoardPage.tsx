// Página do placar de justiça

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Home, JusticeScore, Task } from '../types';

export function ScoreBoardPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const [home, setHome] = useState<Home | null>(null);
  const [scores, setScores] = useState<JusticeScore[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Simulação de dados - será substituído pela API
  useEffect(() => {
    if (!homeId) return;

    const mockHome: Home = {
      id: homeId,
      name: 'Casa da Família Silva',
      description: 'Lar compartilhado com 4 membros',
      members: [
        { id: '1', name: 'João Silva', email: 'joao@email.com', avatar: '', createdAt: new Date() },
        { id: '2', name: 'Maria Silva', email: 'maria@email.com', avatar: '', createdAt: new Date() },
        { id: '3', name: 'Pedro Silva', email: 'pedro@email.com', avatar: '', createdAt: new Date() },
        { id: user?.id || '4', name: user?.name || 'Você', email: user?.email || '', avatar: '', createdAt: new Date() },
      ],
      ownerId: '1',
      createdAt: new Date('2024-01-15'),
    };

    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Lavar a louça',
        description: 'Lavar toda a louça acumulada da semana',
        assignedTo: mockHome.members[0],
        homeId,
        weight: 2,
        frequency: 'diaria',
        completed: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        title: 'Limpar o banheiro',
        description: 'Limpeza completa do banheiro principal',
        assignedTo: mockHome.members[1],
        homeId,
        weight: 3,
        frequency: 'semanal',
        completed: true,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        title: 'Fazer compras',
        description: 'Comprar itens da lista de supermercado',
        assignedTo: mockHome.members[2],
        homeId,
        weight: 4,
        frequency: 'quinzenal',
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        title: 'Cozinhar jantar',
        description: 'Preparar o jantar para todos',
        assignedTo: mockHome.members[0],
        homeId,
        weight: 3,
        frequency: 'diaria',
        completed: true,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '5',
        title: 'Lavar roupa',
        description: 'Lavar e dobrar toda a roupa',
        assignedTo: mockHome.members[1],
        homeId,
        weight: 2,
        frequency: 'semanal',
        completed: true,
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    // Calcular scores baseado nas tarefas
    const calculatedScores: JusticeScore[] = mockHome.members.map(member => {
      const memberTasks = mockTasks.filter(task => task.assignedTo.id === member.id);
      const completedTasks = memberTasks.filter(task => task.completed);
      const totalWeight = completedTasks.reduce((sum, task) => sum + task.weight, 0);
      const totalPossibleWeight = memberTasks.reduce((sum, task) => sum + task.weight, 0);

      // Score de justiça: quanto mais próximo de 1, mais justo
      const justiceScore = totalPossibleWeight > 0 ? totalWeight / totalPossibleWeight : 0;

      return {
        userId: member.id,
        homeId,
        score: justiceScore,
        tasksCompleted: completedTasks.length,
        totalWeight,
        lastUpdated: new Date(),
      };
    });

    setTimeout(() => {
      setHome(mockHome);
      setTasks(mockTasks);
      setScores(calculatedScores);
      setLoading(false);
    }, 1000);
  }, [homeId, user]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-success-600 bg-success-50';
    if (score >= 0.6) return 'text-warning-600 bg-warning-50';
    return 'text-danger-600 bg-danger-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Justo';
    if (score >= 0.6) return 'Equilibrado';
    return 'Precisa Compensar';
  };

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Carregando placar...</p>
        </div>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Lar não encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/home/${homeId}`)}
                className="text-secondary-500 hover:text-secondary-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">Placar de Justiça</h1>
                <p className="text-sm text-secondary-600">{home.name}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/home/${homeId}`)}
              className="btn btn-primary"
            >
              Ver Tarefas
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Distribuição de Tarefas</h2>
          <p className="text-secondary-600">
            Acompanhe como as tarefas estão sendo distribuídas entre os membros do lar
          </p>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center bg-neutral-white border border-secondary-200">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {tasks.filter(t => t.completed).length}
            </div>
            <p className="text-secondary-600">Tarefas Concluídas</p>
          </div>
          <div className="card text-center bg-neutral-white border border-secondary-200">
            <div className="text-3xl font-bold text-warning-600 mb-2">
              {tasks.filter(t => !t.completed).length}
            </div>
            <p className="text-secondary-600">Tarefas Pendentes</p>
          </div>
          <div className="card text-center bg-neutral-white border border-secondary-200">
            <div className="text-3xl font-bold text-success-600 mb-2">
              {tasks.reduce((sum, t) => sum + t.weight, 0)}
            </div>
            <p className="text-secondary-600">Pontos Totais</p>
          </div>
        </div>

        {/* Ranking de Justiça */}
        <div className="card bg-neutral-white border border-secondary-200">
          <h3 className="text-xl font-semibold text-secondary-900 mb-6">Ranking de Justiça</h3>

          <div className="space-y-4">
            {sortedScores.map((score, index) => {
              const member = home.members.find(m => m.id === score.userId);
              if (!member) return null;

              const memberTasks = tasks.filter(t => t.assignedTo.id === member.id);
              const completedTasks = memberTasks.filter(t => t.completed);

              return (
                <div
                  key={score.userId}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    score.userId === user?.id ? 'border-primary-300 bg-primary-50' : 'border-secondary-200 bg-neutral-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-success-100 text-success-700' :
                      index === 1 ? 'bg-primary-100 text-primary-700' :
                      index === 2 ? 'bg-warning-100 text-warning-700' :
                      'bg-secondary-100 text-secondary-700'
                    }`}>
                      {index + 1}
                    </div>

                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-secondary-900">
                        {member.name}
                        {score.userId === user?.id && (
                          <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            Você
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-secondary-500">
                        {completedTasks.length} de {memberTasks.length} tarefas concluídas
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score.score)}`}>
                      {getScoreLabel(score.score)}
                    </div>
                    <div className="text-sm text-secondary-500 mt-1">
                      {score.totalWeight} pontos
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-8 card bg-neutral-white border border-secondary-200">
          <h4 className="font-semibold text-secondary-900 mb-4">Como funciona o placar?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-success-500 rounded mt-0.5"></div>
              <div>
                <strong className="text-success-700">Justo:</strong> Contribuiu proporcionalmente com as tarefas
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-warning-500 rounded mt-0.5"></div>
              <div>
                <strong className="text-warning-700">Equilibrado:</strong> Contribuição adequada, mas pode melhorar
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-danger-500 rounded mt-0.5"></div>
              <div>
                <strong className="text-danger-700">Precisa Compensar:</strong> Deve contribuir mais com as tarefas
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}