import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { authApi } from '../api/authApi';
import type { Admin, LoginCredentials } from '../types/auth';
import { AuthContext, type AuthStatus } from './AuthContext';

export function AuthProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refreshAdmin = useCallback(async () => {
    try {
      const currentAdmin = await authApi.me();
      setAdmin(currentAdmin);
      setStatus('authenticated');
    } catch {
      setAdmin(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void authApi
      .me()
      .then((currentAdmin) => {
        if (cancelled) return;

        setAdmin(currentAdmin);
        setStatus('authenticated');
      })
      .catch(() => {
        if (cancelled) return;

        setAdmin(null);
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await authApi.login(credentials);

    setAdmin({
      username: result.user.username,
      email: result.user.email,
      role: result.role,
    });

    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
      setStatus('anonymous');
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      status,
      login,
      logout,
      refreshAdmin,
    }),
    [admin, status, login, logout, refreshAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
