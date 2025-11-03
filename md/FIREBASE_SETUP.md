# 🔧 Configuração do Firebase - DivideAí

## 1. Obtenha suas credenciais do Firebase

### Passo a Passo:

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto "DivideAí"
3. Clique em **Configurações do Projeto** (ícone de engrenagem no canto superior esquerdo)
4. Abra a aba **"Seu aplicativo"** 
5. Clique em **"Aplicativo da Web"** (ícone `</>`)
6. Copie o objeto de configuração que aparece

### Deve ficar algo assim:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seuProjeto.firebaseapp.com",
  projectId: "seuProjeto",
  storageBucket: "seuProjeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## 2. Configure o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=seuProjeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seuProjeto
VITE_FIREBASE_STORAGE_BUCKET=seuProjeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## 3. Configure o Firestore Database

1. No Firebase Console, vá para **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha **Iniciar no modo de teste** (para desenvolvimento)
4. Selecione uma região próxima

## 4. Configure a Autenticação

1. No Firebase Console, vá para **Autenticação**
2. Clique em **Configurar método de login**
3. Habilite **Email/Senha**

## 5. Configure as Regras de Segurança do Firestore

No Firestore, abra a aba **Regras** e configure:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios documentos
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Lares - permitir se o usuário é membro
    match /homes/{homeId} {
      allow read: if request.auth.uid in resource.data.members;
      allow write: if request.auth.uid == resource.data.ownerId;
      allow create: if request.auth.uid != null;
    }

    // Tarefas - permitir se o usuário é do lar
    match /tasks/{taskId} {
      allow read, write: if request.auth.uid in get(/databases/$(database)/documents/homes/$(resource.data.homeId)).data.members;
      allow create: if request.auth.uid in get(/databases/$(database)/documents/homes/$(request.resource.data.homeId)).data.members;
    }
  }
}
```

## Pronto! 🎉

O projeto agora está conectado ao Firebase com:
- ✅ Autenticação (Email/Senha)
- ✅ Firestore Database (armazenamento de dados)
- ✅ Segurança com regras customizadas

Para testar, inicie a aplicação:
```bash
npm run dev
```
