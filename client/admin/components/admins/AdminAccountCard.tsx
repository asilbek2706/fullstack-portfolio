import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Tag, Tooltip } from 'antd';
import type { ManagedAdmin } from '../../types/adminManagement.types';

interface AdminAccountCardProps {
  admin: ManagedAdmin;
  onEdit: (admin: ManagedAdmin) => void;
  onDelete: (admin: ManagedAdmin) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));

export function AdminAccountCard({
  admin,
  onEdit,
  onDelete,
}: AdminAccountCardProps) {
  const superadmin = admin.role === 'superadmin';
  const initial = admin.username.charAt(0).toLocaleUpperCase();

  return (
    <Card
      bordered={false}
      className={[
        'admin-account-card',
        superadmin ? 'admin-account-card--super' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="admin-card-heading">
        <div className="admin-card-avatar" aria-hidden="true">
          {initial}
        </div>

        <div className="admin-card-identity">
          <strong>{admin.username}</strong>

          <span>
            <MailOutlined />
            {admin.email}
          </span>
        </div>

        <Tag
          icon={superadmin ? <SafetyCertificateOutlined /> : <UserOutlined />}
          color={superadmin ? 'gold' : 'blue'}
        >
          {superadmin ? 'Superadmin' : 'Admin'}
        </Tag>
      </div>

      <div className="admin-card-meta">
        <span>
          <CalendarOutlined />
          Yaratilgan: {formatDate(admin.createdAt)}
        </span>

        <span>
          <EditOutlined />
          Yangilangan: {formatDate(admin.updatedAt)}
        </span>
      </div>

      <div className="admin-card-actions">
        <Button icon={<EditOutlined />} onClick={() => onEdit(admin)}>
          Tahrirlash
        </Button>

        <Tooltip
          title={
            superadmin
              ? 'Superadmin hisobini o‘chirish mumkin emas'
              : 'Adminni o‘chirish'
          }
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            disabled={superadmin}
            onClick={() => onDelete(admin)}
          >
            O‘chirish
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
