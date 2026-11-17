import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import ArtworkModal from './ArtworkModal.jsx';
import Portal from './Portal.jsx';
import { groupByRoom, roman } from '../utils/format.js';
import StatusMessage from './StatusMessage.jsx';

/**
 * Sección del sitio (Inicio y Sobre nosotros). El contenido se pide a la API,
 * que responde 403 si el visitante no ha completado el recorrido; en ese caso aquí
 * solo se muestra el aviso de bloqueo, sin contenido.
 */
export default function SiteSection({ slug, artworks = [], onBackToMuseum }) {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null });

    api
      .getSection(slug)
      .then((data) => !cancelled && setState({ status: 'ready', data }))
      .catch((err) => {
        if (cancelled) return;
        setState({ status: err.status === 403 ? 'locked' : 'error', data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  if (state.status === 'loading') {
    return <StatusMessage busy title="Cargando…" />;
  }
  if (state.status === 'locked') {
    return (
      <StatusMessage
        title="Sección bloqueada"
        text="Descubre todas las obras del museo para abrir esta parte del sitio."
        actionLabel="Volver al museo"
        onAction={onBackToMuseum}
      />
    );
  }
  if (state.status === 'error') {
    return (
      <StatusMessage
        title="No se pudo cargar la sección"
        text="Revisa tu conexión e inténtalo de nuevo."
        actionLabel="Reintentar"
        onAction={() => setAttempt((n) => n + 1)}
      />
    );
  }

  const { title, subtitle, paragraphs, people = [] } = state.data;
  const rooms = slug === 'inicio' ? groupByRoom(artworks) : [];

  return (
    <article className={`site-section site-section--${slug}`}>
      <div className="site-section__inner">
        <p className="eyebrow">{slug === 'inicio' ? 'Más allá de la exposición' : 'Sitio'}</p>
        <h1>{title}</h1>
        {subtitle && <p className="site-section__lead">{subtitle}</p>}

        <div className="site-section__body">
          {paragraphs.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>

        {rooms.length > 0 && (
          <div className="catalog">
            {rooms.map((room) => (
              <section key={room.id} className="catalog__room" aria-labelledby={`cat-${room.id}`}>
                <h2 id={`cat-${room.id}`}>
                  <small>Sala {roman(room.id)}</small> {room.name}
                </h2>
                <ol className="catalog__grid">
                  {room.artworks.map((art) => (
                    <li key={art.slug}>
                      <button type="button" className="catalog__item" onClick={() => setSelected(art)}>
                        <span className="catalog__img" style={{ '--aspect': art.aspect }}>
                          <img src={art.imageUrl} alt={art.alt || art.title} loading="lazy" />
                        </span>
                        <strong>{art.title}</strong>
                        <span>{art.author} · {art.date}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}

        {people.length > 0 && (
          <ul className="people">
            {people.map((person, i) => (
              <li key={i} className="person">
                {person.photo ? (
                  <img className="person__photo" src={person.photo} alt={person.name} loading="lazy" />
                ) : (
                  <span className="person__photo person__photo--initials" aria-hidden="true">
                    {person.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                )}
                <h2>{person.name}</h2>
                <p className="person__role">{person.role}</p>
                <p>{person.bio}</p>
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="btn site-section__back" onClick={onBackToMuseum}>
          ← Volver al museo
        </button>
      </div>

      {selected && (
        <Portal>
          <ArtworkModal artwork={selected} onClose={() => setSelected(null)} />
        </Portal>
      )}
    </article>
  );
}
