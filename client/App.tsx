import { lazy, Suspense } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

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
      <Suspense fallback={<div role="status">Yuklanmoqda…</div>}>
        <ApplicationRouter />
      </Suspense>
    </BrowserRouter>
  );
}
