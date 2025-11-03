// Serviços de autenticação com Firebase

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '../types';

// Converter dados do Firebase para nosso tipo User
const convertFirebaseUserToAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data();
    return {
      id: firebaseUser.uid,
      name: data.name || firebaseUser.displayName || 'Usuário',
      email: firebaseUser.email || '',
      avatar: data.avatar || firebaseUser.photoURL || '',
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  }

  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Usuário',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || '',
    createdAt: new Date(),
  };
};

// Registrar novo usuário
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Salvar dados do usuário no Firestore
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      name,
      email,
      avatar: '',
      createdAt: Timestamp.now(),
    });

    return convertFirebaseUserToAppUser(firebaseUser);
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || 'Erro ao registrar';
    throw new Error(errorMessage);
  }
};

// Fazer login
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    return convertFirebaseUserToAppUser(firebaseUser);
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || 'Erro ao fazer login';
    throw new Error(errorMessage);
  }
};

// Fazer logout
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string })?.message || 'Erro ao fazer logout';
    throw new Error(errorMessage);
  }
};

// Observador de estado de autenticação
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await convertFirebaseUserToAppUser(firebaseUser);
      callback(user);
    } else {
      callback(null);
    }
  });
};
