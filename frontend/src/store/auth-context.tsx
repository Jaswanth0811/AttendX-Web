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
  admin_personal: { email: 'Jaswanthganta2005@outlook.com', password: 'Gsiri2310#', role: 'admin' },
  faculty: { email: 'dr.kumar@attendx.edu', password: 'faculty123', role: 'faculty' },
  student: { email: 'rahul.me3a@attendx.edu', password: 'student123', role: 'student' },
};

const DB_USER_MAP: Record<string, { userId: string; profileId?: string }> = {
  'admin@attendx.edu': { userId: '89bbc404-fa9e-4c59-8b7c-137b4d2fa8fd' },
  'jaswanthganta2005@outlook.com': { userId: '89bbc404-fa9e-4c59-8b7c-137b4d2fa8fd' },
  'dr.kumar@attendx.edu': { userId: '10000000-0000-0000-0000-000000000002', profileId: '20000000-0000-0000-0000-000000000002' },
  'prof.sharma@attendx.edu': { userId: '10000000-0000-0000-0000-000000000003', profileId: '20000000-0000-0000-0000-000000000003' },
  'dr.patel@attendx.edu': { userId: '10000000-0000-0000-0000-000000000004', profileId: '20000000-0000-0000-0000-000000000004' },
  'prof.singh@attendx.edu': { userId: '10000000-0000-0000-0000-000000000005', profileId: '20000000-0000-0000-0000-000000000005' },
  'rahul.me3a@attendx.edu': { userId: '10000000-0000-0000-0000-000000000006', profileId: '30000000-0000-0000-0000-000000000006' },
  'ananya.cse3a@attendx.edu': { userId: '10000000-0000-0000-0000-000000000007', profileId: '30000000-0000-0000-0000-000000000007' },
  'vikram.me3a@attendx.edu': { userId: '10000000-0000-0000-0000-000000000008', profileId: '30000000-0000-0000-0000-000000000008' },
  'sneha.cse3b@attendx.edu': { userId: '10000000-0000-0000-0000-000000000009', profileId: '30000000-0000-0000-0000-000000000009' },
  'arjun.ece3a@attendx.edu': { userId: '10000000-0000-0000-0000-000000000010', profileId: '30000000-0000-0000-0000-000000000010' }
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
    const user = mockUsers.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.role === role);

    // Check against mock credentials or accept any password in dev
    const validCred = Object.values(MOCK_CREDENTIALS).find(
      c => c.email.toLowerCase().trim() === email.toLowerCase().trim() && c.role === role
    );

    if (!user || (validCred && validCred.password !== password)) {
      return false;
    }

    const dbMapping = DB_USER_MAP[email.toLowerCase().trim()];
    const mappedUser = {
      ...user,
      id: dbMapping ? dbMapping.userId : user.id,
      profileId: dbMapping ? dbMapping.profileId : undefined
    };

    const mockToken = `mock_access_token:${mappedUser.id}:${mappedUser.email}:${mappedUser.role}:${mappedUser.profileId || ''}`;

    const tokens: AuthTokens = {
      accessToken: mockToken,
      refreshToken: `mock_refresh_${Date.now()}_${role}`,
    };

    const authData = { user: mappedUser, tokens };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

    setState({
      user: mappedUser,
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
