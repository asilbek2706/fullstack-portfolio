import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { portfolioApi } from '../../api/portfolioApi';
import { assetUrl } from '../../utils/assetUrl';
import { useResource } from '../../hooks/useResource';
import { Button } from '../../components/ui/button';
import {
  Chip,
  CTABanner,
  FAQSection,
  ProjectCard,
  SectionHeader,
} from '../../components/portfolio/PortfolioPrimitives';
import { Status } from '../../components/portfolio/Status';

export default function HomePage() {
  const about = useResource(portfolioApi.about);
  const projects = useResource((signal) => portfolioApi.projects(1, signal));
  const [selected, setSelected] = useState<string | null>(null);
  const profile = about.data;
  useEffect(() => {
    document.title = 'Asilbek Karomatov | Full-stack developer';
  }, []);
  return (
    <>
      <section
        className="sp-section sp-hero sp-home-hero container"
        aria-labelledby="home-title"
      >
        {profile && (
          <div className="sp-hero-grid">
            <div className="sp-portrait-wrap">
              <div className="sp-portrait">
                <span className="sp-portrait-label">MAQSAD BILAN KOD</span>
                {assetUrl(profile.avatar) && (
                  <img
                    src={assetUrl(profile.avatar)}
                    alt={profile.fullName}
                    fetchPriority="high"
                  />
                )}
              </div>
              <div className="sp-experience">
                <Clock3 size={18} />
                <strong>{profile.experienceYears}</strong>
                <small>Tajriba va izlanish</small>
              </div>
            </div>
            <div className="sp-hero-copy">
              <p className="sp-eyebrow">MEN HAQIMDA / PORTFOLIO</p>
              <h1 id="home-title">{profile.fullName}</h1>
              <p className="sp-job">{profile.title}</p>
              <div className="sp-hero-intro">
                <h2>Kim ekanligim</h2>
                <p>
                  Men Asilbek Karomatov — zamonaviy web ilovalar yaratishga
                  qiziqadigan full-stack dasturchiman. Foydalanuvchiga qulay
                  interfeyslarni ishonchli backend bilan birlashtirish,
                  g‘oyalarni amalda ishlaydigan mahsulotga aylantirish ustida
                  ishlayman.
                </p>
              </div>
              <div className="sp-hero-actions">
                <Button asChild>
                  <Link to="/projects">
                    Loyihalarni ko‘rish <ArrowUpRight size={17} />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact">
                    Birga ishlaymiz <ArrowUpRight size={17} />
                  </Link>
                </Button>
              </div>
              <Link className="sp-text-link" to="/about">
                Batafsil: Men haqimda <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        )}
        {about.loading && <Status loading error="" retry={about.reload} />}
        {about.error && (
          <Status loading={false} error={about.error} retry={about.reload} />
        )}
      </section>
      <section
        className="sp-highlights container"
        aria-label="Asosiy ko‘rsatkichlar"
      >
        <div>
          <strong>{profile?.experienceYears ?? '1.5+ yil'}</strong>
          <span>Tajriba va izlanish</span>
        </div>
        <div>
          <strong>
            {projects.data?.pagination.total ?? projects.data?.data.length ?? 0}
          </strong>
          <span>Loyiha</span>
        </div>
        <div>
          <span>Main stack</span>
          <div className="sp-chip-list">
            <Chip accent>React</Chip>
            <Chip accent>TypeScript</Chip>
            <Chip accent>Node.js</Chip>
            <Chip accent>MongoDB</Chip>
          </div>
        </div>
      </section>
      <section className="sp-section" aria-labelledby="featured-title">
        <SectionHeader
          eyebrow="01 / TANLANGAN ISHLAR"
          titleStrong="G‘oyalar."
          titleMuted="Natijalar."
          description="Eng yangi loyihalardan boshlang."
        />
        <div className="sp-project-grid">
          {projects.data?.data.slice(0, 2).map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpen={() => setSelected(project._id)}
            />
          ))}
        </div>
        <Link className="sp-text-link sp-section-link" to="/projects">
          Barcha loyihalar <ArrowUpRight size={16} />
        </Link>
      </section>
      <CTABanner title="Qiziqishdan boshlanadi.">
        <Button asChild>
          <Link to="/contact">
            Yozing <ArrowUpRight size={17} />
          </Link>
        </Button>
      </CTABanner>
      <FAQSection />
      {selected &&
        projects.data?.data.find((project) => project._id === selected) && (
          <div className="sp-dialog-backdrop" onClick={() => setSelected(null)}>
            <div
              className="sp-dialog"
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="sp-dialog-close"
                onClick={() => setSelected(null)}
                aria-label="Yopish"
              >
                ×
              </button>
              <h2>
                {
                  projects.data.data.find((project) => project._id === selected)
                    ?.title
                }
              </h2>
              <p>
                {
                  projects.data.data.find((project) => project._id === selected)
                    ?.description
                }
              </p>
            </div>
          </div>
        )}
    </>
  );
}
