import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { apiError, portfolioApi } from '../../api/portfolioApi';
import type { ContactAnswer } from '../../types/portfolio';

export function AnswerTracker({
  initialToken = '',
}: {
  initialToken?: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [answer, setAnswer] = useState<ContactAnswer | null>(null);
  const [busy, setBusy] = useState(false);
  async function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setAnswer(null);
    try {
      setAnswer(await portfolioApi.answer(token.trim()));
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="pf-tracker" open={initialToken ? true : undefined}>
      <summary>Yuborgan xabaringiz javobini tekshirish ↗</summary>
      <form onSubmit={(event) => void check(event)}>
        <label htmlFor="tracking-code">Murojaat kodi</label>
        <input
          id="tracking-code"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          pattern="[A-Za-z0-9_-]{43}"
          autoComplete="off"
          spellCheck={false}
          placeholder="Saqlab qo‘ygan kodingizni kiriting"
        />
        <button className="pf-button pf-button--quiet" disabled={busy}>
          {busy ? 'Tekshirilmoqda…' : 'Javobni tekshirish'}
        </button>
      </form>
      {answer && (
        <div role="status" className="pf-answer">
          <strong>
            {answer.isAnswered ? 'Javob keldi' : 'Xabaringiz qabul qilingan'}
          </strong>
          <p>
            {answer.isAnswered
              ? answer.answer
              : 'Hozircha javob berilmagan. Keyinroq yana tekshiring.'}
          </p>
        </div>
      )}
    </details>
  );
}
