import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth faqat AuthProvider ichida ishlatilishi mumkin.');
  }

  return context;
};
