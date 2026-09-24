import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import { AdminAccountMenu } from './AdminAccountMenu';
import { ThemeSwitcher } from './ThemeSwitcher';

const { Header } = Layout;

interface AdminHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminHeader({ collapsed, onToggle }: AdminHeaderProps) {
  return (
    <Header className="admin-header">
      <Button
        type="text"
        className="sidebar-trigger"
        aria-label={collapsed ? 'Sidebarni ochish' : 'Sidebarni yopish'}
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />

      <div className="header-actions">
        <ThemeSwitcher />
        <AdminAccountMenu />
      </div>
    </Header>
  );
}
