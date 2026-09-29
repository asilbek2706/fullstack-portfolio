import { useEffect } from 'react';
import {
  ArrowUpRight,
  Braces,
  Code2,
  Coffee,
  FileCode2,
  GitBranch,
  Palette,
  Server,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { portfolioApi } from '../../api/portfolioApi';
import { assetUrl } from '../../utils/assetUrl';
import { useResource } from '../../hooks/useResource';
import { Button } from '../../components/ui/button';
import {
  CTABanner,
  Chip,
  SectionHeader,
} from '../../components/portfolio/PortfolioPrimitives';
import { Status } from '../../components/portfolio/Status';
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
export default function AboutPage() {
  const resource = useResource(portfolioApi.about);
  const data = resource.data;
  useEffect(() => {
    document.title = 'Men haqimda | Asilbek Karomatov';
  }, []);
  const groups = [
    ['Frontend', skills.slice(0, 5)],
    ['Backend', skills.slice(5, 7)],
    ['Tools', skills.slice(7)],
  ] as const;
  return (
    <>
      {resource.loading && (
        <section className="sp-section">
          <Status loading error="" retry={resource.reload} />
        </section>
      )}
      {resource.error && (
        <section className="sp-section">
          <Status
            loading={false}
            error={resource.error}
            retry={resource.reload}
          />
        </section>
      )}
      {data && (
        <>
          <section
            className="sp-section sp-about-hero container"
            aria-labelledby="about-title"
          >
            <div className="sp-about-grid">
              <div className="sp-portrait-wrap">
                <div className="sp-portrait">
                  <span className="sp-portrait-label">MAQSAD BILAN KOD</span>
                  {assetUrl(data.avatar) && (
                    <img
                      src={assetUrl(data.avatar)}
                      alt={data.fullName}
                      fetchPriority="high"
                    />
                  )}
                </div>
              </div>
              <div className="sp-about-copy">
                <p className="sp-eyebrow">MEN HAQIMDA / HIKOYA</p>
                <h1 id="about-title">
                  Men haqimda<span>.</span>
                </h1>
                <p className="sp-job">{data.title}</p>
                <div className="sp-bio">
                  <article>
                    <h2>Kim ekanligim</h2>
                    <p>
                      Men Asilbek Karomatov — zamonaviy web ilovalar yaratishga
                      qiziqadigan full-stack dasturchiman. Foydalanuvchiga qulay
                      interfeyslarni ishonchli backend bilan birlashtirish,
                      g‘oyalarni amalda ishlaydigan mahsulotga aylantirish
                      ustida ishlayman.
                    </p>
                  </article>
                  <article>
                    <h2>Texnologiyalar</h2>
                    <p>
                      Frontendda React, TypeScript va SCSS, backendda esa
                      Node.js, Express va MongoDB bilan loyihalar yarataman.
                      REST API, autentifikatsiya, admin panellar, fayl yuklash
                      va tashqi xizmatlar bilan integratsiya qilish bo‘yicha
                      amaliy tajriba orttiryapman.
                    </p>
                  </article>
                  <article>
                    <h2>Yondashuvim</h2>
                    <p>
                      Kodning tushunarli tuzilishi, xavfsizlik va turli
                      ekranlarga mos dizaynga alohida e’tibor beraman.
                    </p>
                  </article>
                  <article className="sp-bio-callout">
                    <h2>Hozir o‘rganayotganim</h2>
                    <p>
                      Hozirda Java tilini ham o‘rganyapman. Obyektga
                      yo‘naltirilgan dasturlash, ma’lumotlar tuzilmalari va
                      algoritmlar bo‘yicha bilimlarimni mustahkamlab, backend
                      dasturlashdagi imkoniyatlarimni kengaytirishni maqsad
                      qilganman.
                    </p>
                  </article>
                  <blockquote>
                    <h2>Maqsadim</h2>
                    <p>
                      Har bir loyihani yangi bilimlarni sinash va murakkab
                      muammolarga yechim topish imkoniyati deb bilaman. Maqsadim
                      — shunchaki ishlaydigan dastur emas, balki odamlarga foyda
                      keltiradigan, rivojlantirish va qo‘llab-quvvatlash qulay
                      bo‘lgan mahsulotlar yaratish.
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </section>
          <section className="sp-section" aria-labelledby="skills-title">
            <SectionHeader
              eyebrow="02 / ASBOBLAR"
              titleStrong="Ko‘nikmalar va"
              titleMuted="texnologiyalar."
              description="Har bir g‘oya uchun to‘g‘ri vosita."
            />
            <div className="sp-skill-groups">
              {groups.map(([name, items]) => (
                <div key={name}>
                  <h3>{name}</h3>
                  <div className="sp-skills-grid">
                    {items.map(({ label, Icon, color }) => (
                      <article
                        className="sp-skill-card"
                        key={label}
                        style={
                          { '--skill-color': color } as React.CSSProperties
                        }
                      >
                        <span className="sp-skill-icon">
                          <Icon size={28} />
                        </span>
                        <span>{label}</span>
                        {label === 'Java' && <Chip>O‘rganilmoqda</Chip>}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="sp-section sp-section-tight">
            <SectionHeader
              eyebrow="03 / ISH USLUBI"
              titleStrong="Tartibli"
              titleMuted="yondashuv."
            />
            <div className="sp-style-grid">
              {[
                'Tushunarli kod tuzilishi',
                'Xavfsizlik',
                'Turli ekranlarga mos dizayn',
              ].map((item) => (
                <article key={item}>
                  <Code2 size={24} />
                  <h3>{item}</h3>
                </article>
              ))}
            </div>
          </section>
          <CTABanner title="Birga ishlaymiz">
            <Button asChild>
              <Link to="/projects">
                Loyihalarni ko‘rish <ArrowUpRight size={17} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">
                Bog‘lanish <ArrowUpRight size={17} />
              </Link>
            </Button>
          </CTABanner>
        </>
      )}
    </>
  );
}
