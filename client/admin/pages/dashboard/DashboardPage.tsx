import {
  IdcardOutlined,
  InboxOutlined,
  ReadOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Tag, Typography } from 'antd';
import { useAuth } from '../../auth/useAuth';

const modules = [
  {
    title: 'Loyihalar',
    description: 'Portfolio loyihalarini boshqarish',
    icon: <RocketOutlined />,
    color: '#79aec8',
  },
  {
    title: 'Murojaatlar',
    description: 'Kelgan xabarlar va javoblar',
    icon: <InboxOutlined />,
    color: '#44b78b',
  },
  {
    title: 'About',
    description: 'Portfolio egasi ma’lumotlari',
    icon: <IdcardOutlined />,
    color: '#b98cd9',
  },
  {
    title: 'FAQ',
    description: 'Savol va javoblarni boshqarish',
    icon: <ReadOutlined />,
    color: '#e9b96e',
  },
];

export function DashboardPage() {
  const { admin } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>
            Xush kelibsiz, {admin?.username}
          </Typography.Title>

          <Typography.Text type="secondary">
            Portfolio boshqaruv panelining umumiy ko‘rinishi.
          </Typography.Text>
        </div>

        <Tag color={admin?.role === 'superadmin' ? 'gold' : 'blue'}>
          {admin?.role === 'superadmin' ? 'Superadmin' : 'Admin'}
        </Tag>
      </div>

      <Row gutter={[20, 20]}>
        {modules.map((module) => (
          <Col xs={24} sm={12} xl={6} key={module.title}>
            <Card className="module-card" bordered={false}>
              <div
                className="module-icon"
                style={{
                  color: module.color,
                  backgroundColor: `${module.color}18`,
                }}
              >
                {module.icon}
              </div>

              <Typography.Title level={4}>{module.title}</Typography.Title>

              <Typography.Text type="secondary">
                {module.description}
              </Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="welcome-card" bordered={false}>
        <Typography.Title level={3}>Boshqaruv markazi</Typography.Title>

        <Typography.Paragraph>
          Barcha public kontent shu panel orqali boshqariladi.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
