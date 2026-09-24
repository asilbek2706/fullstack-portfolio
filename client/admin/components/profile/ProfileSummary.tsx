import {
  CrownOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Tag } from 'antd';
import type { Admin } from '../../types/auth';

interface ProfileSummaryProps {
  admin: Admin;
}

export function ProfileSummary({ admin }: ProfileSummaryProps) {
  const initial = admin.username.trim().charAt(0).toLocaleUpperCase();
  const superadmin = admin.role === 'superadmin';

  return (
    <Card bordered={false} className="profile-summary-card">
      <div className="profile-summary-cover">
        <span className="profile-cover-shape profile-cover-shape--one" />
        <span className="profile-cover-shape profile-cover-shape--two" />
      </div>

      <div className="profile-summary-content">
        <div className="profile-avatar" aria-hidden="true">
          {initial}
        </div>

        <div className="profile-summary-heading">
          <div>
            <h2>{admin.username}</h2>

            <span>
              <MailOutlined />
              {admin.email}
            </span>
          </div>

          <Tag
            icon={
              superadmin ? <CrownOutlined /> : <SafetyCertificateOutlined />
            }
            color={superadmin ? 'gold' : 'blue'}
          >
            {superadmin ? 'Superadmin' : 'Admin'}
          </Tag>
        </div>

        <div className="profile-permissions">
          <div>
            <UserOutlined />
            <span>Hisob turi</span>
            <strong>
              {superadmin ? 'To‘liq boshqaruv' : 'Oddiy boshqaruv'}
            </strong>
          </div>

          <div>
            <SafetyCertificateOutlined />
            <span>Autentifikatsiya</span>
            <strong>HttpOnly cookie</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}
