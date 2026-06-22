import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import './Header.scss';
import { useAdmin } from '../../../context/AdminContext';
import api from '../../../api/axios';
import Loading from '../../../Loading/Loading';

const Header = () => {
  const { admin } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Asosiy Logout logikasi
  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
      toast.success('Tizimdan muvaffaqiyatli chiqdingiz!');
      navigate('/admin', { replace: true });
    } catch (error) {
      console.error('Logout xatosi:', error);
      toast.error('Tizimdan chiqishda xatolik yuz berdi.');
      setIsLoggingOut(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Ishonchingiz komilmi?',
      text: 'Siz tizimdan chiqasiz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ha, chiqaman!',
      cancelButtonText: 'Bekor qilish',
      background: '#171b1f',
      color: '#fff',
      zIndex: 9999,
    });

    if (result.isConfirmed) {
      performLogout();
    }
  };

  if (!admin) return null;

  if (isLoggingOut) return <Loading />;

  return (
    <header className="header">
      <div className="header-brand">Admin Panel</div>

      <div className="profile-wrapper" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar">{admin.username[0].toUpperCase()}</div>

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
  );
};

export default Header;
