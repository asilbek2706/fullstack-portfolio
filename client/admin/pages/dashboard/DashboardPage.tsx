import {
  EditOutlined,
  IdcardOutlined,
  InboxOutlined,
  ReadOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Spin, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { AboutPreview } from '../../components/about/AboutPreview';
import { ContactsSummaryCard } from '../../components/dashboard/ContactsSummaryCard';
import { FaqSummaryCard } from '../../components/dashboard/FaqSummaryCard';
import { ProjectsSummaryCard } from '../../components/dashboard/ProjectsSummaryCard';
import { useAbout } from '../../context/about/useAbout';

const modules = [
  {
    title: 'About',
    description: 'Portfolio egasi ma’lumotlari',
    path: '/admin/about',
    icon: <IdcardOutlined />,
    color: '#b98cd9',
    roles: ['superadmin'],
  },
  {
    title: 'Loyihalar',
    description: 'Portfolio loyihalarini boshqarish',
    path: '/admin/projects',
    icon: <RocketOutlined />,
    color: '#79aec8',
  },
  {
    title: 'Murojaatlar',
    description: 'Kelgan xabarlar va javoblar',
    path: '/admin/contacts',
    icon: <InboxOutlined />,
    color: '#44b78b',
  },

  {
    title: 'FAQ',
    description: 'Savol va javoblarni boshqarish',
    path: '/admin/faq',
    icon: <ReadOutlined />,
    color: '#e9b96e',
  },
] as const;

export function DashboardPage() {
  const { admin } = useAuth();
  const { about, status, errorMessage } = useAbout();
  const visibleModules = modules.filter(
    (module) =>
      !('roles' in module) ||
      (module.roles.includes('superadmin') && admin?.role === 'superadmin'),
  );

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
      <Row gutter={[20, 20]} className="dashboard-modules">
        {visibleModules.map((module) => (
          <Col xs={24} sm={12} xl={6} key={module.path}>
            <Link
              to={module.path}
              className="dashboard-module-link"
              aria-label={`${module.title} bo‘limiga o‘tish`}
            >
              <Card hoverable className="module-card" bordered={false}>
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

                <span className="module-card-action">
                  Bo‘limga o‘tish
                  <span aria-hidden="true">→</span>
                </span>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <div className="dashboard-content-grid">
        <Card
          hoverable
          className="dashboard-content-card dashboard-about-card"
          bordered={false}
        >
          <div className="dashboard-section-heading">
            <div>
              <Typography.Title level={4}>Public About</Typography.Title>

              <Typography.Text type="secondary">
                Portfolio profilida ko‘rinadigan ma’lumotlar.
              </Typography.Text>
            </div>

            {admin?.role === 'superadmin' && (
              <Link to="/admin/about">
                <Button size="small" type="primary" icon={<EditOutlined />}>
                  Tahrirlash
                </Button>
              </Link>
            )}
          </div>

          {status === 'loading' && (
            <div className="dashboard-about-loading">
              <Spin />
              <span>Yuklanmoqda...</span>
            </div>
          )}

          {status === 'error' && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                errorMessage || 'About ma’lumotlarini yuklab bo‘lmadi'
              }
            />
          )}

          {status === 'empty' && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="About hali yaratilmagan"
            />
          )}

          {status === 'ready' && about && (
            <div className="dashboard-about-preview">
              <AboutPreview about={about} />
            </div>
          )}
        </Card>

        <ProjectsSummaryCard />
        <ContactsSummaryCard />
        <FaqSummaryCard />
      </div>
    </div>
  );
}
