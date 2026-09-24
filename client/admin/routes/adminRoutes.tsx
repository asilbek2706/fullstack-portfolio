import {
  AppstoreOutlined,
  IdcardOutlined,
  InboxOutlined,
  ReadOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import { AboutPage } from '../pages/about/AboutPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PlaceholderPage } from '../pages/placeholder/PlaceholderPage';
import type { AdminRole } from '../types/auth';

export interface AdminRouteDefinition {
  path: string;
  label: string;
  icon: ReactNode;
  element: ReactNode;
  roles?: AdminRole[];
  showInMenu?: boolean;
}

export const adminRoutes: AdminRouteDefinition[] = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: <AppstoreOutlined />,
    element: <DashboardPage />,
    showInMenu: true,
  },
  {
    path: '/admin/about',
    label: 'About',
    icon: <IdcardOutlined />,
    element: <AboutPage />,
    roles: ['superadmin'],
    showInMenu: true,
  },
  {
    path: '/admin/projects',
    label: 'Loyihalar',
    icon: <RocketOutlined />,
    element: (
      <PlaceholderPage
        title="Loyihalar"
        description="Portfolio loyihalarini boshqarish."
      />
    ),
    showInMenu: true,
  },
  {
    path: '/admin/contacts',
    label: 'Murojaatlar',
    icon: <InboxOutlined />,
    element: (
      <PlaceholderPage
        title="Murojaatlar"
        description="Foydalanuvchilardan kelgan murojaatlar."
      />
    ),
    showInMenu: true,
  },
  {
    path: '/admin/faq',
    label: 'FAQ',
    icon: <ReadOutlined />,
    element: (
      <PlaceholderPage
        title="FAQ"
        description="Savol va javoblarni boshqarish."
      />
    ),
    showInMenu: true,
  },
  {
    path: '/admin/admins',
    label: 'Administratorlar',
    icon: <SafetyCertificateOutlined />,
    element: (
      <PlaceholderPage
        title="Administratorlar"
        description="Admin hisoblarini boshqarish."
      />
    ),
    roles: ['superadmin'],
    showInMenu: true,
  },
  {
    path: '/admin/profile',
    label: 'Profil',
    icon: <UserSwitchOutlined />,
    element: (
      <PlaceholderPage
        title="Profil"
        description="Shaxsiy admin profilini yangilash."
      />
    ),
    showInMenu: true,
  },
];

export const getMenuRoutes = (role?: AdminRole): AdminRouteDefinition[] =>
  adminRoutes.filter((route) => {
    if (!route.showInMenu) return false;
    if (!route.roles) return true;

    return role !== undefined && route.roles.includes(role);
  });
