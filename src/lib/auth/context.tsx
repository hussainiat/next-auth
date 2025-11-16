'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthState, User, LoginCredentials, RegisterData } from './types';
import { authAPI } from './api';
import { isTokenMode } from '@/lib/config';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    accessToken: null,
  });

  // Token refresh interval
  useEffect(() => {
    if (!isTokenMode || !state.isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        await logout();
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  const checkAuth = useCallback(async () => {
    try {
      const { user } = await authAPI.getCurrentUser();
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
      }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      setState(prev => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        accessToken: response.accessToken || null,
      }));
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      await authAPI.register(data);
      // After successful registration, auto-login
      await login({ email: data.email, password: data.password });
    } catch (error) {
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        accessToken: null,
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const refreshAccessToken = useCallback(async () => {
    if (!isTokenMode) return;
    
    try {
      const { accessToken } = await authAPI.refreshToken();
      setState(prev => ({
        ...prev,
        accessToken,
      }));
    } catch (error) {
      throw error;
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAccessToken,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}