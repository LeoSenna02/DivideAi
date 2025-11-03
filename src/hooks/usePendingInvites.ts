// Hook personalizado para gerenciar convites pendentes

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingInvitesForUser } from '../services/firestoreService';
import type { MemberInvite } from '../types';

export function usePendingInvites() {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState<MemberInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPendingInvites = async () => {
    if (!user?.email) {
      setPendingInvites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const invites = await getPendingInvitesForUser(user.email);
      setPendingInvites(invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar convites');
      setPendingInvites([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar convites quando o usuário muda
  useEffect(() => {
    loadPendingInvites();
  }, [user?.email]);

  // Função para recarregar convites (útil após aceitar/rejeitar)
  const refreshInvites = () => {
    loadPendingInvites();
  };

  return {
    pendingInvites,
    loading,
    error,
    refreshInvites,
    hasPendingInvites: pendingInvites.length > 0,
    pendingCount: pendingInvites.length,
  };
}