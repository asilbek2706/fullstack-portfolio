import { lazy, Suspense } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AppLoading } from './src/components/AppLoading';

const AdminApplication = lazy(() => import('./AdminApplication'));
const PublicRoutes = lazy(() => import('./src/routes/PublicRoutes'));

function ApplicationRouter() {
  const { pathname } = useLocation();
  return /^\/admin(?:\/|$)/.test(pathname) ? (
    <AdminApplication />
  ) : (
    <PublicRoutes />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<AppLoading />}>
        <ApplicationRouter />
      </Suspense>
    </BrowserRouter>
  );
}
