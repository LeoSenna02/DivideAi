import { useTheme } from '../context/ThemeContext';

/**
 * Hook customizado para usar o tema no projeto
 * Facilita o acesso ao tema atual e funções de alternância
 */
export const useThemeCustom = () => {
  const { theme, toggleTheme, setTheme } = useTheme();

  return {
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isSystem: theme === 'system',
    theme,
    toggleTheme,
    setTheme,
  };
};
