import type { Admin } from './auth';

export interface ProfileUpdateValues {
  username: string;
  email: string;
  password?: string;
}

export interface ProfileUpdateResponse {
  message: string;
  data: Admin;
}
