export type AdminRole = 'admin' | 'superadmin';

export interface Admin {
  _id?: string;
  username: string;
  email: string;
  role: AdminRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  role: AdminRole;
  user: {
    username: string;
    email: string;
  };
}
