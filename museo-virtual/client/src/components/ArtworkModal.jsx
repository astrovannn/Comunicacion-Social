import { useCallback, useEffect, useRef, useState } from 'react';
import { roman } from '../utils/format.js';

const CLOSE_MS = 260; // debe coincidir con la animación de cierre en modal.css

/**
 * Ventana modal con la obra ampliada y su ficha.
 * Accesible: role="dialog", cierre con Esc / clic fuera, foco atrapado y devuelto al cerrar.
 */
export default function ArtworkModal({ artwork, onClose }) {
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const timerRef = useRef(null);

  const requestClose = useCallback(() => {
    setClosing((already) => {
      if (!already) timerRef.current = setTimeout(onClose, CLOSE_MS);
      return true;
    });
  }, [onClose]);

  // Foco, bloqueo del scroll de fondo y limpieza.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus({ preventScroll: true });

    return () => {
      clearTimeout(timerRef.current);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  // Teclado: Esc cierra, Tab queda dentro del modal.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [requestClose]);

  const specs = [
    ['Autor', artwork.author],
    ['Fecha', artwork.date],
    ['Técnica', artwork.technique],
    ['Dimensiones', artwork.dimensions],
    ['Sala', artwork.room ? `${roman(artwork.room)} · ${artwork.roomName}` : null],
    ...(artwork.extra ?? []).map((item) => [item.label, item.value]),
  ].filter(([, value]) => value);
  const titleId = `modal-title-${artwork.slug}`;

  return (
    <div
      className={`modal-backdrop${closing ? ' is-closing' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="modal__close"
          onClick={requestClose}
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        <figure className="modal__figure">
          <img src={artwork.imageUrl} alt={artwork.alt || artwork.title} />
        </figure>

        <div className="modal__body">
          <p className="eyebrow">Obra descubierta</p>
          <h2 id={titleId} className="modal__title">
            {artwork.title}
          </h2>
          <p className="modal__description">{artwork.description}</p>

          <dl className="modal__specs">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <button type="button" className="btn btn--solid" onClick={requestClose}>
            Volver al recorrido
          </button>
        </div>
      </div>
    </div>
  );
}
