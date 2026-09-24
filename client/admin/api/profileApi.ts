import { http } from '../../shared/api/http';
import type {
  ProfileUpdateResponse,
  ProfileUpdateValues,
} from '../types/profile.types';

export const profileApi = {
  async update(values: ProfileUpdateValues): Promise<ProfileUpdateResponse> {
    const payload: ProfileUpdateValues = {
      username: values.username.trim(),
      email: values.email.trim().toLowerCase(),
    };

    if (values.password) {
      payload.password = values.password;
    }

    const response = await http.patch<ProfileUpdateResponse>(
      '/auth/update',
      payload,
    );

    return response.data;
  },
};
