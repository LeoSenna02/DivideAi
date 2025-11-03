// Página para gerenciar convites recebidos

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { acceptInvite, rejectInvite } from '../services/firestoreService';
import { usePendingInvites } from '../hooks/usePendingInvites';
import { LuCheck, LuX } from 'react-icons/lu';

export function PendingInvitesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingInvites, loading, error, refreshInvites } = usePendingInvites();

  const [accepting, setAccepting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAccept = async (inviteId: string, homeId: string) => {
    if (!user) return;

    try {
      setAccepting(inviteId);

      await acceptInvite(inviteId, user.id, homeId);

      refreshInvites();
      setSuccessMessage(`Convite aceito! Você foi adicionado ao lar.`);

      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
        // Redirecionar para o lar
        navigate(`/home/${homeId}`);
      }, 2000);
    } catch (err) {
      console.error('Erro ao aceitar convite:', err);
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    try {
      await rejectInvite(inviteId);
      refreshInvites();
      setSuccessMessage('Convite rejeitado.');

      // Limpar mensagem após 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Erro ao rejeitar convite:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pb-24">
        <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <h1 className="text-lg font-semibold text-secondary-900">Convites Pendentes</h1>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Carregando convites...</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 pb-24">
      <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-lg font-semibold text-secondary-900">Convites Pendentes</h1>
            {pendingInvites.length > 0 && (
              <span className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                {pendingInvites.length} convite{pendingInvites.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {successMessage && (
          <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-success-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700">{error}</p>
          </div>
        )}

        {pendingInvites.length > 0 ? (
          <div className="space-y-4">
            {pendingInvites.map(invite => (
              <div
                key={invite.id}
                className="bg-neutral-white p-6 rounded-lg shadow-sm border border-secondary-200 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      Você foi convidado para um lar!
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Convite recebido em {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                    Pendente
                  </span>
                </div>

                <div className="bg-secondary-50 p-4 rounded-lg mb-4">
                  <p className="text-secondary-700">
                    <strong>Email do convite:</strong> {invite.email}
                  </p>
                  <p className="text-secondary-700 mt-2">
                    <strong>Convidado por:</strong> {invite.invitedByName || invite.invitedBy || 'Usuário'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(invite.id, invite.homeId)}
                    disabled={accepting === invite.id}
                    className="flex-1 bg-success-500 hover:bg-success-600 disabled:bg-success-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LuCheck className="w-4 h-4" />
                    {accepting === invite.id ? 'Aceitando...' : 'Aceitar'}
                  </button>
                  <button
                    onClick={() => handleReject(invite.id)}
                    disabled={accepting === invite.id}
                    className="flex-1 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-100 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LuX className="w-4 h-4" />
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-neutral-white p-8 rounded-lg shadow-sm border border-secondary-200 text-center">
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Nenhum convite pendente</h3>
            <p className="text-secondary-600 mb-6">
              Quando você receber um convite para um lar, ele aparecerá aqui.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
}
