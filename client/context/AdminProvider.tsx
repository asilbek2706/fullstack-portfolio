import { useState, type ReactNode } from 'react';
import { AdminContext } from './AdminContext';
import type { AdminUser } from '../admin/interfaces/admin.interface';

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  return (
    <AdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};
