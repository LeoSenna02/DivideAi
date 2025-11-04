// Hook para validar acesso do usuário a um lar específico
// Garante que o usuário é realmente membro do lar antes de acessar

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserHomes, getHomeMembers } from '../services/firestoreService';

interface UseValidateAccessReturn {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Valida se o usuário tem acesso a um lar específico
 * @param homeId - ID do lar a validar
 * @returns { hasAccess, loading, error }
 */
export const useValidateAccess = (homeId: string | undefined): UseValidateAccessReturn => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      if (!homeId || !user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Validação em 2 camadas:
        // 1. Verificar se o usuário tem este lar em sua lista de lares
        const userHomes = await getUserHomes(user.id);
        const hasThisHome = userHomes.some(h => h.homeId === homeId);

        if (!hasThisHome) {
          setError(`Acesso negado: Você não é membro do lar ${homeId}`);
          setHasAccess(false);
          return;
        }

        // 2. Validação cruzada: Verificar nos membros do lar
        const homeMembers = await getHomeMembers(homeId);
        const isMember = homeMembers.some(m => m.userId === user.id);

        if (!isMember) {
          setError(`Acesso negado: Você não está registrado como membro do lar`);
          setHasAccess(false);
          return;
        }

        setHasAccess(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao validar acesso';
        setError(message);
        setHasAccess(false);
        console.error('Erro na validação de acesso:', err);
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [homeId, user]);

  return { hasAccess, loading, error };
};
