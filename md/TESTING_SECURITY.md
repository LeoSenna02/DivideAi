# 🧪 Plano de Testes - Segurança de Acesso a Lares

## Teste Crítico: Janela Anônima Compartilhando Sessão

Este é o teste mais importante para validar que a correção funcionou.

### Pré-Requisitos

- 2 contas diferentes criadas no Firebase
  - Conta A: email1@test.com
  - Conta B: email2@test.com
- Conta A tem acesso a um lar
- Conta B não foi convidada para esse lar
- Aplicação rodando localmente ou em produção

### Teste 1: Verificar Isolamento de Janela Anônima

**Objetivo**: Garantir que janela anônima não compartilhe sessão autenticada

**Passos**:

```
1. Abrir Conta A
   └─ Abrir navegador normal
   └─ Ir para http://localhost:5173
   └─ Fazer login com email1@test.com / senha
   └─ ✅ Deve redirecionar para /home/{seu-lar}

2. Abrir Conta B em janela anônima
   └─ Abrir MESMA URL em janela anônima/privada
   └─ http://localhost:5173
   └─ ❌ ESPERADO: Não deve estar autenticado
   └─ ✅ Deve redirecionar para /login
   
3. Se redirecionar para /login:
   └─ ✅ PASSOU NO TESTE
   └─ A correção está funcionando!

4. Se redirecionar para /home/{lar}:
   └─ ❌ FALHOU NO TESTE
   └─ Ainda há problema de sessão compartilhada
```

### Teste 2: Bloquear Acesso Manual a Outro Lar

**Objetivo**: Garantir que usuário não pode digitar URL de lar que não pertence

**Passos**:

```
1. Com Conta A logada:
   └─ Anotar o homeId atual (ex: "lar-a")
   └─ Criar outro lar (criar novo em outro dispositivo ou contar com Conta C)
   └─ Anotar seu homeId (ex: "lar-b")

2. Tentar acessar manualmente:
   └─ Digitar URL: http://localhost:5173/home/lar-b
   └─ ❌ ESPERADO: Mostrar tela "🚫 Acesso Negado"

3. Se mostrar "Acesso Negado":
   └─ ✅ PASSOU NO TESTE
   └─ Validação de permissões está funcionando!

4. Se mostrar tarefas/dados do lar-b:
   └─ ❌ FALHOU NO TESTE
   └─ Falta validação nas páginas
```

### Teste 3: Redirecionamento Correto após Login

**Objetivo**: Verificar que cada usuário é redirecionado para seu próprio lar

**Passos**:

```
1. Fazer logout (Conta A)
   └─ Clicar em "Sair" ou limpar localStorage
   └─ Redirecionar para /login

2. Fazer login com Conta B
   └─ Email: email2@test.com
   └─ Senha: sua-senha
   └─ Clicar em "Entrar"

3. Após login:
   └─ ✅ ESPERADO: Redirecionar para /home/{lar-da-conta-b}
   └─ NÃO deve ser o lar da Conta A!

4. Se redirecionar para lar correto:
   └─ ✅ PASSOU NO TESTE
   └─ Redirecionamento está inteligente!

5. Se redirecionar para /home/default-home ou lar errado:
   └─ ❌ FALHOU NO TESTE
   └─ HomePage ou redirecionamento incorreto
```

### Teste 4: Usuário sem Nenhum Lar

**Objetivo**: Verificar que usuário novo/sem lar é desconectado

**Passos**:

```
1. Criar conta nova em Firebase
   └─ Email: novo@test.com
   └─ Senha: uma-senha
   └─ Fazer login

2. Após login:
   └─ HomePage vai buscar lares
   └─ ❌ Vai encontrar: 0 lares
   └─ ✅ ESPERADO: Fazer logout automático
   └─ ✅ ESPERADO: Redirecionar para /login

3. Se fizer logout e redirecionar:
   └─ ✅ PASSOU NO TESTE
   └─ Validação de usuário sem lar está funcionando!

4. Se ficar preso ou mostrar erro:
   └─ ❌ FALHOU NO TESTE
   └─ HomePage não está tratando usuários novos
```

### Teste 5: Validação de Múltiplos Lares

**Objetivo**: Verificar que usuário com vários lares redireciona para o primeiro

**Cenário**: Um usuário é membro de 3 lares diferentes

**Passos**:

```
1. Criar/usar conta que é membro de 3 lares
   └─ Lar 1: "casa-sp" 
   └─ Lar 2: "apartamento-rj"
   └─ Lar 3: "sitio-mg"

2. Fazer login com essa conta
   └─ HomePage vai buscar os 3 lares
   └─ ✅ ESPERADO: Redirecionar para primeiro (casa-sp)

3. Verificar que consegue acessar todos:
   └─ Clicar no seletor de lar (se houver)
   └─ ✅ ESPERADO: Conseguir navegar entre os 3 lares

4. Se tudo funcionar:
   └─ ✅ PASSOU NO TESTE
   └─ Suporte a múltiplos lares está funcionando!
```

## 🔍 Verificações no Console do Navegador

Abra o console (F12) durante os testes para verificar logs:

```javascript
// Você deve ver logs como:
✅ Usuário abc123 tem 1 lar(es). Redirecionando para: lar-a
⚠️ Usuário xyz789 não tem nenhum lar associado. Verificando...
❌ Acesso negado: Usuário não é membro do lar def456
```

## 📊 Matriz de Testes

| Teste | Status | Observações |
|-------|--------|------------|
| Janela Anônima | [ ] Pass / [ ] Fail | |
| Acesso Manual a Outro Lar | [ ] Pass / [ ] Fail | |
| Redirecionamento Correto | [ ] Pass / [ ] Fail | |
| Usuário sem Lar | [ ] Pass / [ ] Fail | |
| Múltiplos Lares | [ ] Pass / [ ] Fail | |

## ✅ Checklist Final

Antes de considerar a correção completa:

- [ ] Todos os 5 testes passaram
- [ ] Nenhum erro no console do navegador
- [ ] Usuário não consegue acessar dados de outro lar
- [ ] Janela anônima não compartilha sessão
- [ ] Cada usuário vê apenas seus próprios lares
- [ ] Logout funciona corretamente
- [ ] Login funciona corretamente

## 🐛 Se Algum Teste Falhar

1. **Capturar informações**:
   - Screenshot da tela
   - Print do console (F12)
   - Email/ID do usuário testado
   - Timestamp do teste

2. **Registrar o erro**:
   - Qual teste falhou?
   - Qual era o comportamento esperado?
   - Qual foi o comportamento real?

3. **Possíveis causas**:
   - Firebase Rules não configuradas
   - Sessão compartilhada do IndexedDB
   - Lógica de HomePage incorreta
   - Falta de validação em páginas

4. **Próximos passos**:
   - Verificar logs do Firebase
   - Limpar cache/cookies
   - Reiniciar a aplicação
   - Contactar suporte técnico

## 🎯 Resultado Esperado

Após todas as correções, o sistema deve:

✅ **Isolamento de Usuários**: Cada usuário vê apenas seus dados
✅ **Bloqueio de Acesso**: Impossível acessar outro lar sem convite
✅ **Redirecionamento Inteligente**: HomePage busca lares corretamente
✅ **Validação em Múltiplas Camadas**: Frontend + regras de segurança
✅ **Logout Automático**: Sessões inválidas são desconectadas

**Status**: 🔒 SEGURO PARA PRODUÇÃO
