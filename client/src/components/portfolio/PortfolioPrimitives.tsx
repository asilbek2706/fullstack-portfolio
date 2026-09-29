import { useEffect, useId, useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/portfolio';
import { assetUrl } from '../../utils/assetUrl';

export function SectionHeader({
  eyebrow,
  titleStrong,
  titleMuted,
  description,
}: {
  eyebrow: string;
  titleStrong: string;
  titleMuted: string;
  description?: string;
}) {
  return (
    <header className="sp-section-header">
      <div>
        <p className="sp-eyebrow">{eyebrow}</p>
        <h2>
          {titleStrong} <span>{titleMuted}</span>
        </h2>
      </div>
      {description && <p className="sp-section-description">{description}</p>}
    </header>
  );
}

export function Chip({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <span className={accent ? 'sp-chip sp-chip-accent' : 'sp-chip'}>
      {children}
    </span>
  );
}

export function CTABanner({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="sp-section sp-section-tight">
      <div className="sp-cta-banner">
        <div>
          <p className="sp-eyebrow">BIRGA YARATAMIZ</p>
          <h2>{title}</h2>
        </div>
        <div className="sp-cta-actions">{children}</div>
      </div>
    </section>
  );
}

export function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen?: () => void;
}) {
  const image = assetUrl(project.image);
  return (
    <article className="sp-project-card">
      <button
        className="sp-project-open"
        type="button"
        onClick={onOpen}
        aria-label={`${project.title} tafsilotlari`}
      >
        <span className="sp-project-image">
          {image ? (
            <img src={image} alt={project.title} loading="lazy" />
          ) : (
            <span className="sp-project-placeholder">Rasm</span>
          )}
        </span>
        <span className="sp-project-body">
          <span className="sp-project-title-row">
            <strong>{project.title}</strong>
            <ArrowUpRight size={18} />
          </span>
          <span className="sp-project-description">{project.description}</span>
          <span className="sp-chip-list">
            {project.technologies.map((tech) => (
              <Chip key={tech}>{tech}</Chip>
            ))}
          </span>
        </span>
      </button>
      <div className="sp-project-actions">
        {assetUrl(project.demoLink) && (
          <a
            href={assetUrl(project.demoLink)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Demo <ArrowUpRight size={15} />
          </a>
        )}
        {assetUrl(project.githubLink) && (
          <a
            href={assetUrl(project.githubLink)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Kod <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </article>
  );
}

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const image = assetUrl(project.image);
  return (
    <div
      className="sp-dialog-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <dialog
        className="sp-dialog"
        open
        aria-labelledby="project-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="sp-dialog-close"
          type="button"
          onClick={onClose}
          aria-label="Yopish"
        >
          ×
        </button>
        {image && <img src={image} alt={project.title} />}
        <p className="sp-eyebrow">LOYIHA</p>
        <h2 id="project-dialog-title">{project.title}</h2>
        <p>{project.description}</p>
        <span className="sp-chip-list">
          {project.technologies.map((tech) => (
            <Chip key={tech}>{tech}</Chip>
          ))}
        </span>
      </dialog>
    </div>
  );
}

export function Accordion({
  question,
  answer,
  open,
  onToggle,
  id,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <article className="sp-accordion-item">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
        >
          <span>{question}</span>
          <Plus size={20} className={open ? 'sp-plus-open' : ''} />
        </button>
      </h3>
      <div
        id={id}
        className={open ? 'sp-accordion-answer is-open' : 'sp-accordion-answer'}
        role="region"
      >
        <p>{answer}</p>
      </div>
    </article>
  );
}

export function FAQSection() {
  const [data, setData] = useState<
    { _id: string; question: string; answer: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const id = useId();
  useEffect(() => {
    import('../../api/portfolioApi').then(({ portfolioApi }) =>
      portfolioApi
        .faq()
        .then((items) => {
          setData(items);
          setOpen(items[0]?._id ?? null);
        })
        .finally(() => setLoading(false)),
    );
  }, []);
  return (
    <section className="sp-section" id="faq" aria-labelledby="faq-title">
      <div className="sp-faq-grid">
        <div>
          <p className="sp-eyebrow">03 / SAVOL VA JAVOB</p>
          <h2 id="faq-title">
            Qiziqishdan <span>boshlanadi.</span>
          </h2>
          <p className="sp-section-description">
            Ish jarayoni va hamkorlik haqida.
          </p>
          <Link className="sp-text-link" to="/contact">
            Boshqa savol bormi? Yozing <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="sp-accordion-list">
          {loading ? (
            <p className="sp-status">Savollar yuklanmoqda…</p>
          ) : (
            data.map((item, index) => (
              <Accordion
                key={item._id}
                id={`${id}-${index}`}
                question={item.question}
                answer={item.answer}
                open={open === item._id}
                onToggle={() => setOpen(open === item._id ? null : item._id)}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export function SuccessMessage({ children }: { children: ReactNode }) {
  return (
    <p className="sp-success">
      <Check size={18} />
      {children}
    </p>
  );
}
