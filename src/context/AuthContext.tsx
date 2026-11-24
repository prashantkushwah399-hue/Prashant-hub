import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  loginAdmin,
  logoutAdmin,
  subscribeToAuthState,
  verifyAdminAuthorization,
} from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; isAdmin: boolean; error?: string }>;
  logout: () => Promise<void>;
  recheckAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkUserAdmin = useCallback(async (currentUser: User | null): Promise<boolean> => {
    if (!currentUser) {
      setIsAdmin(false);
      setAuthError(null);
      return false;
    }
    const res = await verifyAdminAuthorization(currentUser.uid);
    setIsAdmin(res.isAdmin);
    setAuthError(res.error ?? null);
    return res.isAdmin;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (nextUser) => {
      setUser(nextUser);
      await checkUserAdmin(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [checkUserAdmin]);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const loggedInUser = await loginAdmin(email, password);
      setUser(loggedInUser);
      const adminOk = await checkUserAdmin(loggedInUser);
      return { ok: true, isAdmin: adminOk };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
      return { ok: false, isAdmin: false, error: message };
    }
  };

  const logout = async () => {
    await logoutAdmin();
    setUser(null);
    setIsAdmin(false);
    setAuthError(null);
  };

  const recheckAdmin = async () => {
    return checkUserAdmin(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, authError, login, logout, recheckAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
