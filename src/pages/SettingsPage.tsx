// Página de Ajustes

import { useAuth } from '../context/AuthContext';
import { Navigation } from '../components/Navigation';
import { useThemeCustom } from '../hooks/useThemeCustom';

export function SettingsPage() {
  const { logout } = useAuth();
  const { theme, setTheme } = useThemeCustom();

  return (
    <div className="min-h-screen bg-secondary-50 pb-20">
      {/* Header */}
      <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-secondary-900">Ajustes</h1>
            <p className="text-sm text-secondary-600 mt-1">Gerencie suas preferências</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Conta</h3>
            <p className="text-secondary-600 mb-4">Configure suas preferências de conta e segurança</p>
            <button className="btn btn-secondary">
              Editar Perfil
            </button>
          </div>

          <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Preferências</h3>
            <p className="text-secondary-600 mb-4">Personalize sua experiência no DivideAí</p>
            <div className="space-y-3">
              <label className="text-secondary-700 font-medium">Tema</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'light'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-neutral-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  Claro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'dark'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-neutral-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  Escuro
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === 'system'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-neutral-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  Sistema
                </button>
              </div>
            </div>
          </div>

          <div className="bg-neutral-white rounded-lg p-6 shadow-sm border border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Sair</h3>
            <p className="text-secondary-600 mb-4">Faça logout da sua conta</p>
            <button
              onClick={logout}
              className="btn btn-danger"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
