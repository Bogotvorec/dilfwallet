import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Проверяем, есть ли токен при загрузке
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.login(email, password);
      localStorage.setItem('token', data.access_token);
      await loadUser();
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Ошибка входа';
      throw new Error(errorMessage);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      console.log('Attempting registration with:', { email, apiUrl: 'http://localhost:8000' });
      await apiClient.register(email, password);
      console.log('Registration successful, logging in...');
      // После регистрации автоматически логинимся
      await login(email, password);
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        fullError: error
      });
      const errorMessage = error.response?.data?.detail || error.message || 'Ошибка регистрации';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
