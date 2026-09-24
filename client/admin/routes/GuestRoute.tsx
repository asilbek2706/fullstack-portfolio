import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../auth/useAuth';

export function GuestRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="route-loader">
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}
