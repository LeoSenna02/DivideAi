import { useThemeCustom } from '../hooks/useThemeCustom';
import { MdLight, MdDarkMode } from 'react-icons/md';

/**
 * Componente para alternar entre tema claro e escuro
 * Pode ser usado em qualquer lugar da aplicação
 */
export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeCustom();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors duration-200 
                 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-700 dark:hover:bg-secondary-600
                 text-secondary-700 dark:text-secondary-200
                 focus:outline-none focus:ring-2 focus:ring-primary-500"
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? (
        <MdLight size={20} />
      ) : (
        <MdDarkMode size={20} />
      )}
    </button>
  );
};
