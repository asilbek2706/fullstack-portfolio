import { Link } from 'react-router-dom';
import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';
import { portfolioApi } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { Reveal } from './Reveal';
import { Status } from './Status';
export function Faq() {
  const { data, loading, error, reload } = useResource(portfolioApi.faq);
  const [open, setOpen] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const id = useId();
  useEffect(() => {
    if (window.location.hash === '#faq')
      document.getElementById('faq')?.scrollIntoView();
  }, []);
  return (
    <section className="sp-section" id="faq">
      <Reveal className="sp-faq-grid">
        <div>
          <p className="sp-eyebrow">03 / SAVOL VA JAVOB</p>
          <h2>
            Qiziqishdan
            <br />
            <span>boshlanadi.</span>
          </h2>
          <p className="sp-muted mt-5">
            Ish jarayoni va hamkorlik haqida.
            <br />
            Boshqa savol bormi?{' '}
            <Link className="sp-accent" to="/contact">
              Yozing ↗
            </Link>
          </p>
        </div>
        <div>
          <Status loading={loading} error={error} retry={reload} />
          <div
            className="sp-faq-scroll"
            tabIndex={0}
            role="region"
            aria-label="Savol va javoblar"
          >
            {data?.map((faq, i) => (
              <article className="sp-faq-item" key={faq._id}>
                <h3>
                  <button
                    id={`${id}-q-${i}`}
                    type="button"
                    aria-expanded={open === faq._id}
                    aria-controls={`${id}-a-${i}`}
                    onClick={() => setOpen(open === faq._id ? null : faq._id)}
                  >
                    <span className="sp-faq-number">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{faq.question}</span>
                    <Plus
                      size={18}
                      className={
                        open === faq._id ? 'sp-faq-plus is-open' : 'sp-faq-plus'
                      }
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open === faq._id && (
                    <motion.div
                      key="answer"
                      id={`${id}-a-${i}`}
                      role="region"
                      aria-labelledby={`${id}-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="sp-faq-answer">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            ))}
          </div>
          {data?.length === 0 && (
            <p className="sp-muted">Savollar hali qo‘shilmagan.</p>
          )}
        </div>
      </Reveal>
    </section>
  );
}
