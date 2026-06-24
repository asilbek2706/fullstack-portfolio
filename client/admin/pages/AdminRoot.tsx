import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '@admin/components/Sidebar/Sidebar';
import Header from '@admin/components/Header/Header';
import type { AdminUser } from '@admin/interfaces/admin.interface';
import api from '../../api/axios';
import Loading from '../../Loading/Loading';
import { useAdmin } from '../../context/useAdmin';

const AdminRoot = () => {
  const { setAdmin } = useAdmin(); // Contextdan setter ni olamiz
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data } = await api.get<AdminUser>('/auth/me');
        setAdmin(data);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };
    fetchAdmin();
  }, [setAdmin]);

  if (isAuthenticated === null) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        toggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main
        className="admin-main app-container"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        <Header sidebarOpen={isSidebarOpen} />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default AdminRoot;
