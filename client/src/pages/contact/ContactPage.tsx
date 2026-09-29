import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Camera as Instagram,
  Check,
  CodeXml as Github,
  Copy,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
import { portfolioApi, apiError } from '../../api/portfolioApi';
import { contactCaptcha } from '../../utils/recaptcha';
import { Button } from '../../components/ui/button';
import { FAQSection } from '../../components/portfolio/PortfolioPrimitives';
const channels = [
  {
    Icon: Github,
    label: 'GitHub',
    value: 'github.com/asilbek2706',
    href: 'https://github.com/asilbek2706',
  },
  {
    Icon: Phone,
    label: 'Telefon',
    value: '+998 50 753 66 36',
    href: 'tel:+998507536636',
  },
  {
    Icon: Mail,
    label: 'Elektron pochta',
    value: 'asilbekkaromatov2@gmail.com',
    href: 'mailto:asilbekkaromatov2@gmail.com',
  },
  {
    Icon: Send,
    label: 'Telegram',
    value: '@as1l_2706',
    href: 'https://t.me/as1l_2706',
  },
  {
    Icon: Instagram,
    label: 'Instagram',
    value: '@asilbek_2706',
    href: 'https://www.instagram.com/asilbek_2706/',
  },
];
export default function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState('');
  const [messageLength, setMessageLength] = useState(0);
  useEffect(() => {
    document.title = 'Bog‘lanish | Asilbek Karomatov';
  }, []);
  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(''), 1800);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    if (fields.get('website')) return;
    const input = {
      name: String(fields.get('name') || '').trim(),
      phone: String(fields.get('phone') || '').trim(),
      message: String(fields.get('message') || '').trim(),
    };
    if (
      input.name.length < 2 ||
      input.message.length < 5 ||
      !/^\+998\d{9}$/.test(input.phone)
    ) {
      setError('Ism, telefon va xabar maydonlarini tekshiring.');
      return;
    }
    setBusy(true);
    setError('');
    setSuccess(false);
    try {
      await portfolioApi.contact(input, await contactCaptcha());
      form.reset();
      setMessageLength(0);
      setSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error && !('isAxiosError' in cause)
          ? cause.message
          : apiError(cause),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="sp-section container" aria-labelledby="contact-title">
        <div className="sp-contact-grid">
          <div>
            <p className="sp-eyebrow">02 / ALOQADA BO‘LAYLIK</p>
            <h1 id="contact-title">
              Keyingi g‘oya <span>sizdan.</span>
            </h1>
            <p className="sp-section-description">
              Loyiha, hamkorlik yoki savol — suhbatni shu yerdan boshlaymiz.
            </p>
            <div className="sp-channels">
              {channels.map(({ Icon, label, value, href }) => (
                <div className="sp-channel" key={label}>
                  <a
                    href={href}
                    target={href.startsWith('https') ? '_blank' : undefined}
                    rel={
                      href.startsWith('https')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    <span className="sp-channel-icon">
                      <Icon size={19} />
                    </span>
                    <span>
                      <small>{label}</small>
                      <strong>{value}</strong>
                    </span>
                    <ArrowUpRight size={17} />
                  </a>
                  {(label === 'Telefon' || label === 'Elektron pochta') && (
                    <button
                      type="button"
                      className="sp-copy"
                      onClick={() => void copy(value)}
                      aria-label={`${label} nusxalash`}
                    >
                      <Copy size={16} />
                      {copied === value && (
                        <span aria-live="polite">Nusxalandi</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <form className="sp-form" onSubmit={(event) => void submit(event)}>
            <h2>Xabar qoldiring</h2>
            <p className="sp-muted">
              Xabaringizni yuboring, tez orada siz bilan bog‘lanamiz.
            </p>
            <input
              className="sp-honeypot"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <fieldset disabled={busy}>
              <label htmlFor="contact-name">Ismingiz</label>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={50}
                required
                placeholder="Ismingizni kiriting"
              />
              <label htmlFor="contact-phone">Telefon raqam</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                pattern="\+998[0-9]{9}"
                maxLength={13}
                required
                placeholder="+998901234567"
              />
              <label htmlFor="contact-message">Xabaringiz</label>
              <textarea
                id="contact-message"
                name="message"
                minLength={5}
                maxLength={1000}
                rows={5}
                required
                placeholder="G‘oyangiz haqida yozing…"
                onChange={(event) =>
                  setMessageLength(event.target.value.length)
                }
              />
              <small className="sp-counter">{messageLength}/1000</small>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Yuborilmoqda…' : 'Xabarni yuborish'}
                <Send size={16} />
              </Button>
            </fieldset>
            {success && (
              <p className="sp-success" role="status">
                <Check size={18} />
                Murojaatingiz saqlandi.
              </p>
            )}
            {error && (
              <p role="alert" className="sp-error">
                {error}
              </p>
            )}
            <p className="sp-captcha-note">
              Ushbu sayt reCAPTCHA tomonidan himoyalangan. Google
              kompaniyasining{' '}
              <a href="https://policies.google.com/privacy">
                maxfiylik siyosati
              </a>{' '}
              hamda{' '}
              <a href="https://policies.google.com/terms">
                foydalanish shartlari
              </a>{' '}
              apply.
            </p>
          </form>
        </div>
      </section>
      <FAQSection />
    </>
  );
}
