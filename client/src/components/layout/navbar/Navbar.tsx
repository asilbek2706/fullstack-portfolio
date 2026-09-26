import { NavLink } from 'react-router-dom';
import './Navbar.scss';
import { useState } from 'react';
import { Code2, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import type { ThemeMode } from '../../../theme/usePublicTheme';
const links = [
  { href: '/', label: 'Asosiy' },
  { href: '/about', label: 'Men haqimda' },
  { href: '/projects', label: 'Loyihalar' },
  { href: '/contact', label: 'Bog‘lanish' },
];
export function Navbar({
  mode,
  onTheme,
}: {
  mode: ThemeMode;
  onTheme: (mode: ThemeMode) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sp-nav"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
      }}
    >
      <NavLink to="/" className="sp-brand" aria-label="Asosiy sahifa">
        <Code2 />
        <span>
          Asilbek<span className="sp-accent">.</span>
        </span>
      </NavLink>
      <nav className="sp-desktop-links" aria-label="Asosiy menyu">
        {links.map((link) => (
          <NavLink end key={link.href} to={link.href}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sp-theme" role="group" aria-label="Rang rejimi">
        {(
          [
            { value: 'light', label: 'Light', Icon: Sun },
            { value: 'dark', label: 'Dark', Icon: Moon },
            { value: 'system', label: 'System', Icon: Monitor },
          ] as const
        ).map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={mode === value}
            onClick={() => onTheme(value)}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <button
        className="sp-menu-button"
        type="button"
        aria-label={open ? 'Menyuni yopish' : 'Menyuni ochish'}
        aria-expanded={open}
        aria-controls="sp-mobile-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <nav
          className="sp-mobile-links"
          id="sp-mobile-nav"
          aria-label="Mobil menyu"
        >
          {links.map((link) => (
            <NavLink
              end
              key={link.href}
              to={link.href}
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
