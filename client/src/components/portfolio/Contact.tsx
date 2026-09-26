import { useState, type FormEvent } from 'react';
import {
  Phone,
  Mail,
  Send,
  Camera as Instagram,
  ArrowUpRight,
  Check,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { portfolioApi, apiError } from '../../api/portfolioApi';
import { contactCaptcha } from '../../utils/recaptcha';
import type { ContactReceipt } from '../../types/portfolio';
import { Button } from '../ui/button';
import { Reveal } from './Reveal';
const channels = [
  {
    Icon: Phone,
    label: 'Telefon',
    value: '+998 50 753 66 36',
    href: 'tel:+998507536636',
  },
  {
    Icon: Mail,
    label: 'Email',
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
  const [receipt, setReceipt] = useState<ContactReceipt | null>(null);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [checking, setChecking] = useState(false);
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
    setReceipt(null);
    setAnswer('');
    try {
      const token = await contactCaptcha();
      const result = await portfolioApi.contact(input, token);
      setReceipt(result);
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
  async function check() {
    if (!receipt) return;
    setChecking(true);
    try {
      const result = await portfolioApi.answer(receipt.trackingToken);
      setAnswer(
        result.isAnswered ? result.answer : 'Hozircha javob kutilmoqda.',
      );
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setChecking(false);
    }
  }
  return (
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
            Javobni saqlangan kuzatuv kodi orqali tekshirishingiz mumkin.
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
          {receipt && (
            <div className="sp-receipt" role="status">
              <p className="flex items-center gap-2">
                <Check size={17} /> Murojaat saqlandi.
              </p>
              {receipt.deliveryStatus === 'failed' && (
                <p>Telegramga yetkazish kechikdi. Qayta yuborish shart emas.</p>
              )}
              <p>Kuzatuv kodini saqlab oling:</p>
              <code>{receipt.trackingToken}</code>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(receipt.trackingToken)
                      .then(
                        () => toast.success('Kod nusxalandi.'),
                        () => toast.error('Kodni qo‘lda nusxalang.'),
                      );
                  }}
                >
                  <Copy size={14} /> Nusxalash
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={checking}
                  onClick={() => void check()}
                >
                  {checking ? 'Tekshirilmoqda…' : 'Javobni tekshirish'}
                </Button>
              </div>
              {answer && <p className="whitespace-pre-wrap mt-3">{answer}</p>}
            </div>
          )}
          <p className="sp-captcha-note">
            This site is protected by reCAPTCHA and the Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </form>
      </Reveal>
    </section>
  );
}
