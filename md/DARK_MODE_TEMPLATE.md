# 🌙 Template - Como Aplicar Dark Mode em Novas Páginas

## Padrões Recomendados

Use este template como referência ao criar ou atualizar páginas do projeto.

---

## 1️⃣ Imports Necessários

```tsx
import { useThemeCustom } from '../hooks/useThemeCustom';
// Importar apenas se precisar lógica condicional de tema
```

---

## 2️⃣ Estrutura de Container Principal

```tsx
// ❌ Sem dark mode
<div className="min-h-screen bg-secondary-50">

// ✅ Com dark mode
<div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
```

---

## 3️⃣ Padrão de Cards

```tsx
// ❌ Sem dark mode
<div className="bg-white rounded-lg shadow border border-secondary-200 p-6">
  <h2>Título</h2>
</div>

// ✅ Com dark mode
<div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-secondary-200 dark:border-secondary-700 p-6">
  <h2 className="text-secondary-900 dark:text-secondary-50">Título</h2>
</div>
```

---

## 4️⃣ Padrão de Textos

```tsx
// ❌ Sem dark mode
<p className="text-secondary-600">Descrição</p>

// ✅ Com dark mode
<p className="text-secondary-600 dark:text-secondary-400">Descrição</p>
```

---

## 5️⃣ Padrão de Botões

```tsx
// ❌ Sem dark mode
<button className="btn btn-primary">Clique aqui</button>

// ✅ Já tem dark mode integrado!
// (verificar classes em index.css)
<button className="btn btn-primary">Clique aqui</button>
```

---

## 6️⃣ Padrão de Inputs

```tsx
// ❌ Sem dark mode
<input type="text" className="input" placeholder="Digite..." />

// ✅ Já tem dark mode integrado!
<input type="text" className="input" placeholder="Digite..." />
```

---

## 7️⃣ Padrão de Backgrounds Gradientes

```tsx
// ❌ Sem dark mode
<div className="bg-gradient-to-br from-primary-50 to-secondary-100">

// ✅ Com dark mode
<div className="bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-800">
```

---

## 8️⃣ Padrão de Bordas

```tsx
// ❌ Sem dark mode
<div className="border border-secondary-200">

// ✅ Com dark mode
<div className="border border-secondary-200 dark:border-secondary-700">
```

---

## 9️⃣ Padrão de Hover States

```tsx
// ❌ Sem dark mode
<button className="hover:bg-secondary-100">

// ✅ Com dark mode
<button className="hover:bg-secondary-100 dark:hover:bg-secondary-700">
```

---

## 🔟 Padrão com Lógica Condicional (Raro)

Apenas use quando realmente necessário. Na maioria dos casos, Tailwind com `dark:` é suficiente.

```tsx
import { useThemeCustom } from '../hooks/useThemeCustom';

export function MyComponent() {
  const { isDark } = useThemeCustom();

  return (
    <div>
      {isDark && <DarkModeSpecificComponent />}
      {!isDark && <LightModeSpecificComponent />}
    </div>
  );
}
```

---

## 🎨 Tabela Rápida de Cores

| Elemento | Light | Dark | Tailwind |
|----------|-------|------|----------|
| Background | `#f9fafb` | `#111827` | `bg-secondary-50 dark:bg-secondary-900` |
| Fundo Secundário | `#ffffff` | `#1f2937` | `bg-white dark:bg-secondary-800` |
| Texto Primário | `#374151` | `#f3f4f6` | `text-secondary-900 dark:text-secondary-50` |
| Texto Secundário | `#6b7280` | `#d1d5db` | `text-secondary-600 dark:text-secondary-400` |
| Border | `#e5e7eb` | `#374151` | `border-secondary-200 dark:border-secondary-700` |
| Hover Background | `#e5e7eb` | `#374151` | `hover:bg-secondary-100 dark:hover:bg-secondary-700` |

---

## 📋 Checklist para Novas Páginas

Ao criar uma nova página, verifique:

- [ ] Container principal tem `dark:bg-secondary-900`
- [ ] Todos os cards têm `dark:bg-secondary-800 dark:border-secondary-700`
- [ ] Textos têm classes `dark:text-secondary-*` apropriadas
- [ ] Links e botões têm classes `dark:text-primary-*` e hover states
- [ ] Inputs/selects herdam dark mode automaticamente
- [ ] Gradientes têm variantes `dark:from-*/dark:to-*`
- [ ] Bordas têm `dark:border-secondary-*`

---

## 🔗 Referências

- **Documentação:** `md/DARK_MODE_GUIDE.md`
- **Implementação:** `md/DARK_MODE_IMPLEMENTATION.md`
- **Cores Tailwind:** `tailwind.config.js`
- **Estilos Globais:** `src/index.css`

---

## ✨ Exemplos Completos

### Exemplo 1: Card Simples

```tsx
<div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-secondary-200 dark:border-secondary-700 p-6">
  <h2 className="text-secondary-900 dark:text-secondary-50 font-bold">Título</h2>
  <p className="text-secondary-600 dark:text-secondary-400 mt-2">Descrição aqui</p>
  <button className="btn btn-primary mt-4">Ação</button>
</div>
```

### Exemplo 2: Form Completo

```tsx
<div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 p-6">
  <div className="max-w-md mx-auto bg-white dark:bg-secondary-800 rounded-lg p-6">
    <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-50">Formulário</h1>
    
    <div className="mt-6">
      <label className="label">Nome</label>
      <input type="text" className="input" placeholder="Seu nome" />
    </div>
    
    <div className="mt-4">
      <label className="label">Email</label>
      <input type="email" className="input" placeholder="seu@email.com" />
    </div>
    
    <button className="btn btn-primary w-full mt-6">Enviar</button>
  </div>
</div>
```

### Exemplo 3: Lista com Itens

```tsx
<div className="space-y-3">
  {items.map((item) => (
    <div
      key={item.id}
      className="bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow"
    >
      <h3 className="text-secondary-900 dark:text-secondary-50 font-medium">
        {item.title}
      </h3>
      <p className="text-secondary-600 dark:text-secondary-400 text-sm mt-1">
        {item.description}
      </p>
    </div>
  ))}
</div>
```

---

**Última Atualização:** 4 de Novembro de 2025
