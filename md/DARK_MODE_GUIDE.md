# Guia de Uso - Sistema de Tema Escuro/Claro DivideAí

## 🎨 Visão Geral

O DivideAí agora possui um sistema completo de tema escuro e claro. O usuário pode alternatar entre os temas, e a preferência é salva no `localStorage`.

## 📦 Estrutura

- **`src/context/ThemeContext.tsx`** - Context Provider para gerenciar o estado do tema
- **`src/hooks/useThemeCustom.ts`** - Hook customizado para acessar o tema em componentes
- **`src/components/ThemeToggle.tsx`** - Componente botão para alternar tema
- **`src/index.css`** - Estilos com suporte a dark mode
- **`tailwind.config.js`** - Configurado com `darkMode: 'class'`

## 🚀 Como Usar

### 1. Usar o Hook em Componentes

```tsx
import { useThemeCustom } from '../hooks/useThemeCustom';

export function MyComponent() {
  const { isDark, isLight, toggleTheme } = useThemeCustom();

  return (
    <div>
      <p>Modo escuro: {isDark ? 'Ativado' : 'Desativado'}</p>
      <button onClick={toggleTheme}>Alternar Tema</button>
    </div>
  );
}
```

### 2. Usar Classes Tailwind para Dark Mode

Use o prefixo `dark:` para estilos que aparecem apenas no modo escuro:

```tsx
// Exemplo: Background claro no modo light, escuro no modo dark
<div className="bg-secondary-50 dark:bg-secondary-900">
  <p className="text-secondary-900 dark:text-secondary-50">Conteúdo</p>
</div>
```

### 3. Adicionar Toggle de Tema na Interface

O componente `ThemeToggle` já está adicionado na `Navigation`. Para usar em outro lugar:

```tsx
import { ThemeToggle } from '../components/ThemeToggle';

export function MyHeader() {
  return (
    <header>
      <h1>Meu App</h1>
      <ThemeToggle />
    </header>
  );
}
```

## 🎯 Padrões de Cores - Dark Mode

### Fundo
- **Light:** `bg-secondary-50` ou `bg-white`
- **Dark:** `bg-secondary-900` ou `bg-secondary-800`

### Texto
- **Light:** `text-secondary-900` ou `text-secondary-700`
- **Dark:** `text-secondary-50` ou `text-secondary-200`

### Cards/Containers
- **Light:** `bg-secondary-50 border-secondary-200`
- **Dark:** `bg-secondary-800 border-secondary-700`

### Inputs/Selects
- **Light:** `bg-white border-secondary-300 text-secondary-900`
- **Dark:** `bg-secondary-700 border-secondary-600 text-secondary-50`

### Botões
- **Primary Light:** `bg-primary-500 text-white`
- **Primary Dark:** `dark:bg-primary-600 dark:text-white`

## 📝 Exemplo Completo

```tsx
import { useThemeCustom } from '../hooks/useThemeCustom';
import { ThemeToggle } from '../components/ThemeToggle';

export function MyCard() {
  const { isDark } = useThemeCustom();

  return (
    <div className="card dark:bg-secondary-800 dark:border-secondary-700">
      <h2 className="text-secondary-900 dark:text-secondary-50">Meu Card</h2>
      <p className="text-secondary-600 dark:text-secondary-400">
        Conteúdo que se adapta ao tema
      </p>
      <input
        type="text"
        className="input dark:bg-secondary-700 dark:text-secondary-50 dark:border-secondary-600"
        placeholder="Digite algo"
      />
      <ThemeToggle />
    </div>
  );
}
```

## 🔧 Preferências do Usuário

O tema é salvo no `localStorage` com a chave `'theme'`. Ao abrir a aplicação:

1. Verifica se há uma preferência salva
2. Se não, usa a preferência do sistema (`prefers-color-scheme`)
3. Se o sistema não indicar preferência, usa o tema claro por padrão

## 💡 Dicas

- ✅ Sempre use `dark:` no Tailwind em vez de CSS condicional
- ✅ Teste ambos os temas durante o desenvolvimento
- ✅ Mantenha contraste adequado para acessibilidade
- ✅ Use as cores da paleta do projeto para consistência
- ⚠️ Evite cores hardcoded em favor das classes Tailwind

## 🎨 Paleta de Cores Disponível

Ver `tailwind.config.js` para a paleta completa com variações:
- `primary` (Verde Esmeralda)
- `secondary` (Cinza Minimalista)
- `success` (Verde Suave)
- `warning` (Âmbar Elegante)
- `danger` (Vermelho Sofisticado)
