import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiCode, FiMenu, FiX } from 'react-icons/fi';
const links = [
  { to: '/', label: 'Asosiy' },
  { to: '/about', label: 'Men haqimda' },
  { to: '/projects', label: 'Loyihalar' },
  { to: '/contact', label: 'Bog‘lanish' },
];
export function PublicHeader({ name }: { name?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="pf-header">
      <NavLink to="/" className="pf-brand" onClick={() => setOpen(false)}>
        <span className="pf-brand-mark">
          <FiCode />
        </span>
        <span>
          {name?.split(' ')[0] || 'Portfolio'}
          <small>DEVELOPER PORTFOLIO</small>
        </span>
      </NavLink>
      <nav className="pf-desktop-nav" aria-label="Asosiy menyu">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        className="pf-menu-toggle"
        aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
        aria-expanded={open}
        aria-controls="public-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <FiX /> : <FiMenu />}
      </button>
      {open && (
        <nav
          id="public-menu"
          className="pf-mobile-nav"
          aria-label="Mobil menyu"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
