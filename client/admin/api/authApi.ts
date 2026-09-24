import { http } from '../../shared/api/http';
import type { Admin, LoginCredentials, LoginResponse } from '../types/auth';

export const authApi = {
  async login(credentials: LoginCredentials) {
    const response = await http.post<LoginResponse>('/auth/login', credentials);

    return response.data;
  },

  async me() {
    const response = await http.get<Admin>('/auth/me');
    return response.data;
  },

  async logout() {
    await http.post('/auth/logout');
  },
};
