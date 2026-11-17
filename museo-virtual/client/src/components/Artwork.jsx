import { useInView } from '../hooks/useInView.js';

/**
 * Una obra colgada en la pared: marco, paspartú, foco de luz y placa.
 * Es un botón accesible; al activarlo avisa a la sala con `onOpen`.
 */
export default function Artwork({ artwork, discovered, index, onOpen }) {
  const [ref, inView] = useInView({ threshold: 0.25 });

  return (
    <article
      ref={ref}
      className={`artwork${inView ? ' is-in' : ''}${discovered ? ' is-discovered' : ''}`}
      style={{ '--aspect': artwork.aspect, '--delay': `${index * 140}ms` }}
    >
      <span className="artwork__lamp" aria-hidden="true" />
      <span className="artwork__spot" aria-hidden="true" />

      <button
        type="button"
        className="artwork__button"
        onClick={() => onOpen(artwork)}
        aria-label={`Ver obra: ${artwork.title}${discovered ? ' (ya descubierta)' : ''}`}
      >
        <span className="artwork__frame">
          <span className="artwork__mat">
            <img
              src={artwork.imageUrl}
              alt={artwork.alt || artwork.title}
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </span>
        </span>

        <span className="artwork__badge" aria-hidden="true">
          {discovered && (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </button>

      <div className="artwork__plaque">
        <strong>{artwork.title}</strong>
        <span>{discovered ? `${artwork.author} · ${artwork.date}` : 'Toca para descubrir'}</span>
      </div>
    </article>
  );
}
