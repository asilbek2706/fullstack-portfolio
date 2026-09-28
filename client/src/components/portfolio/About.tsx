import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Braces,
  Code2,
  Coffee,
  FileCode2,
  GitBranch,
  Layers,
  Palette,
  Server,
  Sparkles,
  Clock3,
} from 'lucide-react';
import { portfolioApi } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { assetUrl } from '../../utils/assetUrl';
import { Button } from '../ui/button';
import { Reveal } from './Reveal';
import { Status } from './Status';
const skills = [
  { label: 'React', Icon: Braces, color: '#38bdf8' },
  { label: 'JavaScript', Icon: Sparkles, color: '#f5c542' },
  { label: 'TypeScript', Icon: FileCode2, color: '#3178c6' },
  { label: 'HTML5', Icon: Code2, color: '#ef6c43' },
  { label: 'CSS3', Icon: Palette, color: '#4f9cf9' },
  { label: 'Node.js', Icon: Server, color: '#57b56d' },
  { label: 'Java', Icon: Coffee, color: '#e76f51' },
  { label: 'Git & GitHub', Icon: GitBranch, color: '#b66cff' },
];

export function About({ showSkills = false }: { showSkills?: boolean }) {
  const { data, loading, error, reload } = useResource(portfolioApi.about);
  const technologyTags = [
    'React',
    'TypeScript',
    'SCSS',
    'Node.js',
    'Express',
    'MongoDB',
  ];

  return (
    <>
      <section id="home" className="sp-section sp-hero container">
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
                  <Code2 size={16} /> MAQSAD BILAN KOD
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
              <div className="sp-about-actions">
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
              <div className="sp-bio" aria-label="Biografiya">
                <article className="sp-bio-block">
                  <h2>Kim ekanligim</h2>
                  <p>
                    Men Asilbek Karomatov — zamonaviy web ilovalar yaratishga
                    qiziqadigan full-stack dasturchiman. Foydalanuvchiga qulay
                    interfeyslarni ishonchli backend bilan birlashtirish,
                    g‘oyalarni amalda ishlaydigan mahsulotga aylantirish ustida
                    ishlayman.
                  </p>
                </article>
                <article className="sp-bio-block">
                  <h2>Texnologiyalar</h2>
                  <p>
                    Frontendda React, TypeScript va SCSS, backendda esa Node.js,
                    Express va MongoDB bilan loyihalar yarataman. REST API,
                    autentifikatsiya, admin panellar, fayl yuklash va tashqi
                    xizmatlar bilan integratsiya qilish bo‘yicha amaliy tajriba
                    orttiryapman.
                  </p>
                  <ul className="sp-tech-tags" aria-label="Texnologiyalar ro‘yxati">
                    {technologyTags.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                </article>
                <article className="sp-bio-block">
                  <h2>Yondashuvim</h2>
                  <p>
                    Kodning tushunarli tuzilishi, xavfsizlik va turli ekranlarga
                    mos dizaynga alohida e’tibor beraman.
                  </p>
                </article>
                <article className="sp-bio-block sp-bio-callout">
                  <h2>Hozir o‘rganayotganim</h2>
                  <p>
                    Hozirda Java tilini ham o‘rganyapman. Obyektga yo‘naltirilgan
                    dasturlash, ma’lumotlar tuzilmalari va algoritmlar bo‘yicha
                    bilimlarimni mustahkamlab, backend dasturlashdagi
                    imkoniyatlarimni kengaytirishni maqsad qilganman.
                  </p>
                </article>
                <blockquote className="sp-bio-quote">
                  <h2>Maqsadim</h2>
                  <p>
                    Har bir loyihani yangi bilimlarni sinash va murakkab
                    muammolarga yechim topish imkoniyati deb bilaman. Maqsadim —
                    shunchaki ishlaydigan dastur emas, balki odamlarga foyda
                    keltiradigan, rivojlantirish va qo‘llab-quvvatlash qulay
                    bo‘lgan mahsulotlar yaratish.
                  </p>
                </blockquote>
              </div>
              <div className="sp-about-tags">
                <span className="sp-tag">
                  <Code2 size={14} /> {data.title}
                </span>
                <span className="sp-tag">
                  <Layers size={14} /> {data.experienceYears}
                </span>
              </div>
            </Reveal>
          </div>
        )}
      </section>
      {showSkills && (
        <section className="sp-section sp-skills-section container" id="skills">
          <Reveal>
            <div className="sp-section-heading">
              <div>
                <p className="sp-eyebrow">02 / ASBOBLAR</p>
                <h2>
                  Ko‘nikmalar va <span>texnologiyalar.</span>
                </h2>
              </div>
              <p className="sp-muted">Har bir g‘oya uchun to‘g‘ri vosita.</p>
            </div>
            <div className="sp-skills-grid">
              {skills.map(({ label, Icon, color }) => (
                <article
                  className="sp-skill-card"
                  style={{ '--skill-color': color } as CSSProperties}
                  key={label}
                >
                  <span className="sp-skill-icon">
                    <Icon size={20} />
                  </span>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
}
