import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Typography, type MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function AdminAccountMenu() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const usernameInitial =
    admin?.username?.trim().charAt(0).toUpperCase() || '?';

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/admin/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      danger: true,
      onClick: async () => {
        await logout();
        navigate('/admin', {
          replace: true,
        });
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <button
        className="admin-account"
        type="button"
        aria-label="Admin menyusini ochish"
      >
        <Avatar size={38} className="admin-account-initial">
          {usernameInitial}
        </Avatar>

        <div>
          <Typography.Text strong>{admin?.username}</Typography.Text>

          <Typography.Text type="secondary">{admin?.email}</Typography.Text>
        </div>
      </button>
    </Dropdown>
  );
}
