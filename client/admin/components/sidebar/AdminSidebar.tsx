import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { getMenuRoutes } from '../../routes/adminRoutes';
import { useTheme } from '../../theme/useTheme';
import { BrandLogo } from '../brand/BrandLogo';

const { Sider } = Layout;

interface AdminSidebarProps {
  collapsed: boolean;
  onBreakpoint: (broken: boolean) => void;
}

export function AdminSidebar({ collapsed, onBreakpoint }: AdminSidebarProps) {
  const { admin } = useAuth();
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const items = getMenuRoutes(admin?.role).map((route) => ({
    key: route.path,
    icon: route.icon,
    label: route.label,
  }));

  return (
    <Sider
      width={250}
      collapsedWidth={72}
      collapsed={collapsed}
      className="admin-sidebar"
      breakpoint="lg"
      onBreakpoint={onBreakpoint}
    >
      <div className="admin-logo">
        <BrandLogo size={34} />

        {!collapsed && (
          <div className="admin-logo-text">
            <strong>Portfolio administration</strong>
            <span>Site boshqaruvi</span>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
}
