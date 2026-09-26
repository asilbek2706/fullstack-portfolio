import { portfolioApi } from '../../api/portfolioApi';
import { useResource } from '../../hooks/useResource';
import { Reveal } from '../ui/Reveal';
import { ResourceMessage } from '../ui/ResourceMessage';

export function FaqSection() {
  const { data, loading, error, reload } = useResource(portfolioApi.faq);
  return (
    <section
      className="pf-section pf-faq-section"
      id="faq"
      aria-labelledby="faq-title"
    >
      <Reveal>
        <p className="pf-eyebrow">01 / SAVOL–JAVOB</p>
        <h2 id="faq-title">
          Qiziqishdan
          <br />
          <span>boshlanadi.</span>
        </h2>
        <p className="pf-muted">
          Ish jarayoni va hamkorlik haqida tez-tez beriladigan savollar.
        </p>
      </Reveal>
      <div>
        <ResourceMessage loading={loading} error={error} retry={reload} />
        {data?.map((faq, i) => (
          <Reveal key={faq._id} delay={Math.min(i * 0.04, 0.2)}>
            <details className="pf-faq-item">
              <summary>
                <span className="pf-faq-number">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{faq.question}</span>
                <span className="pf-faq-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          </Reveal>
        ))}
        {data?.length === 0 && (
          <p className="pf-muted">Savol-javoblar tez orada qo‘shiladi.</p>
        )}
      </div>
    </section>
  );
}
