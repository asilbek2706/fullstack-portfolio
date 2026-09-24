import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import type { AdminRole } from '../types/auth';

interface RoleRouteProps extends PropsWithChildren {
  roles?: AdminRole[];
}

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { admin } = useAuth();

  if (roles && (!admin || !roles.includes(admin.role))) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
