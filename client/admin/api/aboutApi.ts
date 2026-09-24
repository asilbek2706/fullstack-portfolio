import { http } from '../../shared/api/http';
import type { AboutResponse } from '../types/about';

export const aboutApi = {
  async get() {
    const response = await http.get<AboutResponse>('/about');
    return response.data.data;
  },
};
