import type { AdminRole } from './auth';

export interface ManagedAdmin {
  _id: string;
  username: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminListResponse {
  success: boolean;
  message: string;
  count: number;
  pagination: AdminPagination;
  data: ManagedAdmin[];
}

export interface InviteAdminValues {
  username: string;
  email: string;
  password: string;
}

export interface UpdateAdminValues {
  username: string;
  email: string;
  role: AdminRole;
}

export interface AdminUpdateResponse {
  message: string;
  data: ManagedAdmin;
}

export interface AdminDeleteResponse {
  message: string;
}
