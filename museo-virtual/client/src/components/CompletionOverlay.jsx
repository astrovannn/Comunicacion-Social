import { useEffect, useRef } from 'react';

/**
 * Animación de finalización: telón que se abre y mensaje con acceso al sitio.
 * Solo se muestra en la sesión en la que se completa el recorrido.
 */
export default function CompletionOverlay({ total, onEnter, onStay }) {
  const enterRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => enterRef.current?.focus({ preventScroll: true }), 1200);
    const onKeyDown = (event) => event.key === 'Escape' && onStay();
    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onStay]);

  return (
    <div className="completion" role="dialog" aria-modal="true" aria-labelledby="completion-title">
      <div className="completion__curtain completion__curtain--left" aria-hidden="true" />
      <div className="completion__curtain completion__curtain--right" aria-hidden="true" />

      <div className="completion__content">
        <svg className="completion__emblem" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M19 33.5l9 9L46 23" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="eyebrow">Recorrido completado</p>
        <h2 id="completion-title">Has descubierto las {total} obras</h2>
        <p>El resto del sitio acaba de abrirse para ti.</p>
        <div className="completion__actions">
          <button ref={enterRef} type="button" className="btn btn--solid" onClick={onEnter}>
            Entrar al sitio
          </button>
          <button type="button" className="btn" onClick={onStay}>
            Seguir en el museo
          </button>
        </div>
      </div>
    </div>
  );
}
