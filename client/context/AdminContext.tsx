import { createContext, useContext, ReactNode } from "react";

interface AdminUser {
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
}

interface AdminContextType {
  admin: AdminUser | null;
}

export const AdminContext = createContext<AdminContextType>({ admin: null });

// SHU YERDA HOOKNI EKSIRT QILAMIZ
export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children, admin }: { children: ReactNode, admin: AdminUser | null }) => {
  return (
    <AdminContext.Provider value={{ admin }}>
      {children}
    </AdminContext.Provider>
  );
};