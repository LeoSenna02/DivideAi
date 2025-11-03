/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Principal: Verde Esmeralda Sofisticado
        // Transmite: Equidade, Harmonia, Crescimento, Confiança
        primary: {
          25: '#f8fdf9',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Tom base elegante
          600: '#16a34a', // Hover/Active
          700: '#15803d', // Press/Dark
          800: '#166534',
          900: '#145231',
        },
        // Paleta Secundária: Cinza Minimalista
        // Transmite: Limpeza, Neutralidade, Sofisticação
        secondary: {
          25: '#fafafa',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280', // Tom base neutro
          600: '#4b5563', // Subtle accent
          700: '#374151', // Text dark
          800: '#1f2937',
          900: '#111827',
        },
        // Paleta de Sucesso: Verde Suave
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        // Paleta de Aviso: Âmbar Elegante
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Paleta de Erro: Vermelho Sofisticado
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // Neutra: Branco e Preto
        neutral: {
          white: '#ffffff',
          black: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        safe: 'max(1rem, env(safe-area-inset-bottom))',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        base: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}