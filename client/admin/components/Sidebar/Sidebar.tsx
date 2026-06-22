import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.scss';

interface NavLink {
  name: string;
  id: string;
  icon: string;
}

const navLinks: NavLink[] = [
  { name: 'Dashboard', id: 'dashboard', icon: '📊' },
  { name: 'About', id: 'about', icon: 'ℹ️' },
  { name: 'Projects', id: 'projects', icon: '📁' },
  { name: 'Contact', id: 'contact', icon: '📞' },
  { name: 'Settings', id: 'settings', icon: '⚙️' },
];

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar = ({ isOpen, toggle }: SidebarProps) => {
  const [active, setActive] = useState('dashboard');

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggle}>
        {isOpen ? '◀' : '▶'}
      </button>

      <div className="sidebar-header">
        <Link to="/auth/dashboard" className="sidebar-logo">
          {isOpen ? '🛡️ Admin Panel' : '🛡️'}
        </Link>
      </div>

      <div className="sidebar-wrapper">
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={`/auth/${link.id}`}
              className={active === link.id ? 'active' : ''}
              onClick={() => setActive(link.id)}
            >
              <span className="icon">{link.icon}</span>

              {isOpen && <span className="label">{link.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
