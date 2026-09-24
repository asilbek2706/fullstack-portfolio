import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Typography, type MenuProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aboutApi } from '../../api/aboutApi';
import { useAuth } from '../../auth/useAuth';

export function AdminAccountMenu() {
  const [avatar, setAvatar] = useState<string>();
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void aboutApi
      .get()
      .then((about) => {
        if (!cancelled && about.avatar) {
          setAvatar(about.avatar);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

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
        navigate('/admin', { replace: true });
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
        <Avatar
          size={38}
          src={avatar}
          icon={!avatar ? <UserOutlined /> : undefined}
        />

        <div>
          <Typography.Text strong>{admin?.username}</Typography.Text>

          <Typography.Text type="secondary">{admin?.email}</Typography.Text>
        </div>
      </button>
    </Dropdown>
  );
}
