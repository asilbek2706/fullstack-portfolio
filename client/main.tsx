import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';
import './styles/main.scss';
import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root elementi topilmadi.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
