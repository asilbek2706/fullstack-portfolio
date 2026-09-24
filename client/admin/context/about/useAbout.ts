import { useContext } from 'react';
import { AboutContext } from './AboutContext';

export const useAbout = () => {
  const context = useContext(AboutContext);

  if (!context) {
    throw new Error('useAbout faqat AboutProvider ichida ishlatilishi mumkin.');
  }

  return context;
};
