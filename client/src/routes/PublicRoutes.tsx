import { lazy, Suspense } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
const HomePage = lazy(() => import('../pages/home/HomePage'));
const AboutPage = lazy(() => import('../pages/about/AboutPage'));
const ProjectsPage = lazy(() => import('../pages/projects/ProjectsPage'));
const ContactPage = lazy(() => import('../pages/contact/ContactPage'));
export default function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<p className="sp-status">Yuklanmoqda…</p>}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="about"
          element={
            <Suspense fallback={<p className="sp-status">Yuklanmoqda…</p>}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route
          path="projects"
          element={
            <Suspense fallback={<p className="sp-status">Yuklanmoqda…</p>}>
              <ProjectsPage />
            </Suspense>
          }
        />
        <Route
          path="contact"
          element={
            <Suspense fallback={<p className="sp-status">Yuklanmoqda…</p>}>
              <ContactPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <section className="sp-section">
              <h1>Sahifa topilmadi</h1>
              <Link to="/">Asosiyga qaytish</Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
