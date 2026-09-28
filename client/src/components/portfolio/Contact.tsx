import { useState, type FormEvent } from 'react';
import {
  Phone,
  Mail,
  Send,
  Camera as Instagram,
  ArrowUpRight,
  CodeXml as Github,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { portfolioApi, apiError } from '../../api/portfolioApi';
import { contactCaptcha } from '../../utils/recaptcha';
import { Button } from '../ui/button';
import { Reveal } from './Reveal';
import { Faq } from './Faq';
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
export function Contact() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
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
    try {
      const token = await contactCaptcha();
      await portfolioApi.contact(input, token);
      form.reset();
      toast.success('Murojaatingiz saqlandi.');
    } catch (e) {
      const message =
        e instanceof Error && !('isAxiosError' in e) ? e.message : apiError(e);
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="sp-section" id="contact">
        <Reveal className="sp-contact-grid">
          <div>
            <p className="sp-eyebrow">02 / ALOQADA BO‘LAYLIK</p>
            <h2>
              Keyingi g‘oya
              <br />
              <span>sizdan.</span>
            </h2>
            <p className="sp-muted mt-5 max-w-sm">
              Loyiha, hamkorlik yoki savol — suhbatni shu yerdan boshlaymiz.
            </p>
            <div className="sp-channels">
              {channels.map(({ Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('https') ? '_blank' : undefined}
                  rel={
                    href.startsWith('https') ? 'noopener noreferrer' : undefined
                  }
                >
                  <span className="sp-channel-icon">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </span>
                  <ArrowUpRight className="ml-auto shrink-0" size={17} />
                </a>
              ))}
            </div>
          </div>
          <form className="sp-form" onSubmit={(e) => void submit(e)}>
            <h3>Xabar qoldiring</h3>
            <p className="sp-muted text-sm mt-2 mb-7">
              Xabaringizni yuboring, tez orada siz bilan bog‘lanamiz.
            </p>
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
                title="+998 va undan keyin 9 ta raqam"
              />
              <label htmlFor="contact-message">Xabaringiz</label>
              <textarea
                id="contact-message"
                name="message"
                minLength={5}
                maxLength={1000}
                rows={4}
                required
                placeholder="G‘oyangiz haqida yozing…"
              />
              <Button type="submit" className="w-full mt-5" disabled={busy}>
                {busy ? 'Yuborilmoqda…' : 'Xabarni yuborish'}
                <Send size={16} />
              </Button>
            </fieldset>
            {error && (
              <p role="alert" className="sp-error mt-4">
                {error}
              </p>
            )}
            <p className="sp-captcha-note">
              Ushbu sayt reCAPTCHA tomonidan himoyalangan. Google
              kompaniyasining{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                maxfiylik siyosati
              </a>{' '}
              hamda{' '}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                foydalanish shartlari
              </a>{' '}
              apply.
            </p>
          </form>
        </Reveal>
      </section>
      <Faq />
    </>
  );
}
