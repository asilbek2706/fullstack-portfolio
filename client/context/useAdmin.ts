import { useContext } from 'react';
import { AdminContext } from './AdminContext';

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin hooki AdminProvider ichida ishlatilishi shart!');
  }
  return context;
};
