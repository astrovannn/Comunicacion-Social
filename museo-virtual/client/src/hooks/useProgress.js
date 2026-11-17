import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

const CACHE_KEY = 'museo.visited.v1';

function readCache() {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list));
  } catch {
    // almacenamiento no disponible (modo privado, cuota…): se ignora
  }
}

/**
 * Progreso del recorrido.
 *
 *  - `visited`: obras descubiertas. Se pinta al instante desde localStorage y luego
 *    se reconcilia con el servidor (el servidor siempre gana).
 *  - `completed`: viene SOLO del servidor. localStorage nunca puede desbloquear nada;
 *    por eso empieza en false hasta que `ready` es true.
 */
export function useProgress() {
  const [visited, setVisited] = useState(() => new Set(readCache()));
  const [completed, setCompleted] = useState(false);
  const [ready, setReady] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const completedRef = useRef(false);

  // La caché local es solo una comodidad visual.
  useEffect(() => {
    writeCache([...visited]);
  }, [visited]);

  const apply = useCallback((data, { announce, replace }) => {
    const list = Array.isArray(data.visited) ? data.visited : [];
    setVisited((prev) => new Set(replace ? list : [...prev, ...list]));

    const isCompleted = Boolean(data.completed);
    setCompleted(isCompleted);
    // La animación de finalización solo aparece en la sesión en que se completa, no al recargar.
    if (announce && isCompleted && !completedRef.current) setJustCompleted(true);
    completedRef.current = isCompleted;
  }, []);

  // Sincronización inicial.
  useEffect(() => {
    let cancelled = false;
    api
      .getProgress()
      .then((data) => {
        if (cancelled) return;
        apply(data, { announce: false, replace: true });
        setReady(true);
      })
      .catch(() => !cancelled && setReady(true)); // sin servidor: queda bloqueado
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // Registra una visita en el servidor (idempotente), con hasta 2 reintentos.
  const send = useCallback(
    function run(slug, attempt = 0) {
      api
        .visitArtwork(slug)
        .then((data) => apply(data, { announce: true, replace: false }))
        .catch(() => {
          if (attempt < 2) setTimeout(() => run(slug, attempt + 1), 2000 * (attempt + 1));
        });
    },
    [apply],
  );

  const markVisited = useCallback(
    (slug) => {
      // Marca optimista para respuesta inmediata; el servidor confirma.
      setVisited((prev) => (prev.has(slug) ? prev : new Set(prev).add(slug)));
      send(slug);
    },
    [send],
  );

  const dismissCompletion = useCallback(() => setJustCompleted(false), []);

  return { visited, completed, ready, justCompleted, markVisited, dismissCompletion };
}
