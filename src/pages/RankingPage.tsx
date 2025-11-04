// Página de Ranking - Competição entre membros do lar

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { getHomeMembers } from '../services/firestoreService';
import { getMonthlyScores, ensureAdminInHomeMembers, isHomeAdmin } from '../services/firestoreService';
import type { HomeMember, MonthlyScore } from '../types';

interface RankingMember {
  userId: string;
  name: string;
  initials: string;
  score: number;
  tasksAssigned: number;
  totalWeight: number;
  rank: number;
  isCurrentUser: boolean;
}

export function RankingPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [members, setMembers] = useState<HomeMember[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [accessDenied, setAccessDenied] = useState(false);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!homeId || !user) return;

      try {
        setLoading(true);
        setError(null);
        setAccessDenied(false);

        // Garantir que o admin está em homeMembers
        await ensureAdminInHomeMembers(homeId, user.id, user.name || 'Usuário');

        const [homeMembers, scores] = await Promise.all([
          getHomeMembers(homeId),
          getMonthlyScores(homeId),
        ]);

        // Verificar se o usuário é membro do lar
        const isMember = homeMembers.some(m => m.userId === user.id);
        if (!isMember && !await isHomeAdmin(homeId, user.id)) {
          setAccessDenied(true);
          console.error(`Acesso negado: Usuário ${user.id} não é membro do lar ${homeId}`);
          return;
        }

        setMembers(homeMembers);
        setMonthlyScores(scores);

        // Definir o usuário atual logado
        setCurrentUserId(user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [homeId, user]);

  // Gerar ranking
  const getRanking = (): RankingMember[] => {
    const ranking = members.map(member => {
      const score = monthlyScores.find(s => s.userId === member.userId);
      const initials = (member.userName || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      return {
        userId: member.userId,
        name: member.userName || 'Usuário',
        initials,
        score: score?.score || 0,
        tasksAssigned: score?.tasksAssigned || 0,
        totalWeight: score?.totalWeight || 0,
        rank: 0, // será definido depois
        isCurrentUser: member.userId === currentUserId,
      };
    });

    // Ordenar por pontuação (decrescente)
    ranking.sort((a, b) => b.score - a.score);

    // Atribuir ranks
    ranking.forEach((member, index) => {
      member.rank = index + 1;
    });

    return ranking;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 2:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      case 3:
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700';
      default:
        return 'text-secondary-600 dark:text-secondary-400 bg-neutral-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-danger-600 dark:text-danger-400 mb-2">Acesso Negado</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">Você não tem permissão para acessar este lar.</p>
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

  const ranking = getRanking();
  const topThree = ranking.slice(0, 3);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 pb-24">
      {/* Header */}
      <header className="bg-neutral-white dark:bg-secondary-800 shadow-sm border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">🏆 Ranking do Lar</h1>
            <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">Competição mensal entre membros</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Erro */}
        {error && (
          <div className="mb-4 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-700 rounded-lg">
            <p className="text-danger-700 dark:text-danger-400">{error}</p>
          </div>
        )}

        {/* Pódio - Top 3 */}
        {topThree.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-6 text-center">Pódio do Mês</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* 2º Lugar */}
              {topThree[1] && (
                <div className="order-1 md:order-1">
                  <div className="bg-neutral-white dark:bg-secondary-800 rounded-lg p-6 border border-secondary-200 dark:border-secondary-700 text-center shadow-sm">
                    <div className="text-4xl mb-2">🥈</div>
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{topThree[1].initials}</span>
                    </div>
                    <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">{topThree[1].name}</h3>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-300">{Math.round(topThree[1].score)} pts</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{topThree[1].tasksAssigned} tarefas</p>
                  </div>
                </div>
              )}

              {/* 1º Lugar */}
              {topThree[0] && (
                <div className="order-2 md:order-2">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6 border-2 border-yellow-300 dark:border-yellow-600 text-center shadow-lg relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="text-5xl">👑</div>
                    </div>
                    <div className="text-4xl mb-2 mt-4">🥇</div>
                    <div className="w-20 h-20 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-yellow-400 dark:border-yellow-600">
                      <span className="text-xl font-bold text-yellow-800 dark:text-yellow-200">{topThree[0].initials}</span>
                    </div>
                    <h3 className="font-bold text-secondary-900 dark:text-secondary-100 mb-1 text-lg">{topThree[0].name}</h3>
                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{Math.round(topThree[0].score)} pts</p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{topThree[0].tasksAssigned} tarefas</p>
                  </div>
                </div>
              )}

              {/* 3º Lugar */}
              {topThree[2] && (
                <div className="order-3 md:order-3">
                  <div className="bg-neutral-white dark:bg-secondary-800 rounded-lg p-6 border border-secondary-200 dark:border-secondary-700 text-center shadow-sm">
                    <div className="text-4xl mb-2">🥉</div>
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-300">{topThree[2].initials}</span>
                    </div>
                    <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">{topThree[2].name}</h3>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">{Math.round(topThree[2].score)} pts</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{topThree[2].tasksAssigned} tarefas</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Ranking Completo */}
        <section>
          <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">Ranking Completo</h2>
          <div className="bg-neutral-white dark:bg-secondary-800 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
            <div className="divide-y divide-secondary-100 dark:divide-secondary-700">
              {ranking.map(member => (
                <div
                  key={member.userId}
                  className={`p-4 flex items-center justify-between hover:bg-secondary-25 dark:hover:bg-secondary-700 transition-colors ${
                    member.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getRankColor(member.rank)}`}>
                      {getRankIcon(member.rank)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{member.initials}</span>
                      </div>
                      <div>
                        <h3 className={`font-semibold ${member.isCurrentUser ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-900 dark:text-secondary-100'}`}>
                          {member.name} {member.isCurrentUser && '(Você)'}
                        </h3>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{member.tasksAssigned} tarefas atribuídas</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{Math.round(member.score)} pts</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">Peso total: {member.totalWeight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Estatísticas Gerais */}
        <section className="mt-6">
          <div className="bg-neutral-white dark:bg-secondary-800 rounded-lg p-4 border border-secondary-200 dark:border-secondary-700">
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">📊 Estatísticas do Lar</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{ranking.length}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Membros</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(ranking.reduce((sum, m) => sum + m.score, 0))}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Pontos Totais</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{ranking.reduce((sum, m) => sum + m.tasksAssigned, 0)}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Tarefas Atribuídas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(ranking.reduce((sum, m) => sum + m.score, 0) / ranking.length) || 0}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Média por Membro</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
}