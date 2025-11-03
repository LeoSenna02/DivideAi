<!-- DESIGN_SYSTEM.md -->

# Design System — DivideAí

## Visão Geral

O sistema de design do DivideAí segue princípios de **minimalismo elegante** e **sofisticação clean**, com uma paleta de cores que transmite confiança, equidade e harmonia.

---

## 📋 Paleta de Cores

### 1. **Primary — Verde Esmeralda** (Principal)
Usado para elementos principais, CTAs, destaques.

| Tom | Hex | Uso |
|-----|-----|-----|
| 25 | `#f8fdf9` | Fundo muito claro (hover, backgrounds) |
| 50 | `#f0fdf4` | Fundo claro |
| 100 | `#dcfce7` | Badge, backgrounds suaves |
| 200 | `#bbf7d0` | Progress bar background |
| 300 | `#86efac` | Accents secundários |
| 400 | `#4ade80` | Elementos interativos |
| **500** | **`#22c55e`** | **Base principal (botões, ícones)** |
| 600 | `#16a34a` | Hover, estados ativos |
| 700 | `#15803d` | Active, press (dark) |
| 800 | `#166534` | Dark mode support |
| 900 | `#145231` | Very dark mode |

**Psicologia**: Verde transmite crescimento, confiança, equidade — perfeito para "DivideAí".

---

### 2. **Secondary — Cinza Minimalista** (Neutro)
Usado para textos, borders, backgrounds neutros, componentes secundários.

| Tom | Hex | Uso |
|-----|-----|-----|
| 25 | `#fafafa` | Fundo muito claro |
| 50 | `#f9fafb` | Fundo padrão, cards |
| 100 | `#f3f4f6` | Background alternativo |
| 200 | `#e5e7eb` | Borders, dividers |
| 300 | `#d1d5db` | Subtle borders |
| 400 | `#9ca3af` | Placeholder text, disabled |
| 500 | `#6b7280` | Secondary text, icons |
| 600 | `#4b5563` | Subtle accents |
| 700 | `#374151` | Primary text |
| 800 | `#1f2937` | Dark text |
| 900 | `#111827` | Darkest text |

---

### 3. **Success — Verde Suave**
Feedback positivo, confirmações.

| Ton | Hex |
|-----|-----|
| 500 | `#22c55e` |
| 600 | `#16a34a` |

---

### 4. **Warning — Âmbar Elegante**
Avisos, atenção.

| Tom | Hex |
|-----|-----|
| 500 | `#f59e0b` |
| 600 | `#d97706` |

---

### 5. **Danger — Vermelho Sofisticado**
Erros, ações destrutivas.

| Tom | Hex |
|-----|-----|
| 500 | `#ef4444` |
| 600 | `#dc2626` |

---

## 🎨 Componentes e Aplicação

### Buttons

**Primary Button**
```html
<button class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  Ação Principal
</button>
```

**Secondary Button**
```html
<button class="bg-secondary-100 hover:bg-secondary-200 text-secondary-700 px-4 py-2 rounded-lg font-medium transition-colors">
  Ação Secundária
</button>
```

**Danger Button**
```html
<button class="bg-danger-500 hover:bg-danger-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  Excluir
</button>
```

---

### Cards & Containers

```html
<div class="bg-secondary-50 border border-secondary-200 rounded-lg p-4 shadow-sm">
  Conteúdo clean e elegante
</div>
```

---

### Navigation & Headers

```html
<header class="bg-white border-b border-secondary-200">
  <h1 class="text-secondary-900 font-semibold">Título</h1>
  <p class="text-secondary-600 text-sm">Descrição</p>
</header>
```

---

### FAB (Floating Action Button)

```html
<button class="bg-primary-500 hover:bg-primary-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center focus:ring-2 focus:ring-primary-300">
  ➕
</button>
```

---

### Progress & Status

**Concluído**
```html
<div class="bg-success-100 text-success-700 px-2 py-1 rounded">✓ Concluído</div>
```

**Pendente**
```html
<div class="bg-warning-100 text-warning-700 px-2 py-1 rounded">⚠ Pendente</div>
```

**Erro**
```html
<div class="bg-danger-100 text-danger-700 px-2 py-1 rounded">✗ Erro</div>
```

---

## 🎯 Princípios de Uso

1. **Minimalismo**: Use espaçamento generoso, hierarquia clara.
2. **Contraste**: Certifique-se de contraste WCAG AA (4.5:1 mínimo para texto).
3. **Consistência**: Use `primary-500` como cor principal em todas as CTAs.
4. **Accessibilidade**: Sempre use cores com propósito; não dependa apenas de cor.
5. **Dark Mode Ready**: Paleta foi pensada para suportar modo escuro (futuro).

---

## 📱 Tipografia

- **Font**: Inter (system-ui fallback)
- **Headings**: `font-semibold` ou `font-bold`
- **Body**: `font-normal`
- **Small**: `text-sm` com `text-secondary-600`

---

## ✨ Exemplos Reais

### Login Page
```
- Background: white
- Primary input: border-secondary-300, focus:ring-primary-500
- Button: bg-primary-500 hover:bg-primary-600
- Footer: text-secondary-600
```

### Task Card
```
- Background: bg-secondary-50
- Border: border-secondary-200
- Title: text-secondary-900 font-semibold
- Badge: bg-primary-100 text-primary-700
```

### Navigation (Footer)
```
- Background: white
- Border: border-secondary-200
- Active Icon: text-primary-500
- Inactive Icon: text-secondary-400
```

---

## 🔄 Variáveis Tailwind Disponíveis

Acesse todas as cores via classes Tailwind:

```
primary-{25,50,100,200,300,400,500,600,700,800,900}
secondary-{25,50,100,200,300,400,500,600,700,800,900}
success-{50,100,200,300,400,500,600,700}
warning-{50,100,200,300,400,500,600,700}
danger-{50,100,200,300,400,500,600,700}
```

---

## 🎨 Inspiração

- **Cores**: Calibrada com ferramentas Figma/Adobe Color
- **Acessibilidade**: Testada com https://contrast-ratio.com
- **Nome**: Verde esmeralda representa equidade, divisão justa, harmonia

Bem-vindo ao novo design visual do DivideAí! 🌿✨
