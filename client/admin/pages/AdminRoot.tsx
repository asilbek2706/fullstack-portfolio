import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '@admin/components/Sidebar/Sidebar';
import Header from '@admin/components/Header/Header';
import { AdminProvider } from '../../context/AdminContext';
import type { AdminUser } from '@admin/interfaces/admin.interface';
import api from '../../api/axios';
import Loading from '../../Loading/Loading';

const AdminRoot = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get<AdminUser>('/auth/me');
        setAdmin(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        throw new Error("Admin ma'lumotlarini olishda xatolik yuz berdi", {
          cause: error,
        });
      }
    };
    fetchAdmin();
  }, []);

  if (isAuthenticated === null) return <Loading />;

  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  return (
    <AdminProvider admin={admin}>
      <div className="admin-layout" style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1 }}>
          <Header />
          <Outlet />
        </main>
      </div>
    </AdminProvider>
  );
};
export default AdminRoot;
