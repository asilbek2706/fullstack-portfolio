import { Link } from 'react-router-dom';
export function PublicFooter({ name }: { name?: string }) {
  return (
    <footer className="pf-footer">
      <div>
        <Link to="/" className="pf-footer-name">
          {name || 'Portfolio'}
          <span> ↗</span>
        </Link>
        <p>Kod orqali g‘oyalarni hayotga olib chiqaman.</p>
      </div>
      <div className="pf-footer-meta">
        <span>
          © {new Date().getFullYear()} · Barcha huquqlar himoyalangan.
        </span>
        <a href="#public-main">Yuqoriga qaytish ↑</a>
      </div>
    </footer>
  );
}
