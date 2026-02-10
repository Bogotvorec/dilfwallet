import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient, setTokens, clearTokens, getAccessToken } from './api';
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

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push('/');
  }, [router]);

  useEffect(() => {
    // Load user if we have a token
    const token = getAccessToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }

    // Listen for forced logout (from token refresh failure)
    const handleForcedLogout = () => {
      setUser(null);
      setLoading(false);
      router.push('/login');
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiClient.login(email, password);
      // Store both access and refresh tokens
      setTokens(data.access_token, data.refresh_token);
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
      await apiClient.register(email, password);
      // После регистрации автоматически логинимся
      await login(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Ошибка регистрации';
      throw new Error(errorMessage);
    }
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
