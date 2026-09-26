import type { About } from '../../types/portfolio';
import { safeUrl } from '../../utils/safeUrl';
import { Reveal } from '../ui/Reveal';
import { ResourceMessage } from '../ui/ResourceMessage';

export function AboutSection({
  about,
  loading,
  error,
  retry,
}: {
  about: About | null;
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return (
    <section className="pf-section" id="about" aria-labelledby="about-title">
      <Reveal>
        <div className="pf-section-top">
          <p className="pf-eyebrow">02 / MEN HAQIMDA</p>
          <span>Behind the pixels</span>
        </div>
      </Reveal>
      <ResourceMessage loading={loading} error={error} retry={retry} />
      {about && (
        <Reveal className="pf-about-grid">
          <div className="pf-portrait-panel">
            <img
              src={safeUrl(about.avatar)}
              alt={about.fullName}
              loading="lazy"
            />
            <span className="pf-portrait-caption">
              {about.fullName}
              <small>{about.title}</small>
            </span>
          </div>
          <div className="pf-about-copy">
            <h2 id="about-title">
              Har bir detalda
              <br />
              <span>ma’no bor.</span>
            </h2>
            <p className="pf-bio">{about.bio}</p>
            <div className="pf-about-meta">
              <div>
                <strong>{about.experienceYears}</strong>
                <span>Tajriba</span>
              </div>
              <div>
                <strong>{about.title}</strong>
                <span>Yo‘nalish</span>
              </div>
            </div>
            <a href="#contact" className="pf-text-link">
              Keling, tanishamiz ↗
            </a>
          </div>
        </Reveal>
      )}
      {!loading && !error && !about && (
        <p className="pf-muted">Profil ma’lumotlari tez orada qo‘shiladi.</p>
      )}
    </section>
  );
}
