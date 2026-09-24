import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../auth/useAuth';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="route-loader">
        <Spin size="large" />
        <span>Sessiya tekshirilmoqda...</span>
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
