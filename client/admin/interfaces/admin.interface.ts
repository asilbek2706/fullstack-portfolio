export interface AdminUser {
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
}

// Agar API dan keladigan xatolikni ham tip qilsak, yanada chiroyli bo'ladi
export interface ApiError {
  message: string;
}