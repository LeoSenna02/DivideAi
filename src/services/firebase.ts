// Configuração do Firebase
// IMPORTANTE: Substitua com suas credenciais do Firebase Console
// https://console.firebase.google.com

import { initializeApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Suas credenciais do Firebase (obtenha em: Project Settings → Web → Config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar autenticação e Firestore
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Configurar persistência de sessão para LOCAL (padrão)
// Nota: Janelas anônimas podem compartilhar dados com janelas normais se usarem o mesmo navegador
// Por isso, adicionamos validação no context de autenticação
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error('Erro ao configurar persistência:', err);
});

export default app;
