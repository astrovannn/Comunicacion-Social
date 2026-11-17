import Artwork from './Artwork.jsx';
import { roman } from '../utils/format.js';

/**
 * Una sala: arco de entrada, rótulo, obras en la pared y suelo.
 * `sectionRef` permite al museo saber qué sala está a la vista.
 */
export default function MuseumRoom({ room, visited, isLast, sectionRef, onOpenArtwork }) {
  const seen = room.artworks.filter((a) => visited.has(a.slug)).length;

  return (
    <section
      ref={sectionRef}
      className="room"
      aria-labelledby={`room-${room.id}-title`}
      data-room={room.id}
    >
      <div className="room__wall">
        <div className="room__arch" aria-hidden="true" />

        <header className="room__header">
          <p className="eyebrow">Sala {roman(room.id)}</p>
          <h2 id={`room-${room.id}-title`} className="room__title">
            {room.name}
          </h2>
          <p className="room__count">
            {seen} de {room.artworks.length} obras descubiertas
          </p>
        </header>

        <div className="room__artworks">
          {room.artworks.map((artwork, i) => (
            <Artwork
              key={artwork.slug}
              artwork={artwork}
              index={i}
              discovered={visited.has(artwork.slug)}
              onOpen={onOpenArtwork}
            />
          ))}
        </div>

        {!isLast && (
          <p className="room__next" aria-hidden="true">
            Siguiente sala <span>↓</span>
          </p>
        )}
      </div>

      <div className="room__baseboard" aria-hidden="true" />
      <div className="room__floor" aria-hidden="true" />
    </section>
  );
}
