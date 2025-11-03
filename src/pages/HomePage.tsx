// Página inicial que redireciona para o lar padrão

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar automaticamente para o lar padrão
    navigate('/home/default-home', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-secondary-600">Redirecionando...</p>
      </div>
    </div>
  );
}