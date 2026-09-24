import { Layout } from 'antd';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from '../components/header/AdminHeader';
import { AdminSidebar } from '../components/sidebar/AdminSidebar';
import { AboutProvider } from '../context/about/AboutProvider';

const { Content } = Layout;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AboutProvider>
      <Layout className="admin-shell">
        <AdminSidebar collapsed={collapsed} onBreakpoint={setCollapsed} />

        <Layout>
          <AdminHeader
            collapsed={collapsed}
            onToggle={() => setCollapsed((current) => !current)}
          />

          <Content className="admin-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </AboutProvider>
  );
}
