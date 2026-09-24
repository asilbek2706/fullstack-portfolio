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
import { ContactsPage } from '../pages/contacts/ContactsPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { FaqPage } from '../pages/faq/FaqPage';
import { PlaceholderPage } from '../pages/placeholder/PlaceholderPage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
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
    element: <ProjectsPage />,
    showInMenu: true,
  },
  {
    path: '/admin/projects/create',
    label: 'Project yaratish',
    icon: <RocketOutlined />,
    element: <ProjectsPage />,
    showInMenu: false,
  },
  {
    path: '/admin/projects/edit/:projectId',
    label: 'Projectni tahrirlash',
    icon: <RocketOutlined />,
    element: <ProjectsPage />,
    showInMenu: false,
  },
  {
    path: '/admin/contacts',
    label: 'Murojaatlar',
    icon: <InboxOutlined />,
    element: <ContactsPage />,
    showInMenu: true,
  },
  {
    path: '/admin/faq',
    label: 'FAQ',
    icon: <ReadOutlined />,
    element: <FaqPage />,
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
