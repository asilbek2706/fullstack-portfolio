import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { usePublicTheme } from '../../theme/usePublicTheme';
import { Background } from '../background/Background';
import { Navbar } from './navbar/Navbar';
import { Footer } from './footer/Footer';
import '../../styles/public.css';
export function PublicLayout() {
  const { mode, setMode, resolved } = usePublicTheme();
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
    const descriptions: Record<string, string> = {
      '/': 'Asilbek Karomatov — Full-stack developer portfoliysi.',
      '/about': 'Asilbek Karomatov haqida va uning texnologiyalari.',
      '/projects': 'Asilbek Karomatov yaratgan loyihalar.',
      '/contact': 'Asilbek Karomatov bilan bog‘lanish.',
    };
    const description = descriptions[pathname] ?? descriptions['/'];
    let tag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [pathname, hash]);
  return (
    <MotionConfig reducedMotion="user">
      <div className="sp-site" data-theme={resolved}>
        <Background />
        <Navbar mode={mode} onTheme={setMode} />
        <main id="main" className="sp-main">
          <Outlet />
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{ duration: 4000, className: 'sp-toast' }}
        />
      </div>
    </MotionConfig>
  );
}
