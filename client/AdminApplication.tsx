import { ConfigProvider, theme as antdTheme } from 'antd';
import './styles/main.scss';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './admin/auth/AuthProvider';
import { AppToaster } from './admin/components/feedback/AppToaster';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { LoginPage } from './admin/pages/login/LoginPage';
import { adminRoutes } from './admin/routes/adminRoutes';
import { GuestRoute } from './admin/routes/GuestRoute';
import { ProtectedRoute } from './admin/routes/ProtectedRoute';
import { ThemeProvider } from './admin/theme/ThemeProvider';
import { useTheme } from './admin/theme/useTheme';

function Application() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#60a5fa' : '#2563eb',
          colorInfo: isDark ? '#60a5fa' : '#2563eb',
          colorSuccess: isDark ? '#81c784' : '#2e7d32',
          colorWarning: isDark ? '#ffb74d' : '#b45309',
          colorError: isDark ? '#ef7373' : '#b91c1c',
          colorBgBase: isDark ? '#0f172a' : '#f4f7fb',
          colorBgContainer: isDark ? '#1e293b' : '#ffffff',
          colorBgElevated: isDark ? '#263449' : '#ffffff',
          colorBorder: isDark ? '#334155' : '#e2e8f0',
          colorBorderSecondary: isDark ? '#334155' : '#e2e8f0',
          colorText: isDark ? '#e2e8f0' : '#172033',
          colorTextSecondary: isDark ? '#94a3b8' : '#64748b',
          borderRadius: 10,
          fontFamily: 'Arial, Helvetica, sans-serif',
        },
        components: {
          Layout: {
            bodyBg: isDark ? '#0f172a' : '#f4f7fb',
            headerBg: isDark ? '#172554' : '#172554',
            siderBg: isDark ? '#111827' : '#ffffff',
          },
          Card: {
            colorBgContainer: isDark ? '#1e293b' : '#ffffff',
          },
          Table: {
            headerBg: isDark ? '#263449' : '#f8fafc',
            rowHoverBg: isDark ? '#263449' : '#f8fafc',
          },
        },
      }}
    >
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/admin" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              {adminRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>

          <Route
            path="/admin/*"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default function AdminApplication() {
  return (
    <ThemeProvider>
      <AppToaster />
      <Application />
    </ThemeProvider>
  );
}
