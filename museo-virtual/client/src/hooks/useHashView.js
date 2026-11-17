import { useCallback, useEffect, useState } from 'react';

export const VIEWS = ['museo', 'inicio', 'sobre-mi'];

const read = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  return VIEWS.includes(h) ? h : 'museo';
};

/**
 * Navegación mínima basada en el hash (#/inicio) sin dependencias de router.
 * Esto solo decide QUÉ vista se intenta mostrar; que se pueda ver lo decide el servidor.
 */
export function useHashView() {
  const [view, setView] = useState(read);

  useEffect(() => {
    const onChange = () => setView(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next, { replace = false } = {}) => {
    if (!VIEWS.includes(next)) return;
    if (replace) {
      window.history.replaceState(null, '', `#/${next}`);
      setView(next);
    } else if (window.location.hash === `#/${next}`) {
      setView(next);
    } else {
      window.location.hash = `/${next}`;
    }
  }, []);

  return [view, navigate];
}
