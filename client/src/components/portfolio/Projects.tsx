import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CodeXml as Github,
  Image,
} from 'lucide-react';
import { portfolioApi, apiError } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { assetUrl } from '../../utils/assetUrl';
import type { Project } from '../../types/portfolio';
import { Button } from '../ui/button';
import { Reveal } from './Reveal';
import { Status } from './Status';
const loadFirst = (signal: AbortSignal) => portfolioApi.projects(1, signal);
function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="sp-project">
      <div className="sp-project-image">
        {assetUrl(project.image) ? (
          <img
            src={assetUrl(project.image)}
            alt={project.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.hidden = true;
            }}
          />
        ) : (
          <Image size={36} />
        )}
        <div className="sp-project-links">
          {assetUrl(project.githubLink) && (
            <a
              href={assetUrl(project.githubLink)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title}: GitHub`}
            >
              <Github size={18} />
            </a>
          )}
          {assetUrl(project.demoLink) && (
            <a
              href={assetUrl(project.demoLink)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title}: demo`}
            >
              <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3>{project.title}</h3>
        <p className="sp-project-description">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-5">
          {project.technologies.map((tech, i) => (
            <span className="sp-tag" key={`${tech}-${i}`}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
function ProjectCarousel({
  initial,
  totalPages,
}: {
  initial: Project[];
  totalPages: number;
}) {
  const [projects, setProjects] = useState(initial);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ref, api] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    loop: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on('select', update).on('reInit', update);
    return () => {
      api.off('select', update).off('reInit', update);
    };
  }, [api]);
  const more = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const result = await portfolioApi.projects(page + 1);
      setProjects((old) => [
        ...old,
        ...result.data.filter((p) => !old.some((item) => item._id === p._id)),
      ]);
      setPage(page + 1);
    } catch (e) {
      setError(apiError(e));
    } finally {
      setBusy(false);
    }
  }, [page]);
  return (
    <>
      <div
        className="sp-carousel"
        ref={ref}
        role="region"
        aria-roledescription="carousel"
        aria-label="Loyihalar"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') api?.scrollPrev();
          if (e.key === 'ArrowRight') api?.scrollNext();
        }}
      >
        <div className="sp-carousel-track">
          {projects.map((project, i) => (
            <div
              className="sp-slide"
              key={project._id}
              role="group"
              aria-label={`${i + 1} / ${projects.length}`}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-6">
        <p className="sp-muted text-sm">{projects.length} ta loyiha yuklandi</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={!canPrev}
            onClick={() => api?.scrollPrev()}
            aria-label="Oldingi loyiha"
          >
            <ArrowLeft size={18} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={!canNext}
            onClick={() => api?.scrollNext()}
            aria-label="Keyingi loyiha"
          >
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
      {page < totalPages && (
        <Button
          className="mt-5"
          variant="outline"
          disabled={busy}
          onClick={() => void more()}
        >
          {busy ? 'Yuklanmoqda…' : 'Yana loyihalar'}
        </Button>
      )}
      {error && (
        <p role="alert" className="sp-error mt-3">
          {error}
        </p>
      )}
    </>
  );
}
export function Projects() {
  const { data, loading, error, reload } = useResource(loadFirst);
  return (
    <section className="sp-section" id="projects">
      <Reveal>
        <div className="sp-section-heading">
          <div>
            <p className="sp-eyebrow">01 / TANLANGAN ISHLAR</p>
            <h2>
              G‘oyalar. <span>Natijalar.</span>
            </h2>
          </div>
          <p className="sp-muted">Eng yangi loyihalardan boshlang.</p>
        </div>
        <Status loading={loading} error={error} retry={reload} />
        {data && data.data.length > 0 && (
          <ProjectCarousel
            key={data.data.map((p) => p._id).join(',')}
            initial={data.data}
            totalPages={data.pagination.totalPages}
          />
        )}
        {data?.data.length === 0 && (
          <p className="sp-status">Loyihalar tez orada qo‘shiladi.</p>
        )}
      </Reveal>
    </section>
  );
}
