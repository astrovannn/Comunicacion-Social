import { useCallback, useMemo, useRef, useState } from 'react';
import Corridor from './Corridor.jsx';
import Portal from './Portal.jsx';
import ArtworkModal from './ArtworkModal.jsx';
import ProgressBar from './ProgressBar.jsx';
import CompletionOverlay from './CompletionOverlay.jsx';
import { groupByRoom, roman } from '../utils/format.js';

/**
 * Estructura principal del museo: bienvenida, salas, navegación entre salas,
 * barra de progreso, modal de obra y animación de finalización.
 */
export default function Museum({
  artworks,
  visited,
  done,
  total,
  completed,
  justCompleted,
  onDiscover,
  onEnterSite,
  onDismissCompletion,
}) {
  const [selected, setSelected] = useState(null);
  const [activeRoom, setActiveRoom] = useState(0);
  const goToRoomRef = useRef(null);
  const rooms = useMemo(() => groupByRoom(artworks), [artworks]);

  // Abrir una obra la marca como descubierta (el servidor evita contarla dos veces).
  const openArtwork = useCallback(
    (artwork) => {
      setSelected(artwork);
      onDiscover(artwork.slug);
    },
    [onDiscover],
  );
  const closeArtwork = useCallback(() => setSelected(null), []);

  const goToRoom = (index) => {
    goToRoomRef.current?.(index);
  };
  const registerNav = useCallback((fn) => {
    goToRoomRef.current = fn;
  }, []);

  // La animación final espera a que el visitante cierre la última obra que estaba leyendo.
  const showCompletion = justCompleted && !selected;

  return (
    <div className="museum">
      <ProgressBar done={done} total={total} completed={completed} onEnterSite={onEnterSite} />

      <Corridor rooms={rooms} visited={visited} onOpenArtwork={openArtwork} onOpenFinale={setSelected} onReady={registerNav} onRoomChange={setActiveRoom} />

      {rooms.length > 1 && (
        <nav className="room-nav" aria-label="Salas del museo">
          {rooms.map((room, i) => (
            <button
              key={room.id}
              type="button"
              className={i === activeRoom ? 'is-active' : ''}
              aria-label={`Ir a la sala ${roman(room.id)}: ${room.name}`}
              aria-current={i === activeRoom ? 'true' : undefined}
              onClick={() => goToRoom(i)}
            />
          ))}
        </nav>
      )}

      {selected && (
        <Portal>
          <ArtworkModal artwork={selected} onClose={closeArtwork} />
        </Portal>
      )}

      {showCompletion && (
        <Portal>
          <CompletionOverlay
          total={total}
          onEnter={() => {
            onDismissCompletion();
            onEnterSite();
          }}
          onStay={onDismissCompletion}
        />
        </Portal>
      )}
    </div>
  );
}
