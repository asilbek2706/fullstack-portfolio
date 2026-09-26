type Captcha = {
  ready: (callback: () => void) => void;
  execute: (key: string, options: { action: string }) => Promise<string>;
};
let pending: Promise<Captcha> | null = null;
const getApi = () => (window as Window & { grecaptcha?: Captcha }).grecaptcha;

export async function contactCaptcha(): Promise<string> {
  const key = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();
  if (!key)
    throw new Error(
      'Xabar yuborish hozircha sozlanmagan. Keyinroq urinib ko‘ring.',
    );
  if (!pending) {
    pending = new Promise<Captcha>((resolve, reject) => {
      let finished = false;
      const timer = window.setTimeout(() => fail(), 15000);
      const finish = (api: Captcha) => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        resolve(api);
      };
      const fail = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        pending = null;
        reject(
          new Error(
            'reCAPTCHA yuklanmadi. Internetni tekshirib, qayta urinib ko‘ring.',
          ),
        );
      };
      const ready = () => {
        const api = getApi();
        if (api) api.ready(() => finish(api));
        else fail();
      };
      if (getApi()) {
        ready();
        return;
      }
      const id = 'public-recaptcha-v3';
      document.getElementById(id)?.remove();
      const script = document.createElement('script');
      script.id = id;
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
      script.async = true;
      script.onload = ready;
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  const api = await pending;
  const token = await api.execute(key, { action: 'contact' });
  if (!token) throw new Error('Tasdiqlash bajarilmadi. Qayta urinib ko‘ring.');
  return token;
}
