import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

/** Carga el catálogo de obras desde la API. status: 'loading' | 'ready' | 'error'. */
export function useArtworks() {
  const [state, setState] = useState({ status: 'loading', artworks: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));

    api
      .getArtworks()
      .then((artworks) => !cancelled && setState({ status: 'ready', artworks }))
      .catch(() => !cancelled && setState({ status: 'error', artworks: [] }));

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
