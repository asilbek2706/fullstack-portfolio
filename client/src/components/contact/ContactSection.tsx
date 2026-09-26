import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { FiArrowUpRight, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { portfolioApi, apiError } from '../../api/portfolioApi';
import { contactCaptcha } from '../../utils/recaptcha';
import { Reveal } from '../ui/Reveal';
import { AnswerTracker } from './AnswerTracker';

export function ContactSection() {
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState('');
  const submitting = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const input = {
      name: String(values.get('name') || '').trim(),
      phone: String(values.get('phone') || '').trim(),
      message: String(values.get('message') || '').trim(),
    };
    if (input.name.length < 2 || input.message.length < 5) {
      toast.error('Ism va xabarni to‘liq kiriting.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    const toastId = toast.loading('Xabar yuborilmoqda…');
    try {
      const recaptchaToken = await contactCaptcha();
      const result = await portfolioApi.contact(input, recaptchaToken);
      setReceipt(result.trackingToken);
      form.reset();
      toast.success(
        result.deliveryStatus === 'sent'
          ? 'Xabaringiz qabul qilindi!'
          : 'Xabar saqlandi. Bildirishnoma yetkazilishi kechikmoqda.',
        { id: toastId },
      );
    } catch (error) {
      toast.error(
        error instanceof Error && !('isAxiosError' in error)
          ? error.message
          : apiError(error),
        { id: toastId },
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  async function copyReceipt() {
    try {
      await navigator.clipboard.writeText(receipt);
      toast.success('Murojaat kodi nusxalandi.');
    } catch {
      toast.error('Kodni belgilang va qo‘lda nusxalang.');
    }
  }
  return (
    <section
      className="pf-section pf-contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <Reveal>
        <p className="pf-eyebrow">04 / BOG‘LANISH</p>
        <h2 id="contact-title">
          Yaxshi g‘oya
          <br />
          <span>sizdan boshlanadi.</span>
        </h2>
        <p className="pf-contact-intro">
          Loyiha, hamkorlik yoki shunchaki savol?
          <br />
          Yozing. Birga muhokama qilamiz.
        </p>
        <div className="pf-contact-decoration" aria-hidden="true">
          ↗
        </div>
      </Reveal>
      <Reveal className="pf-contact-panel">
        <form onSubmit={(event) => void submit(event)}>
          <div className="pf-form-row">
            <div>
              <label htmlFor="contact-name">Ismingiz</label>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                placeholder="Ismingiz"
                required
                minLength={2}
                maxLength={50}
                disabled={busy}
              />
            </div>
            <div>
              <label htmlFor="contact-phone">Telefon raqamingiz</label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+998901234567"
                pattern="\+998[0-9]{9}"
                title="+998XXXXXXXXX formatida kiriting"
                required
                disabled={busy}
              />
            </div>
          </div>
          <label htmlFor="contact-message">Nimani birga yaratamiz?</label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="G‘oyangiz haqida qisqacha…"
            required
            minLength={5}
            maxLength={1000}
            rows={5}
            disabled={busy}
          />
          <button className="pf-button pf-button--primary" disabled={busy}>
            {busy ? 'Yuborilmoqda…' : 'Xabar yuborish'}
            <FiArrowUpRight />
          </button>
          <p className="pf-privacy">
            Bu forma reCAPTCHA bilan himoyalangan. Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              maxfiylik siyosati
            </a>{' '}
            va{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              foydalanish shartlari
            </a>{' '}
            amal qiladi.
          </p>
        </form>
        {receipt && (
          <div className="pf-receipt" role="status">
            <strong>Xabaringiz qabul qilindi.</strong>
            <p>
              Javobni tekshirish uchun kodni saqlang. Uni bilgan kishi javobni
              ko‘ra oladi.
            </p>
            <code>{receipt}</code>
            <button className="pf-text-link" onClick={() => void copyReceipt()}>
              <FiCopy /> Kodni nusxalash
            </button>
          </div>
        )}
        <AnswerTracker key={receipt || 'empty'} initialToken={receipt} />
      </Reveal>
    </section>
  );
}
