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
  }, [pathname, hash]);
  return (
    <MotionConfig reducedMotion="user">
      <div className="sp-site" data-theme={resolved}>
        <a className="sp-skip" href="#main">
          Kontentga o‘tish
        </a>
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
