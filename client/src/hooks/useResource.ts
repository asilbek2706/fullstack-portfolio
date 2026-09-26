import { useEffect, useState } from 'react';
import { apiError } from '../api/portfolioApi';

export function useResource<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{
    data: T | null;
    error: string;
    loading: boolean;
  }>({ data: null, error: '', loading: true });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ data, error: '', loading: false });
      },
      (error: unknown) => {
        if (!controller.signal.aborted)
          setState({ data: null, error: apiError(error), loading: false });
      },
    );
    return () => controller.abort();
  }, [loader, revision]);
  const reload = () => {
    setState((previous) => ({ ...previous, loading: true, error: '' }));
    setRevision((value) => value + 1);
  };
  return { ...state, reload };
}
