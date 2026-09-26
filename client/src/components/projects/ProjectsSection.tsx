import { useCallback, useState } from 'react';
import { portfolioApi } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { ProjectCard } from './ProjectCard';
import { Reveal } from '../ui/Reveal';
import { ResourceMessage } from '../ui/ResourceMessage';

function ProjectResults({
  page,
  changePage,
}: {
  page: number;
  changePage: (page: number) => void;
}) {
  const loader = useCallback(
    (signal: AbortSignal) => portfolioApi.projects(page, signal),
    [page],
  );
  const { data, error, loading, reload } = useResource(loader);
  return (
    <>
      <ResourceMessage loading={loading} error={error} retry={reload} />
      {data && (
        <>
          <div className="pf-project-grid">
            {data.data.map((project, index) => (
              <Reveal key={project._id} delay={(index % 2) * 0.08}>
                <ProjectCard project={project} index={(page - 1) * 6 + index} />
              </Reveal>
            ))}
          </div>
          {data.data.length === 0 && (
            <p className="pf-muted">Loyihalar tez orada qo‘shiladi.</p>
          )}
          {data.pagination.totalPages > 1 && (
            <nav className="pf-pagination" aria-label="Loyihalar sahifalari">
              <button
                className="pf-button pf-button--quiet"
                disabled={page === 1}
                onClick={() => changePage(page - 1)}
              >
                ← Oldingi
              </button>
              <span>
                {page} / {data.pagination.totalPages}
              </span>
              <button
                className="pf-button pf-button--quiet"
                disabled={page >= data.pagination.totalPages}
                onClick={() => changePage(page + 1)}
              >
                Keyingi →
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
export function ProjectsSection() {
  const [page, setPage] = useState(1);
  return (
    <section className="pf-section" id="work" aria-labelledby="work-title">
      <Reveal>
        <div className="pf-section-top">
          <p className="pf-eyebrow">01 / LOYIHALAR</p>
          <span>Ideas, made real</span>
        </div>
        <div className="pf-section-heading">
          <h2 id="work-title">
            G‘oyalar.
            <br />
            <span>Amalda.</span>
          </h2>
          <p>
            Har bir loyiha — yangi savol,
            <br />
            yangi yechim, yangi tajriba.
          </p>
        </div>
      </Reveal>
      <ProjectResults
        key={page}
        page={page}
        changePage={(next) => {
          setPage(next);
          document.getElementById('work')?.scrollIntoView({ block: 'start' });
        }}
      />
    </section>
  );
}
