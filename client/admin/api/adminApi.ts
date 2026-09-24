import { http } from '../../shared/api/http';
import type {
  AdminDeleteResponse,
  AdminListResponse,
  AdminUpdateResponse,
  InviteAdminValues,
  ManagedAdmin,
  UpdateAdminValues,
} from '../types/adminManagement.types';

interface GetAdminsOptions {
  page?: number;
  limit?: number;
}

const normalizeUsername = (username: string) => username.trim();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const adminApi = {
  async getAll({
    page = 1,
    limit = 12,
  }: GetAdminsOptions = {}): Promise<AdminListResponse> {
    const response = await http.get<AdminListResponse>('/auth/admins', {
      params: {
        page,
        limit,
      },
    });

    return response.data;
  },

  async invite(values: InviteAdminValues): Promise<void> {
    await http.post('/auth/invite', {
      username: normalizeUsername(values.username),
      email: normalizeEmail(values.email),
      password: values.password,
    });
  },

  async update(id: string, values: UpdateAdminValues): Promise<ManagedAdmin> {
    const response = await http.put<AdminUpdateResponse>(`/auth/update/${id}`, {
      username: normalizeUsername(values.username),
      email: normalizeEmail(values.email),
      role: values.role,
    });

    return response.data.data;
  },

  async remove(id: string): Promise<AdminDeleteResponse> {
    const response = await http.delete<AdminDeleteResponse>(
      `/auth/admins/${id}`,
    );

    return response.data;
  },
};
