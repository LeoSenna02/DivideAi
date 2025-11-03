# 🔐 Setup das Regras do Firestore - DivideAí

## Problema Atual
Você está recebendo o erro: **"Missing or insufficient permissions"** ao tentar carregar tarefas.

Isso significa que as regras de segurança do Firestore não estão permitindo acesso aos dados. Siga os passos abaixo para resolver.

---

## ✅ Solução 1: Deploy via Firebase Console (Recomendado para Iniciantes)

### Passo 1: Acesse o Firebase Console
1. Vá para [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto **DivideAí**
3. No menu esquerdo, clique em **Firestore Database**
4. Abra a aba **Regras** (no topo)

### Passo 2: Copie e Cole as Regras
Copie o conteúdo abaixo e substitua TODAS as regras existentes no Firebase Console:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios documentos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Tarefas - usuários autenticados podem ler/escrever
    // Por enquanto sem validação de Lares (modelo será adicionado depois)
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Passo 3: Publique as Regras
1. Clique no botão **Publicar** (canto superior direito do editor de regras)
2. Confirme a publicação
3. Aguarde a confirmação (aparecerá "Regras publicadas com sucesso" ou similar)

### Passo 4: Teste a Aplicação
1. Volte à aplicação React
2. Atualize a página (F5)
3. Tente carregar as tarefas novamente

---

## ✅ Solução 2: Deploy via Firebase CLI (Para Desenvolvimento Avançado)

Se você tiver Firebase CLI instalado:

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Fazer login no Firebase
firebase login

# Conectar ao seu projeto (substitua "seu-projeto" pelo ID do projeto)
firebase use seu-projeto-id

# Deploy apenas das regras
firebase deploy --only firestore:rules

# Ver o status do deploy
firebase status
```

---

## � Estrutura Esperada do Firestore (Versão Simplificada)

Para que tudo funcione, seus documentos devem ter esta estrutura:

### Coleção: `users`
```json
{
  "id": "user-uid",
  "name": "João Silva",
  "email": "joao@example.com",
  "avatar": "url-da-foto",
  "createdAt": "2025-11-03..."
}
```

### Coleção: `tasks`
```json
{
  "id": "task123",
  "title": "Lavar louça",
  "description": "Lavar louça da cozinha",
  "assignedToId": "user-uid",
  "weight": 3,
  "completed": false,
  "dueDate": "2025-11-04...",
  "createdAt": "2025-11-03..."
}
```

---

## 🆘 Ainda Não Funciona?

Se o problema persistir:

1. **Verifique os logs do Firebase**: No Firebase Console, vá para **Logs** e procure por erros de permissão
2. **Use o Emulador do Firebase** (avançado):
   ```bash
   firebase emulators:start
   ```
3. **Verifique se você está logado**: Confirme que está autenticado na aplicação

---

## ✨ Pronto!

Após publicar as regras, a aplicação deve funcionar normalmente. As regras garantem que:
- ✅ Apenas usuários autenticados acessem dados
- ✅ Tarefas são gerenciadas com segurança
- ✅ Dados são protegidos e seguros

**Nota:** Quando o modelo de Lares (casas compartilhadas) for reintroduzido, as regras serão atualizadas para validar associações.
