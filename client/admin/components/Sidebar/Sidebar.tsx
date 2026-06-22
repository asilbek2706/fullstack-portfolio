import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.scss';

interface NavLink {
  name: string;
  id: string;
}

const navLinks: NavLink[] = [
  { name: 'Dashboard', id: 'dashboard' },
  { name: 'About', id: 'about' },
  { name: 'Projects', id: 'projects' },
  { name: 'Contact', id: 'contact' },
  { name: 'Settings', id: 'settings' },
];

const Sidebar = () => {
  const [active, setActive] = useState('dashboard');

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          🛡️ Admin Panel
        </Link>
      </div>
      <div className="sidebar-wrapper">
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={`/${link.id}`}
              className={active === link.id ? 'active' : ''}
              onClick={() => setActive(link.id)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
