import { createContext } from 'react';
import type { AdminUser } from '../admin/interfaces/admin.interface';

interface AdminContextType {
  admin: AdminUser | null;
  setAdmin: (admin: AdminUser | null) => void;
}

export const AdminContext = createContext<AdminContextType | undefined>(
  undefined,
);
