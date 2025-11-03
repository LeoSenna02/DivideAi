# Componente Checkbox - DivideAí

## 🎯 Visão Geral

Componente personalizado de checkbox que segue o design system do DivideAí, proporcionando uma experiência visual consistente e moderna.

## 📦 Componentes Disponíveis

### 1. **Checkbox** (Genérico)
Componente completo com label, estados de erro e texto auxiliar.

### 2. **TaskCheckbox** (Específico)
Versão otimizada para marcar tarefas como completas, com cores de sucesso.

## 🎨 Design System

### **Cores Utilizadas**
- **Borda**: `border-secondary-300` (cinza claro)
- **Hover**: `hover:border-primary-400` (azul claro)
- **Foco**: `focus:ring-primary-500` (azul)
- **Selecionado**: `bg-success-500` (verde sucesso)
- **Ícone**: `LuCheck` do Lucide React

### **Estados Visuais**
- ✅ **Selecionado**: Fundo verde com ícone branco
- ⭕ **Não selecionado**: Fundo branco com borda cinza
- 🎯 **Hover**: Borda azul clara + sombra sutil
- 🎯 **Foco**: Anel azul de foco
- 🚫 **Desabilitado**: Opacidade reduzida
- ⚡ **Ativo**: Efeito de escala (`active:scale-95`)

## 🔧 Como Usar

### **TaskCheckbox (Recomendado para tarefas)**

```tsx
import { TaskCheckbox } from '../components/Checkbox';

// Uso básico
<TaskCheckbox
  checked={assignment.completed}
  onChange={() => handleTaskToggle(assignment.id)}
/>

// Com tamanho personalizado
<TaskCheckbox
  checked={isDone}
  onChange={handleToggle}
  size="lg" // sm | md | lg
/>
```

### **Checkbox Genérico**

```tsx
import { Checkbox } from '../components/Checkbox';

// Com label
<Checkbox
  label="Aceito os termos"
  checked={accepted}
  onChange={setAccepted}
/>

// Com validação
<Checkbox
  label="Concordo com a política"
  checked={agreed}
  onChange={setAgreed}
  error={errors.agreement}
  helperText="É necessário concordar para continuar"
/>

// Tamanhos disponíveis
<Checkbox size="sm" />  // 16x16px
<Checkbox size="md" />  // 20x20px (padrão)
<Checkbox size="lg" />  // 24x24px
```

## 🎭 Estados e Propriedades

### **Propriedades do TaskCheckbox**
```typescript
interface TaskCheckboxProps {
  checked: boolean;           // Estado do checkbox
  onChange: () => void;       // Função chamada ao clicar
  disabled?: boolean;         // Desabilita interação (padrão: false)
  size?: 'sm' | 'md' | 'lg';  // Tamanho (padrão: 'md')
}
```

### **Propriedades do Checkbox**
```typescript
interface CheckboxProps extends Omit<HTMLInputElement, 'type' | 'size'> {
  label?: string;             // Texto do label
  error?: string;             // Mensagem de erro
  helperText?: string;        // Texto auxiliar
  size?: 'sm' | 'md' | 'lg';  // Tamanho
}
```

## ✨ Características Especiais

### **Animações**
- **Transições suaves**: 200ms de duração
- **Ícone animado**: Aparece/desaparece com escala
- **Hover effects**: Borda e sombra
- **Active state**: Efeito de pressão

### **Acessibilidade**
- **Screen reader**: Input escondido com `sr-only`
- **Foco visível**: Anel de foco azul
- **Cursor pointer**: Indica interatividade
- **Estados desabilitados**: Visualmente claro

### **Responsividade**
- **Tamanhos flexíveis**: sm/md/lg
- **Toque mobile**: Área de toque adequada
- **Focus ring**: Compatível com navegação por teclado

## 🎨 Estilos CSS (Tailwind)

### **Estrutura Base**
```css
/* Container */
relative

/* Input escondido */
sr-only

/* Checkbox customizado */
border-2 rounded-md transition-all duration-200 ease-in-out
flex items-center justify-center cursor-pointer

/* Estados */
checked:bg-success-500 checked:border-success-500 checked:text-white
hover:border-success-400 hover:shadow-sm
focus:ring-2 focus:ring-success-500 focus:ring-offset-2
disabled:opacity-50 disabled:cursor-not-allowed
active:scale-95 transform
```

### **Ícone Check**
```css
/* Lucide Check */
transition-all duration-200
checked:scale-100 checked:opacity-100
not-checked:scale-75 not-checked:opacity-0
```

## 🔄 Migração do Checkbox Padrão

### **Antes (HTML nativo)**
```tsx
<input
  type="checkbox"
  checked={completed}
  onChange={handleToggle}
  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500 cursor-pointer"
/>
```

### **Depois (TaskCheckbox)**
```tsx
<TaskCheckbox
  checked={completed}
  onChange={handleToggle}
/>
```

## 📱 Compatibilidade

- ✅ **React 18+**
- ✅ **TypeScript**
- ✅ **Tailwind CSS**
- ✅ **Lucide React Icons**
- ✅ **Mobile-first**
- ✅ **Acessibilidade WCAG**

## 🎯 Benefícios

1. **Consistência Visual**: Mesmo estilo em todo o app
2. **Experiência Melhorada**: Animações e feedback visual
3. **Acessibilidade**: Navegação por teclado e leitores de tela
4. **Manutenibilidade**: Código centralizado e reutilizável
5. **Performance**: Componente otimizado com forwardRef

---

**Implementado com ❤️ para tornar a interação com tarefas mais intuitiva e bonita!**
