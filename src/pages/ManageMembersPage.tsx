// Página para cadastrar e gerenciar membros do lar

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { createInvite, getHomeMembers, removeMember, getHomeInvites, isHomeAdmin, setMemberVacationStatus } from '../services/firestoreService';
import { LuUserPlus, LuTrash2, LuMail, LuUser, LuSun } from 'react-icons/lu';
import type { HomeMember, MemberInvite } from '../types';

export function ManageMembersPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [invites, setInvites] = useState<MemberInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<HomeMember | null>(null);
  const [editingVacation, setEditingVacation] = useState<string | null>(null);
  const [vacationEndDate, setVacationEndDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!homeId || !user) {
        setError('ID do lar ou usuário inválido. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Verificar se é admin
        const adminStatus = await isHomeAdmin(homeId, user.id);
        setIsAdmin(adminStatus);

        // Carregar membros e convites
        const [membersList, invitesList] = await Promise.all([
          getHomeMembers(homeId),
          getHomeInvites(homeId)
        ]);

        setMembers(membersList);
        setInvites(invitesList);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(`Erro ao carregar dados: ${errorMessage}`);
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [homeId, user]);

  const handleInvite = async () => {
    if (!name.trim() || !email.trim() || !homeId || !user) return;

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, insira um email válido.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newInvite = await createInvite(homeId, email.trim(), user.id);
      setInvites(prev => [...prev, newInvite]);
      setName('');
      setEmail('');
    } catch (err) {
      setError('Erro ao enviar convite');
      console.error('Erro ao enviar convite:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = (member: HomeMember) => {
    if (member.userId === user?.id) {
      setError('Você não pode remover a si mesmo do lar.');
      return;
    }

    if (!isAdmin) {
      setError('Você não tem permissão para remover membros.');
      return;
    }

    setMemberToDelete(member);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete || !homeId) return;

    try {
      setSaving(true);
      setError(null);
      await removeMember(homeId, memberToDelete.userId);
      setMembers(prev => prev.filter(m => m.userId !== memberToDelete.userId));
      setMemberToDelete(null);
    } catch (err) {
      setError('Erro ao remover membro');
      console.error('Erro ao remover membro:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setMemberToDelete(null);
  };

  const handleToggleVacation = (member: HomeMember) => {
    if (!isAdmin) {
      setError('Você não tem permissão para gerenciar férias.');
      return;
    }

    if (member.userId === user?.id) {
      setError('Você não pode gerenciar suas próprias férias.');
      return;
    }

    // Se já está em férias, desativa ao clicar novamente
    if (member.isOnVacation) {
      handleDeactivateVacation(member);
      return;
    }

    setEditingVacation(member.userId);
    setVacationEndDate('');
  };

  const handleDeactivateVacation = async (member: HomeMember) => {
    if (!homeId || !isAdmin) return;

    try {
      setSaving(true);
      setError(null);

      console.log('Desativando férias para:', member.userId);
      await setMemberVacationStatus(homeId, member.userId, false, undefined);
      console.log('Férias desativadas com sucesso');

      // Atualizar membro localmente
      setMembers(prev => prev.map(m =>
        m.userId === member.userId
          ? { ...m, isOnVacation: false, vacationEndDate: undefined }
          : m
      ));
    } catch (err) {
      setError('Erro ao desativar férias');
      console.error('Erro ao desativar férias:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVacation = async () => {
    if (!editingVacation || !homeId) return;

    try {
      setSaving(true);
      setError(null);

      // Se não tem data no campo, ativa férias indefinidas (isOnVacation = true, sem data)
      // Se tem data, ativa férias com data específica
      const isOnVacation = true; // Sempre ativa férias ao salvar
      const endDate = vacationEndDate.trim() ? new Date(vacationEndDate) : undefined;

      console.log('Salvando status de férias:', { userId: editingVacation, isOnVacation, endDate });
      await setMemberVacationStatus(homeId, editingVacation, isOnVacation, endDate);
      console.log('Status de férias salvo com sucesso');

      // Atualizar membro localmente
      setMembers(prev => prev.map(m =>
        m.userId === editingVacation
          ? { ...m, isOnVacation, vacationEndDate: endDate }
          : m
      ));

      setEditingVacation(null);
      setVacationEndDate('');
    } catch (err) {
      setError('Erro ao atualizar status de férias');
      console.error('Erro ao atualizar férias:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelVacation = () => {
    setEditingVacation(null);
    setVacationEndDate('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pb-24">
        <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button onClick={() => navigate(-1)} className="text-secondary-500 mr-4 hover:text-secondary-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-secondary-900">Gerenciar Membros</h1>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Carregando membros...</p>
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
          <div className="flex items-center py-4">
            <button onClick={() => navigate(-1)} className="text-secondary-500 mr-4 hover:text-secondary-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-secondary-900">Gerenciar Membros</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700">{error}</p>
          </div>
        )}

        <div className="bg-neutral-white p-6 rounded-lg shadow-sm border border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Convidar Novo Membro</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <div className="relative">
                <LuUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  className="input w-full pl-10"
                  placeholder="Nome do membro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="email"
                  className="input w-full pl-10"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleInvite}
            disabled={saving || !name.trim() || !email.trim()}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LuUserPlus className="w-5 h-5" />
            {saving ? 'Enviando convite...' : 'Enviar Convite'}
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Como funciona o convite:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• O convite é salvo no sistema automaticamente</li>
            <li>• O convidado deve acessar o app e ir para "Convites" na navegação</li>
            <li>• Uma aba "Convites" aparecerá na navegação quando houver convites pendentes</li>
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Membros do Lar</h3>

          <div className="space-y-3">
            {members.length > 0 ? (
              members.map(member => (
                <div key={member.userId} className={`bg-neutral-white p-4 rounded-lg shadow-sm border border-secondary-200 flex items-center justify-between hover:border-secondary-300 transition-colors ${
                  member.isOnVacation ? 'bg-warning-25 border-warning-200' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                      member.isOnVacation ? 'bg-warning-100' : 'bg-primary-100'
                    }`}>
                      <span className={`font-medium ${
                        member.isOnVacation ? 'text-warning-700' : 'text-primary-600'
                      }`}>
                        {(member.userName || member.userId).charAt(0).toUpperCase()}
                      </span>
                      {member.isOnVacation && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning-500 rounded-full flex items-center justify-center">
                          <LuSun className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-secondary-900 flex items-center gap-2">
                        {member.userId === user?.id ? 'Você' : (member.userName || `Membro ${member.userId.slice(0, 8)}`)}
                        {member.role === 'admin' && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-secondary-500">
                        Entrou em {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                        {member.isOnVacation && (
                          <span className="block text-warning-600 font-medium">
                            {member.vacationEndDate 
                              ? `🏖️ Férias até ${member.vacationEndDate.toLocaleDateString('pt-BR')}`
                              : '🏖️ Em férias (indefinidas)'
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && member.userId !== user?.id && (
                      <button
                        onClick={() => handleToggleVacation(member)}
                        className={`p-2 rounded transition-colors ${
                          member.isOnVacation
                            ? 'text-warning-500 hover:text-danger-600 hover:bg-danger-50 cursor-pointer'
                            : 'text-secondary-400 hover:text-warning-600 hover:bg-warning-50 cursor-pointer'
                        }`}
                        title={member.isOnVacation ? 'Clique para remover férias' : 'Clique para colocar em férias'}
                      >
                        <LuSun className="w-4 h-4" />
                      </button>
                    )}

                    {isAdmin && member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="text-danger-500 hover:text-danger-600 p-2 transition-colors"
                        title="Remover membro"
                      >
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <p>Nenhum membro adicionado ainda</p>
              </div>
            )}
          </div>
        </div>

        {invites.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-3">Convites Pendentes</h3>

            <div className="space-y-3">
              {invites.map(invite => (
                <div key={invite.id} className="bg-neutral-white p-4 rounded-lg shadow-sm border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center">
                        <LuMail className="w-5 h-5 text-warning-600" />
                      </div>
                      <div>
                        <div className="font-medium text-secondary-900">{invite.email}</div>
                        <div className="text-sm text-secondary-500">
                          Convitado em {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-warning-100 text-warning-700 px-2 py-1 rounded">
                      Pendente
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-white p-6 rounded-lg shadow-lg border border-secondary-200 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Remover Membro</h3>
            
            <p className="text-secondary-700 mb-6">
              Tem certeza que deseja remover <strong>{memberToDelete.userName || `Membro ${memberToDelete.userId.slice(0, 8)}`}</strong> do lar? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={saving}
                className="flex-1 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-100 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={saving}
                className="flex-1 bg-danger-500 hover:bg-danger-600 disabled:bg-danger-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LuTrash2 className="w-4 h-4" />
                {saving ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Férias */}
      {editingVacation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-white p-6 rounded-lg shadow-lg border border-secondary-200 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
              <LuSun className="w-5 h-5 text-warning-500" />
              Ativar Férias
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-warning-50 border border-warning-200 p-3 rounded-lg">
                <p className="text-sm text-warning-800">
                  O membro será excluído da distribuição de tarefas durante o período selecionado.
                </p>
              </div>

              <div>
                <label className="label">Data de fim das férias (opcional)</label>
                <input
                  type="date"
                  className="input w-full"
                  value={vacationEndDate}
                  onChange={(e) => setVacationEndDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Deixe vazio para férias indefinidas (até desativar manualmente)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelVacation}
                disabled={saving}
                className="flex-1 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-100 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVacation}
                disabled={saving}
                className="flex-1 bg-warning-500 hover:bg-warning-600 disabled:bg-warning-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LuSun className="w-4 h-4" />
                {saving ? 'Ativando...' : 'Ativar Férias'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}