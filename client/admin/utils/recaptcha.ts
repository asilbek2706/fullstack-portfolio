interface RecaptchaApi {
  ready: (callback: () => void) => void;
  execute: (
    siteKey: string,
    options: {
      action: string;
    },
  ) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

const scriptId = 'google-recaptcha-v3';
const recaptchaAction = 'contact';

let recaptchaPromise: Promise<RecaptchaApi> | null = null;

const getSiteKey = () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();

  if (!siteKey) {
    throw new Error(
      'VITE_RECAPTCHA_SITE_KEY client environment ichida topilmadi.',
    );
  }

  return siteKey;
};

const waitUntilReady = (recaptcha: RecaptchaApi): Promise<RecaptchaApi> =>
  new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error('reCAPTCHA javob bermadi. Qayta urinib ko‘ring.'));
    }, 12_000);

    recaptcha.ready(() => {
      window.clearTimeout(timeoutId);
      resolve(recaptcha);
    });
  });

const loadRecaptcha = (): Promise<RecaptchaApi> => {
  if (window.grecaptcha) {
    return waitUntilReady(window.grecaptcha);
  }

  if (recaptchaPromise) {
    return recaptchaPromise;
  }

  const siteKey = getSiteKey();

  recaptchaPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;

    const handleLoaded = () => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA kutubxonasi yuklanmadi.'));
        return;
      }

      void waitUntilReady(window.grecaptcha).then(resolve).catch(reject);
    };

    const handleError = () => {
      recaptchaPromise = null;
      reject(new Error('reCAPTCHA serveriga ulanib bo‘lmadi.'));
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleLoaded, {
        once: true,
      });
      existingScript.addEventListener('error', handleError, {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');

    script.id = scriptId;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(
      siteKey,
    )}`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleLoaded, {
      once: true,
    });
    script.addEventListener('error', handleError, {
      once: true,
    });

    document.head.appendChild(script);
  });

  return recaptchaPromise;
};

export const getContactRecaptchaToken = async (): Promise<string> => {
  const siteKey = getSiteKey();
  const recaptcha = await loadRecaptcha();
  const token = await recaptcha.execute(siteKey, {
    action: recaptchaAction,
  });

  if (!token) {
    throw new Error('reCAPTCHA token yaratilmadi.');
  }

  return token;
};
