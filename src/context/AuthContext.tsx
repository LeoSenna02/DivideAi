// Context para autenticação e gerenciamento de usuário com Firebase

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { registerUser, loginUser, logoutUser, onAuthChange } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const userData = await registerUser(name, email, password);
        setUser(userData);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
