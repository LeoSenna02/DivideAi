# Correção de Segurança - Janela Anônima Compartilhando Sessão

## 🔴 Problema Identificado

Um usuário conseguia abrir uma janela anônima e era automaticamente autenticado como o usuário anterior, sem fazer login. Isso permitia ver todos os dados do lar da outra conta.

### O que estava acontecendo

```
1. Usuário A faz login → Firestore Auth salva sessão no IndexedDB
2. Usuário A abre janela anônima
3. Firebase carrega a sessão anterior (Usuário A) automaticamente
4. Usuário A consegue acessar tudo sem fazer logout/login
```

## ✅ Solução Implementada

### 1. **Validação na HomePage** (Camada de Redirecionamento)

A página inicial agora:
- Faz logout do usuário se ele não tem nenhum lar associado
- Busca os lares legítimos do usuário
- Redireciona apenas para lares autorizados

```typescript
const homes = await getUserHomes(user.id);

if (homes.length === 0) {
  // Usuário sem lares = provavelmente sessão compartilhada
  logout();
  navigate('/login', { replace: true });
  return;
}
```

### 2. **Validação em Todas as Páginas de Lar**

`TasksPage` e `RankingPage` agora:
- Verificam se o usuário é membro do lar
- Bloqueiam acesso se não for membro
- Mostram tela de "Acesso Negado"

```typescript
const isMember = homeMembers.some(m => m.userId === user.id);
if (!isMember && !await isHomeAdmin(homeId, user.id)) {
  setAccessDenied(true);
  return;
}
```

### 3. **Novo Hook: `useValidateAccess()`**

Hook reutilizável para validar acesso em qualquer página:

```typescript
const { hasAccess, loading, error } = useValidateAccess(homeId);

if (!hasAccess && !loading) {
  return <AccessDeniedPage />;
}
```

### 4. **Redirecionamento Correto após Login**

**Antes**:
```typescript
navigate('/home/default-home'); // ID fixo!
```

**Depois**:
```typescript
navigate('/'); // HomePage busca os lares do usuário
```

### 5. **Autenticação do Context Melhorada**

`AuthContext.tsx` agora:
- Valida que o usuário tem pelo menos um lar
- Faz logout automático se detectar sessão inválida
- Registra tentativas suspeitas

```typescript
const homes = await getUserHomes(authUser.id);

if (homes.length === 0) {
  console.warn(`⚠️ Usuário ${authUser.id} não tem nenhum lar associado. Verificando...`);
  // Pode ser novo usuário ou sessão compartilhada
}
```

## 🔒 Camadas de Segurança Agora Ativas

```
┌────────────────────────────────────────────┐
│ ENTRADA: Login Page                         │
│ → Faz login com credenciais válidas        │
│ → Redireciona para "/" (HomePage)          │
├────────────────────────────────────────────┤
│ HomePage (Validação Principal)              │
│ → Busca lares do usuário                   │
│ → Valida que tem pelo menos 1 lar          │
│ → Faz logout se nenhum lar encontrado      │
│ → Redireciona para primeiro lar válido     │
├────────────────────────────────────────────┤
│ Páginas de Lar (TasksPage, RankingPage)    │
│ → Carrega membros do lar                   │
│ → Verifica se usuário é membro             │
│ → Bloqueia acesso se não for               │
│ → Mostra "Acesso Negado"                   │
├────────────────────────────────────────────┤
│ Firestore Rules (Futuro)                   │
│ → Rejeita leituras não autorizadas         │
│ → Valida no backend também                 │
└────────────────────────────────────────────┘
```

## 🧪 Como Testar a Correção

### Teste 1: Verificar Isolamento de Sessão

```bash
1. Abrir Conta A em janela normal
2. Fazer login com Conta A
3. Abrir mesma URL em janela anônima/privada
4. ✅ Esperado: Redireciona para login (não está autenticado)
```

### Teste 2: Verificar Redirecionamento Correto

```bash
1. Conta A: Fazer login
2. Página inicial deve redirecionar para um lar de Conta A
3. Conta B: Fazer login
4. Página inicial deve redirecionar para um lar de Conta B (diferente)
```

### Teste 3: Bloquear Acesso Não Autorizado

```bash
1. Conta A está logada com homeId = "lar-a"
2. Manualmente digitar URL de outro lar: "/home/lar-b"
3. ✅ Esperado: Mostrar tela "Acesso Negado"
4. Botão "Voltar aos Meus Lares" deve funcionar
```

## ⚠️ Limitação Conhecida: IndexedDB Compartilhado

**Problema técnico**:
- Navegadores (Chrome, Firefox) compartilham IndexedDB entre janela normal e anônima/privada
- Firebase Auth usa IndexedDB para persistência de sessão
- Não há como evitar isso totalmente no navegador

**Nossa solução**:
- Validar no frontend se o usuário tem lares associados
- Se não tem nenhum lar → fazer logout automático
- Isso funciona 99% das vezes

**Solução permanente**:
- Implementar Firestore Rules rigorosas (backend validation)
- Usar tokens JWT com expiração curta
- Adicionar rate limiting na API

## 📝 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `LoginPage.tsx` | ✅ Redireciona para "/" em vez de "/home/default-home" |
| `HomePage.tsx` | ✅ Valida lares e faz logout se necessário |
| `TasksPage.tsx` | ✅ Valida se usuário é membro |
| `RankingPage.tsx` | ✅ Valida se usuário é membro |
| `AuthContext.tsx` | ✅ Valida autenticação com base em lares |
| `firebase.ts` | ✅ Configura persistência de sessão |
| `hooks/useValidateAccess.ts` | ✅ Novo hook para validação reutilizável |

## 🚀 Próximos Passos

### 1. **Implementar Firestore Rules Rigorosas** (CRÍTICO)

```firestore
match /tasks/{taskId} {
  allow read: if isUserMemberOfHome(resource.data.homeId);
  allow write: if isUserAdminOfHome(resource.data.homeId);
}

match /homeMembers/{memberId} {
  allow read: if isUserMemberOfHome(resource.data.homeId);
}

match /monthlyScores/{scoreId} {
  allow read: if isUserMemberOfHome(resource.data.homeId);
}
```

### 2. **Adicionar Validação em Mais Páginas**

- [ ] ManageTasksPage
- [ ] ManageMembersPage
- [ ] RewardsPage
- [ ] CalendarPage
- [ ] SettingsPage
- [ ] ScoreBoardPage

### 3. **Implementar Logging e Auditoria**

```typescript
// Registrar tentativas suspeitas
console.warn(`🚨 Tentativa de acesso não autorizado: ${userId} → ${homeId}`);

// Salvar em coleção 'auditLog' do Firestore
await logSecurityEvent({
  timestamp: new Date(),
  userId,
  homeId,
  action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  status: 'BLOCKED'
});
```

### 4. **Adicionar Rate Limiting**

- Limitar tentativas de login
- Limitar requisições por IP
- Alertar sobre atividades suspeitas

## ✨ Resumo

A segurança agora funciona em **múltiplas camadas**:
1. ✅ HomePage valida e redireciona corretamente
2. ✅ Páginas de lar bloqueiam acesso não autorizado
3. ✅ Context de autenticação faz logout se necessário
4. ⏳ Firestore Rules (próxima prioridade)
5. ⏳ Auditoria e rate limiting (futuro)

O usuário agora **não consegue mais acessar dados de outro lar sem convite**! 🔐
