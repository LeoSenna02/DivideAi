// Página de Login com autenticação completa

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      // Redirecionar para a página inicial que vai buscar os lares do usuário
      navigate('/');
    } catch (err) {
      setError(isLogin ? 'Email ou senha inválidos' : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900">
      <div className="card max-w-md w-full mx-4 bg-neutral-white dark:bg-secondary-800 dark:border-secondary-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">DivideAí</h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="label">Nome</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="label dark:text-secondary-200">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label dark:text-secondary-200">Senha</label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <div className="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 text-danger-700 dark:text-danger-200 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
}