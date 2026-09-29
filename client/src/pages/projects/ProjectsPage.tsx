import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { portfolioApi } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { Button } from '../../components/ui/button';
import {
  CTABanner,
  ProjectCard,
  SectionHeader,
} from '../../components/portfolio/PortfolioPrimitives';
import { Status } from '../../components/portfolio/Status';
export default function ProjectsPage() {
  const resource = useResource((signal) => portfolioApi.projects(1, signal));
  const [selected, setSelected] = useState<string | null>(null);
  const projects = resource.data?.data ?? [];
  const active = projects.find((project) => project._id === selected);
  useEffect(() => {
    document.title = 'Loyihalar | Asilbek Karomatov';
  }, []);
  return (
    <>
      <section
        className="sp-section container"
        aria-labelledby="projects-title"
      >
        <SectionHeader
          eyebrow="01 / TANLANGAN ISHLAR"
          titleStrong="G‘oyalar."
          titleMuted="Natijalar."
          description="Eng yangi loyihalardan boshlang."
        />
        <div className="sp-project-count">
          {resource.data?.pagination.total ?? projects.length} ta loyiha
        </div>
        <Status
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        <div className="sp-project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpen={() => setSelected(project._id)}
            />
          ))}
          <article className="sp-project-placeholder">
            <span>+</span>
            <h3>Yangi loyiha tez orada</h3>
          </article>
        </div>
      </section>
      <CTABanner title="Qiziqishdan boshlanadi.">
        <Button asChild>
          <Link to="/contact">
            Yozing <ArrowUpRight size={17} />
          </Link>
        </Button>
      </CTABanner>
      {active && (
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
            <h2>{active.title}</h2>
            <p>{active.description}</p>
          </div>
        </div>
      )}
    </>
  );
}
