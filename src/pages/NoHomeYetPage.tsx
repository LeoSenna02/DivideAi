// Página para usuários sem lar associado
// Mostra convites pendentes e opção de criar novo lar

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPendingInvitesForUser, acceptInvite, createHome, createInvite } from '../services/firestoreService';
import { LuMailCheck, LuCheck, LuPlus } from 'react-icons/lu';
import type { MemberInvite } from '../types';

export function NoHomeYetPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    homeName: '',
    description: '',
  });
  const [inviteEmails, setInviteEmails] = useState<string[]>(['']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadInvites = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const pendingInvites = await getPendingInvitesForUser(user.email);
        setInvites(pendingInvites);
      } catch (err) {
        console.error('Erro ao carregar convites:', err);
        setError('Erro ao carregar convites');
      } finally {
        setLoading(false);
      }
    };

    loadInvites();
  }, [user]);

  const handleAcceptInvite = async (inviteId: string, homeId: string) => {
    if (!user) return;

    try {
      setAccepting(inviteId);
      setError(null);

      await acceptInvite(inviteId, user.id, homeId);

      // Remover convite da lista
      setInvites(prev => prev.filter(i => i.id !== inviteId));

      // Aguardar um pouco e depois redirecionar para o lar
      setTimeout(() => {
        navigate(`/home/${homeId}`, { replace: true });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao aceitar convite';
      setError(message);
      console.error('Erro ao aceitar convite:', err);
    } finally {
      setAccepting(null);
    }
  };

  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!formData.homeName.trim()) {
      setError('Nome do lar é obrigatório');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Criar o lar
      const homeId = await createHome(user.id, user.name, formData.homeName, formData.description);

      // Enviar convites
      const validEmails = inviteEmails.filter(email => email.trim() && email.includes('@'));

      for (const email of validEmails) {
        try {
          await createInvite(homeId, email.trim(), user.id);
        } catch (err) {
          console.error(`Erro ao convidar ${email}:`, err);
        }
      }

      // Redirecionar para o lar criado
      setTimeout(() => {
        navigate(`/home/${homeId}`, { replace: true });
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar lar';
      setError(message);
      console.error('Erro ao criar lar:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleAddEmailField = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  const handleRemoveEmailField = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100">
      {/* Header */}
      <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-500">DivideAí</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-secondary-600 hover:text-secondary-900 font-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Bem-vindo, {user?.name}!</h2>
          <p className="text-secondary-600">
            Você ainda não é membro de nenhum lar. Crie um novo lar ou aguarde um convite.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Convites Pendentes */}
        {!loading && invites.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <LuMailCheck className="w-5 h-5 text-primary-500" />
              Convites Pendentes
            </h3>

            <div className="space-y-3">
              {invites.map(invite => (
                <div
                  key={invite.id}
                  className="bg-neutral-white border border-secondary-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-secondary-900">
                      Você foi convidado para um lar
                    </p>
                    <p className="text-sm text-secondary-600 mt-1">
                      Por: <span className="font-medium">{invite.invitedByName || 'Um membro'}</span>
                    </p>
                    <p className="text-xs text-secondary-500 mt-1">
                      Convite recebido em:{' '}
                      {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.id, invite.homeId)}
                      disabled={accepting === invite.id || loading}
                      className="btn btn-primary flex items-center gap-1 disabled:opacity-50"
                    >
                      <LuCheck className="w-4 h-4" />
                      {accepting === invite.id ? 'Aceitando...' : 'Aceitar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {!loading && invites.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-secondary-200"></div>
            <span className="text-secondary-600 text-sm font-medium">OU</span>
            <div className="flex-1 h-px bg-secondary-200"></div>
          </div>
        )}

        {/* Create Home Form */}
        {!showCreateForm ? (
          <div className="mb-8">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-neutral-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              <LuPlus className="w-5 h-5" />
              Iniciar um Novo Lar
            </button>
          </div>
        ) : (
          <div className="bg-neutral-white rounded-lg p-6 border border-secondary-200 mb-8">
            <h3 className="text-xl font-bold text-secondary-900 mb-6">Criar Novo Lar</h3>

            <form onSubmit={handleCreateHome} className="space-y-6">
              {/* Home Name */}
              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Nome do Lar *
                </label>
                <input
                  type="text"
                  value={formData.homeName}
                  onChange={e => setFormData({ ...formData, homeName: e.target.value })}
                  placeholder="Ex: Casa da Família Silva"
                  className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Apartamento compartilhado"
                  rows={3}
                  className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Invites */}
              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-3">
                  Convidar Membros (opcional)
                </label>
                <p className="text-sm text-secondary-600 mb-3">
                  Adicione os emails dos membros que você deseja convidar para o lar:
                </p>

                <div className="space-y-2">
                  {inviteEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={e => handleEmailChange(index, e.target.value)}
                        placeholder="email@exemplo.com"
                        className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {inviteEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmailField(index)}
                          className="px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddEmailField}
                  className="mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  + Adicionar outro email
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ homeName: '', description: '' });
                    setInviteEmails(['']);
                  }}
                  className="flex-1 px-4 py-2 border border-secondary-200 rounded-lg text-secondary-900 font-semibold hover:bg-secondary-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.homeName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-neutral-white font-semibold rounded-lg transition-colors"
                >
                  {creating ? 'Criando...' : 'Criar Lar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-neutral-white border border-secondary-200 rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-secondary-600">Carregando convites...</p>
          </div>
        )}

        {/* Info Box */}
        {!loading && !showCreateForm && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <h4 className="font-semibold text-primary-900 mb-3">Como funciona:</h4>
            <ul className="space-y-2 text-primary-800 text-sm">
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">1.</span>
                <span>
                  Crie um novo lar e convide os membros da sua família
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">2.</span>
                <span>
                  Ou aguarde um convite de alguém que já tem um lar no DivideAí
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">3.</span>
                <span>
                  Os convites aparecerão aqui nesta página
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary-600 font-bold">4.</span>
                <span>
                  Clique em "Aceitar" para se juntar ao lar
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* Alternative Info */}
        {!loading && invites.length === 0 && !showCreateForm && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-6 text-center">
            <p className="text-secondary-700 mb-4">
              Nenhum convite pendente no momento
            </p>
            <p className="text-secondary-600 text-sm">
              Crie um lar ou peça para alguém da sua família te convidar!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
