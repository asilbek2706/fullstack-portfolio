import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import type { SweetAlertResult } from 'sweetalert2';

import api from '../../../api/axios';
import Loading from '../../../Loading/Loading';

import './Header.scss';
import 'sweetalert2/src/sweetalert2.scss';
import { useAdmin } from '../../../context/useAdmin';

interface HeaderProps {
  sidebarOpen: boolean;
}

const Header = ({ sidebarOpen }: HeaderProps) => {
  const { admin } = useAdmin();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  const performLogout = async () => {
    setIsLoggingOut(true);

    try {
      await api.post('/auth/logout');

      toast.success('Tizimdan muvaffaqiyatli chiqdingiz!');

      navigate('/admin', {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      toast.error('Chiqishda xatolik yuz berdi.');

      setIsLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    const result: SweetAlertResult<void> = await Swal.fire({
      title: 'Ishonchingiz komilmi?',
      text: 'Siz tizimdan chiqasiz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Ha, chiqaman!',
      cancelButtonText: 'Bekor qilish',
      background: '#171b1f',
      color: '#ffffff',
    });

    if (result.isConfirmed) {
      await performLogout();
    }
  };

  if (!admin) return null;

  if (isLoggingOut) {
    return <Loading />;
  }

  return (
    <div
      className={`header-container ${
        sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
      }`}
    >
      <header className="header">
        <div className="header-brand">Admin Panel</div>

        <div
          className="profile-wrapper"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div className="avatar">{admin.username.charAt(0).toUpperCase()}</div>

          {isOpen && (
            <div className="dropdown">
              <div className="header-info">
                <h3>{admin.username}</h3>

                <span className="role-tag">{admin.role}</span>

                <p className="email-text">{admin.email}</p>
              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                Chiqish
              </button>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
