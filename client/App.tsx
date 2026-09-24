import { ConfigProvider, theme as antdTheme } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './admin/auth/AuthProvider';
import { AdminLayout } from './admin/layouts/AdminLayout';
import { DashboardPage } from './admin/pages/dashboard/DashboardPage';
import { LoginPage } from './admin/pages/login/LoginPage';
import { PlaceholderPage } from './admin/pages/PlaceholderPage';
import { GuestRoute } from './admin/routes/GuestRoute';
import { ProtectedRoute } from './admin/routes/ProtectedRoute';
import { ThemeProvider } from './admin/theme/ThemeProvider';
import { useTheme } from './admin/theme/useTheme';
import { HomePage } from './src/pages/HomePage';

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
          colorPrimary: isDark ? '#79aec8' : '#417690',
          colorInfo: isDark ? '#79aec8' : '#417690',
          colorSuccess: isDark ? '#81c784' : '#2e7d32',
          colorWarning: isDark ? '#ffb74d' : '#ba7517',
          colorError: isDark ? '#ef7373' : '#ba2121',
          colorBgBase: isDark ? '#121212' : '#f8f8f8',
          colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
          colorBgElevated: isDark ? '#252525' : '#ffffff',
          colorBorder: isDark ? '#353535' : '#dddddd',
          colorBorderSecondary: isDark ? '#303030' : '#e8e8e8',
          colorText: isDark ? '#eeeeee' : '#333333',
          colorTextSecondary: isDark ? '#a8a8a8' : '#666666',
          borderRadius: 4,
          fontFamily: 'Arial, Helvetica, sans-serif',
        },
        components: {
          Layout: {
            bodyBg: isDark ? '#121212' : '#f8f8f8',
            headerBg: isDark ? '#1f3c48' : '#417690',
            siderBg: isDark ? '#181818' : '#ffffff',
          },
          Card: {
            colorBgContainer: isDark ? '#1e1e1e' : '#ffffff',
          },
          Table: {
            headerBg: isDark ? '#252525' : '#f6f6f6',
            rowHoverBg: isDark ? '#252525' : '#f5f5f5',
          },
        },
      }}
    >
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route element={<GuestRoute />}>
            <Route path="/admin" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />

              <Route
                path="/admin/about"
                element={
                  <PlaceholderPage
                    title="About"
                    description="Portfolio egasi haqidagi ma’lumotlar."
                  />
                }
              />

              <Route
                path="/admin/projects"
                element={
                  <PlaceholderPage
                    title="Loyihalar"
                    description="Portfolio loyihalarini boshqarish."
                  />
                }
              />

              <Route
                path="/admin/contacts"
                element={
                  <PlaceholderPage
                    title="Murojaatlar"
                    description="Foydalanuvchilardan kelgan murojaatlar."
                  />
                }
              />

              <Route
                path="/admin/faq"
                element={
                  <PlaceholderPage
                    title="FAQ"
                    description="Savol va javoblarni boshqarish."
                  />
                }
              />

              <Route
                path="/admin/admins"
                element={
                  <PlaceholderPage
                    title="Administratorlar"
                    description="Admin hisoblarini boshqarish."
                  />
                }
              />

              <Route
                path="/admin/profile"
                element={
                  <PlaceholderPage
                    title="Profil"
                    description="Shaxsiy admin profilini yangilash."
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Application />
      </ThemeProvider>
    </BrowserRouter>
  );
}
