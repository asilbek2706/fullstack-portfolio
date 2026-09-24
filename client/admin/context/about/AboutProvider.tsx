import axios from 'axios';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { getApiError } from '../../../shared/utils/getApiError';
import { aboutApi } from '../../api/aboutApi';
import { AboutContext, type AboutContextValue } from './AboutContext';
import type { About, AboutStatus } from '../../types/about.types';

export function AboutProvider({ children }: PropsWithChildren) {
  const [about, setAbout] = useState<About | null>(null);
  const [status, setStatus] = useState<AboutStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void aboutApi
      .get()
      .then((result) => {
        if (cancelled) return;

        setAbout(result);
        setStatus('ready');
        setErrorMessage('');
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setAbout(null);
          setStatus('empty');
          setErrorMessage('');
          return;
        }

        setStatus('error');
        setErrorMessage(
          getApiError(error, 'About ma’lumotlarini yuklab bo‘lmadi.'),
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshAbout = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await aboutApi.get();
      setAbout(result);
      setStatus('ready');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setAbout(null);
        setStatus('empty');
        return;
      }

      setStatus('error');
      setErrorMessage(
        getApiError(error, 'About ma’lumotlarini yuklab bo‘lmadi.'),
      );
    }
  }, []);

  const saveAbout: AboutContextValue['saveAbout'] = useCallback(
    async (input) => {
      setSaving(true);

      try {
        const updatedAbout = await aboutApi.update(input);

        setAbout(updatedAbout);
        setStatus('ready');
        setErrorMessage('');

        return updatedAbout;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      about,
      status,
      errorMessage,
      saving,
      refreshAbout,
      saveAbout,
    }),
    [about, status, errorMessage, saving, refreshAbout, saveAbout],
  );

  return (
    <AboutContext.Provider value={value}>{children}</AboutContext.Provider>
  );
}
