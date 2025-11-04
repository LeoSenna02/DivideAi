// Página inicial que mostra os lares do usuário ou redireciona para o primeiro lar

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserHomes } from '../services/firestoreService';

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserHomes = async () => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar lares do usuário
        const homes = await getUserHomes(user.id);

        if (homes.length === 0) {
          // Usuário não tem nenhum lar - redirecionar para página de espera/convites
          console.log('Usuário sem lar. Redirecionando para página de convites...');
          navigate('/no-home', { replace: true });
          return;
        }

        // Redirecionar para o primeiro lar do usuário
        console.log(`✅ Usuário ${user.id} tem ${homes.length} lar(es). Redirecionando para: ${homes[0].homeId}`);
        navigate(`/home/${homes[0].homeId}`, { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar lares';
        console.error('Erro ao carregar lares:', err);
        setError(message);

        // Em caso de erro, redirecionar para página de convites
        setTimeout(() => {
          navigate('/no-home', { replace: true });
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    loadUserHomes();
  }, [user, navigate, logout]);  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-danger-600 dark:text-danger-400 mb-2">Erro ao Carregar</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">{error}</p>
          <p className="text-sm text-secondary-500 dark:text-secondary-500">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-secondary-600 dark:text-secondary-400">Carregando seus lares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-secondary-600 dark:text-secondary-400">Redirecionando...</p>
      </div>
    </div>
  );
}