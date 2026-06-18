'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { User, UserRole, AuthTokens, AuthState } from '@/types';
import { mockUsers, mockFacultyProfiles, mockStudentProfiles } from '@/lib/mock-data';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'attendx_auth';

// Mock credentials for development
const MOCK_CREDENTIALS: Record<string, { email: string; password: string; role: UserRole }> = {
  admin: { email: 'admin@attendx.edu', password: 'admin123', role: 'admin' },
  faculty: { email: 'dr.kumar@attendx.edu', password: 'faculty123', role: 'faculty' },
  student: { email: 'rahul.me3a@attendx.edu', password: 'student123', role: 'student' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          user: parsed.user,
          tokens: parsed.tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find matching user by email and role (mock auth)
    const user = mockUsers.find(u => u.email === email && u.role === role);

    // Check against mock credentials or accept any password in dev
    const validCred = Object.values(MOCK_CREDENTIALS).find(
      c => c.email === email && c.role === role
    );

    if (!user || (validCred && validCred.password !== password)) {
      return false;
    }

    const tokens: AuthTokens = {
      accessToken: `mock_access_${Date.now()}_${role}`,
      refreshToken: `mock_refresh_${Date.now()}_${role}`,
    };

    const authData = { user, tokens };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    setState({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.email === email);
    return !!user;
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, resetPassword }}>
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

// Helper hooks
export function useRequireAuth(requiredRole?: UserRole) {
  const auth = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && pathname.endsWith('/login')) {
      return;
    }
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.href = '/';
    }
    if (!auth.isLoading && auth.isAuthenticated && requiredRole && auth.user?.role !== requiredRole) {
      window.location.href = '/';
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user?.role, requiredRole, pathname]);

  return auth;
}
