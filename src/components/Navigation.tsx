// Componente de navegação (rodapé) com 4 abas

import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { usePendingInvites } from '../hooks/usePendingInvites';
import { LuMail } from 'react-icons/lu';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { homeId } = useParams<{ homeId: string }>();
  const { hasPendingInvites, pendingCount } = usePendingInvites();

  // Checa se a rota atual corresponde à esperada.
  // Para algumas abas (como 'Início') queremos apenas ativar quando houver uma correspondência exata.
  const isActive = (path: string, exact = false) => {
    if (exact) {
      // ativa somente quando o pathname for exatamente o caminho (sem sub-rotas)
      return location.pathname === path || location.pathname === `${path}/`;
    }

    // para as demais abas, considera-se ativa quando a rota atual começa com o caminho (ex: /home/:id/calendar/..)
    return location.pathname === path || location.pathname.startsWith(path + '/') || location.pathname.startsWith(path);
  };

  const goTo = (path: string) => navigate(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-white border-t border-secondary-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {/** caminhos calculados para checagem precisa */}
        {
          (() => {
            const homePath = `/home/${homeId || 'default-home'}`;
            const calendarPath = `${homePath}/calendar`;
            const rankingPath = `${homePath}/ranking`;
            const rewardsPath = `${homePath}/rewards`;
            const settingsPath = `${homePath}/settings`;
            const invitesPath = '/invites';

            return (
              <>
                <button
                  onClick={() => goTo(homePath)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive(homePath, true) ? 'text-primary-500' : 'text-secondary-400 hover:text-secondary-600'
                  }`}
                  title="Início"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-xs mt-1">Início</span>
                </button>

                <button
                  onClick={() => goTo(calendarPath)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive(calendarPath) ? 'text-primary-500' : 'text-secondary-400 hover:text-secondary-600'
                  }`}
                  title="Calendário"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs mt-1">Calendário</span>
                </button>

                <button
                  onClick={() => goTo(rankingPath)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive(rankingPath) ? 'text-primary-500' : 'text-secondary-400 hover:text-secondary-600'
                  }`}
                  title="Ranking"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-xs mt-1">Ranking</span>
                </button>

                {/* Aba de Convites - aparece apenas quando há convites pendentes */}
                {hasPendingInvites && (
                  <button
                    onClick={() => goTo(invitesPath)}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors relative ${
                      isActive(invitesPath) ? 'text-primary-500' : 'text-secondary-400 hover:text-secondary-600'
                    }`}
                    title={`Convites Pendentes (${pendingCount})`}
                  >
                    <div className="relative">
                      <LuMail className="w-6 h-6" />
                      {pendingCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs mt-1">Convites</span>
                  </button>
                )}

                <button
                  onClick={() => goTo(rewardsPath)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive(rewardsPath) ? 'text-primary-500' : 'text-secondary-400 hover:text-secondary-600'
                  }`}
                  title="Relatórios"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs mt-1">Relatórios</span>
                </button>

                <button
                  onClick={() => goTo(settingsPath)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive(settingsPath) ? 'text-primary-500' : 'text-secondary-400 hover:text-secondary-600'
                  }`}
                  title="Ajustes"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs mt-1">Ajustes</span>
                </button>
              </>
            );
          })()
        }
      </div>
    </nav>
  );
}
