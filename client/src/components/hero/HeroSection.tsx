import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi';
import type { About } from '../../types/portfolio';

export function HeroSection({ about }: { about: About | null }) {
  const reduced = useReducedMotion();
  return (
    <section className="pf-banner" aria-labelledby="hero-title" id="home">
      <h1 id="hero-title" className="pf-sr-only">
        {about?.fullName || 'Portfolio'} — Full-stack developer
      </h1>
      <motion.div
        className="pf-banner-art"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/hero-mobile.jpg" />
          <img
            src="/images/hero-desktop.jpg"
            width="1536"
            height="864"
            alt="Full-stack developer portreti, ko‘k raqamli zarralar va dasturlash elementlari"
            fetchPriority="high"
          />
        </picture>
        <div className="pf-banner-glow" aria-hidden="true" />
      </motion.div>
      <div className="pf-hero-dock">
        <div>
          <span className="pf-eyebrow">G‘OYADAN ISHLAYDIGAN MAHSULOTGACHA</span>
          <p>
            {about?.fullName || 'Shaxsiy portfolio'}
            <span> / {about?.title || 'Full-stack developer'}</span>
          </p>
        </div>
        <div className="pf-dock-actions">
          <Link className="pf-button pf-button--primary" to="/projects">
            Loyihalarni ko‘rish <FiArrowUpRight />
          </Link>
          <Link className="pf-button" to="/contact">
            Bog‘lanish <FiArrowUpRight />
          </Link>
        </div>
      </div>
      <a className="pf-scroll-cue" href="#faq">
        Tanishishda davom eting <FiArrowDown />
      </a>
    </section>
  );
}
