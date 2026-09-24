import { createContext } from 'react';
import type { Admin, LoginCredentials } from '../types/auth';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  admin: Admin | null;
  status: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
