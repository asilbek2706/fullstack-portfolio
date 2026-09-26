import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, Layers, Clock3 } from 'lucide-react';
import { portfolioApi } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { assetUrl } from '../../utils/assetUrl';
import { Button } from '../ui/button';
import { Reveal } from './Reveal';
import { Status } from './Status';
export function About() {
  const { data, loading, error, reload } = useResource(portfolioApi.about);
  return (
    <section id="home" className="sp-section sp-hero">
      <Status loading={loading} error={error} retry={reload} />
      {!loading && !error && !data && (
        <p className="sp-status">Profil ma’lumotlari hali qo‘shilmagan.</p>
      )}
      {data && (
        <div className="sp-about-grid" id="about">
          <Reveal className="sp-portrait-wrap">
            <div className="sp-portrait">
              <div className="sp-portrait-grid" />
              {assetUrl(data.avatar) ? (
                <img
                  src={assetUrl(data.avatar)}
                  alt={data.fullName}
                  fetchPriority="high"
                  onError={(e) => {
                    e.currentTarget.hidden = true;
                  }}
                />
              ) : (
                <Code2 size={100} />
              )}
              <span className="sp-portrait-label">
                <Code2 size={16} /> CODE WITH PURPOSE
              </span>
            </div>
            <div className="sp-experience">
              <span>
                <Clock3 size={20} />
              </span>
              <div>
                <strong>{data.experienceYears}</strong>
                <small>Tajriba va izlanish</small>
              </div>
            </div>
          </Reveal>
          <Reveal className="sp-about-copy">
            <p className="sp-eyebrow">MEN HAQIMDA / PORTFOLIO</p>
            <h1>{data.fullName}</h1>
            <p className="sp-job">{data.title}</p>
            <div className="sp-bio">
              {data.bio
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-7">
              <span className="sp-tag">
                <Code2 size={14} /> {data.title}
              </span>
              <span className="sp-tag">
                <Layers size={14} /> {data.experienceYears}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
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
          </Reveal>
        </div>
      )}
    </section>
  );
}
