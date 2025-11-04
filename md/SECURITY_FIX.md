# Correção de Segurança - Acesso não Autorizado a Lares

## 🔴 Problema Identificado

Um usuário aleatório conseguia acessar dados de outro lar sem ter recebido um convite. Isso era uma **falha crítica de segurança**.

### Causa Raiz

1. **HomePage com ID Fixo**: A página inicial redirecionava para um `homeId` fixo (`'default-home'`), em vez de verificar quais lares o usuário pertence.
2. **Falta de Validação de Permissões**: As páginas de tarefas, ranking, etc., não verificavam se o usuário era realmente membro do lar antes de exibir os dados.
3. **Confiança Cega no Frontend**: A validação depende apenas do que o usuário colocava na URL, sem verificação no backend.

## ✅ Solução Implementada

### 1. **Nova Função: `getUserHomes()`**

```typescript
export const getUserHomes = async (userId: string): Promise<Array<{ homeId: string; role: string }>> => {
  const membersRef = collection(db, 'homeMembers');
  const q = query(membersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    homeId: doc.homeId,
    role: doc.role || 'member',
  }));
};
```

**O que faz**: Busca todos os lares do qual o usuário é membro consultando a coleção `homeMembers`.

### 2. **HomePage Corrigida**

**Antes**:
```typescript
navigate('/home/default-home', { replace: true });
```

**Depois**:
```typescript
const homes = await getUserHomes(user.id);

if (homes.length === 0) {
  navigate('/login', { replace: true });
  return;
}

// Redirecionar para o primeiro lar do usuário
navigate(`/home/${homes[0].homeId}`, { replace: true });
```

**Benefício**: Garante que o usuário só acesse lares dos quais é membro.

### 3. **Verificação de Permissões em Páginas**

Adicionado a `TasksPage` e `RankingPage`:

```typescript
// Verificar se o usuário é membro do lar
const isMember = homeMembers.some(m => m.userId === user.id);
if (!isMember && !await isHomeAdmin(homeId, user.id)) {
  setAccessDenied(true);
  return;
}
```

Se o usuário não for membro, exibe uma tela de acesso negado:

```
🚫 Acesso Negado
Você não tem permissão para acessar este lar.
[Voltar aos Meus Lares]
```

## 🔒 Camadas de Segurança Agora Ativas

```
┌─────────────────────────────────────┐
│ 1. HomePage                          │
│    ↓ Busca lares do usuário         │
│    ↓ Redireciona apenas para eles   │
├─────────────────────────────────────┤
│ 2. TasksPage / RankingPage / etc    │
│    ↓ Carrega membros do lar         │
│    ↓ Valida se usuário é membro     │
│    ↓ Bloqueia acesso se não for     │
├─────────────────────────────────────┤
│ 3. Firestore Rules                  │
│    ↓ Validação adicional no BD      │
│    ↓ (a implementar para máxima seg) │
└─────────────────────────────────────┘
```

## 🚀 Proximos Passos Recomendados

### 1. **Atualizar Firestore Rules**

As regras do Firestore precisam ser atualizadas para rejeitar leituras não autorizadas:

```firestore
match /tasks/{taskId} {
  allow read: if isMember(resource.data.homeId);
  allow write: if isAdmin(resource.data.homeId);
}

match /homeMembers/{memberId} {
  allow read: if isMember(resource.data.homeId);
  allow write: if isAdmin(resource.data.homeId);
}

match /monthlyScores/{scoreId} {
  allow read: if isMember(resource.data.homeId);
  allow write: if isAdmin(resource.data.homeId);
}

match /dailyAssignments/{assignmentId} {
  allow read: if isMember(resource.data.homeId);
  allow write: if isAdmin(resource.data.homeId);
}
```

### 2. **Adicionar Verificações em Mais Páginas**

- ManageTasksPage
- ManageMembersPage
- RewardsPage
- CalendarPage
- SettingsPage
- ScoreBoardPage

### 3. **Logging e Monitoramento**

Adicionar logs de tentativas de acesso não autorizado para auditoria:

```typescript
console.error(`⚠️ ACESSO NEGADO: Usuário ${user.id} tentou acessar lar ${homeId} sem permissão`);
// Registrar em coleção 'auditLog' do Firestore
```

## ✨ Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `firestoreService.ts` | ✅ Adicionada função `getUserHomes()` |
| `HomePage.tsx` | ✅ Busca lares do usuário antes de redirecionar |
| `TasksPage.tsx` | ✅ Valida se usuário é membro do lar |
| `RankingPage.tsx` | ✅ Valida se usuário é membro do lar |

## 🧪 Como Testar

1. **Criar duas contas diferentes**:
   - Conta A: cria um lar
   - Conta B: sem acesso a esse lar

2. **Tentar acessar manualmente**:
   - Logar com Conta B
   - Tentar acessar URL: `/home/{homeId-da-conta-a}`
   - ✅ Resultado: Tela de "Acesso Negado"

3. **Verificar que funciona normalmente**:
   - Logar com Conta A
   - Acessar seu próprio lar
   - ✅ Resultado: Funciona normalmente
