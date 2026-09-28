import { Link } from 'react-router-dom';
import './Footer.scss';
import {
  ArrowUp,
  ArrowUpRight,
  Camera as Instagram,
  Code2,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
export function Footer() {
  return (
    <footer className="sp-footer container">
      <div className="sp-footer-grid">
        <div>
          <Link className="sp-brand" to="/">
            <Code2 />
            <span>Asilbek.</span>
          </Link>
          <p className="sp-muted mt-4 max-w-xs">
            G‘oyadan kodgacha.
            <br />
            Koddan foydali mahsulotgacha.
          </p>
          <a
            className="inline-flex items-center gap-2 mt-6"
            href="tel:+998507536636"
          >
            <Phone size={16} />
            +998 50 753 66 36
          </a>
        </div>
        <div>
          <h3>Sahifa</h3>
          <Link to="/">Asosiy</Link>
          <Link to="/about">Men haqimda</Link>
          <Link to="/projects">Loyihalar</Link>
          <Link to="/#faq">Savol-javob</Link>
        </div>
        <div>
          <h3>Aloqa</h3>
          <a
            className="sp-footer-contact-link"
            href="https://t.me/as1l_2706"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram profilini ochish"
          >
            <Send size={15} aria-hidden="true" />
            <span>Telegram</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a
            className="sp-footer-contact-link"
            href="https://www.instagram.com/asilbek_2706/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram profilini ochish"
          >
            <Instagram size={15} aria-hidden="true" />
            <span>Instagram</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <a
            className="sp-footer-contact-link"
            href="mailto:asilbekkaromatov2@gmail.com"
            aria-label="Elektron pochta yuborish"
          >
            <Mail size={15} aria-hidden="true" />
            <span>Elektron pochta</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="sp-footer-bottom">
        <span>© {new Date().getFullYear()} Asilbek Karomatov</span>
        <span>React · TypeScript · Node.js</span>
        <button
          type="button"
          className="sp-top-button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'instant'
                : 'smooth',
            })
          }
        >
          Yuqoriga <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
}
