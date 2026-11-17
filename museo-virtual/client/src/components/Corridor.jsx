import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { caption, roman } from '../utils/format.js';
import { FINALE } from '../config.js';
import { build, W, H, EYE, STEP } from '../utils/corridorLayout.js';

/**
 * Museo en 3D con CSS puro. Todo el recorrido es una sola página: el scroll (rueda,
 * flechas, gestos táctiles) mueve la cámara; cada sala es un pasillo y entre ellas
 * se gira a la izquierda.
 */
export default function Corridor({ rooms, visited, onOpenArtwork, onOpenFinale, onReady, onRoomChange }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const worldRef = useRef(null);
  const [hall, setHall] = useState(0);
  const { halls, total, camAt } = useMemo(() => build(rooms), [rooms]);

  const scrolled = useCallback(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return 0;
    const stuckTop = parseFloat(getComputedStyle(stage).top) || 0;
    return Math.min(total, Math.max(0, stuckTop - section.getBoundingClientRect().top));
  }, [total]);

  const update = useCallback(() => {
    const s = scrolled();
    const c = camAt(s);
    if (worldRef.current && stageRef.current) {
      // El ojo del navegador está a `perspective` px delante del plano z=0: lo traemos
      // a la posición de la cámara para estar DENTRO del museo y girar sobre el propio ojo.
      const persp = parseFloat(getComputedStyle(stageRef.current).perspective) || 700;
      worldRef.current.style.transform = `translateZ(${persp}px) rotateY(${-c.yaw}deg) translate3d(${-c.x}px, ${-EYE}px, ${-c.z}px)`;
    }
    stageRef.current?.style.setProperty('--intro', String(Math.max(0, 1 - s / 320)));
    setHall(c.hall);
  }, [scrolled, camAt]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [update]);

  const goTo = useCallback(
    (target) => window.scrollBy({ top: target - scrolled(), behavior: 'smooth' }),
    [scrolled],
  );

  // Teclado: flechas / W S / RePág AvPág / espacio.
  useEffect(() => {
    const onKey = (e) => {
      if (document.querySelector('[role="dialog"]')) return;
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const down = ['ArrowDown', 's', 'S', 'PageDown', ' '].includes(e.key);
      const up = ['ArrowUp', 'w', 'W', 'PageUp'].includes(e.key);
      if (!down && !up) return;
      const r = sectionRef.current?.getBoundingClientRect();
      if (!r || r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5) return;
      e.preventDefault();
      const big = e.key === 'PageDown' || e.key === 'PageUp' || e.key === ' ';
      window.scrollBy({ top: (down ? 1 : -1) * (big ? STEP : 140), behavior: 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    onReady?.((i) => halls[i] && goTo(halls[i].start));
  }, [halls, goTo, onReady]);

  useEffect(() => {
    onRoomChange?.(hall);
  }, [hall, onRoomChange]);

  const active = halls[hall];

  return (
    <section
      ref={sectionRef}
      className="corridor"
      style={{ '--w': `${W}px`, '--h': `${H}px`, height: `calc(${total}px + var(--stage-h))` }}
      aria-label="Recorrido del museo"
    >
      <div ref={stageRef} className="corridor__stage">
        <div ref={worldRef} className="corridor__world">
          <Hall halls={halls} k={0} active={hall} visited={visited} onOpen={onOpenArtwork} onFinale={onOpenFinale} />
        </div>
        <div className="corridor__fog" aria-hidden="true" />

        <div className="corridor__intro" aria-hidden="true">
          <p className="eyebrow">Exposición</p>
          <h1>Bienvenido al museo</h1>
          <p>Avanza con scroll, flechas o deslizando. Abre cada obra para descubrir su historia.</p>
        </div>

        {active && (
          <p className="corridor__hud" aria-live="polite">
            <span>Sala {roman(active.room.id)}</span> {active.room.name}
          </p>
        )}
      </div>
    </section>
  );
}

const ART_GAP = 2; // las obras de la pared izquierda cuelgan a esta distancia de la pared
const SEAM = 2; // cada tramo se solapa 2 px con el siguiente para que no se vea la costura
const ART_SPAN = 340; // ancho del tramo de pared que sostiene una obra de la derecha
const TILE = 200; // las paredes y el piso se parten en tramos: un plano largo que atraviesa la cámara no se dibuja bien

/** Divide una longitud en tramos [inicio, largo]. */
function tiles(length) {
  const out = [];
  for (let start = 0; start < length; start += TILE) out.push([start, Math.min(TILE, length - start)]);
  return out;
}

/**
 * Tramos de la pared derecha: cada obra tiene su propio tramo, y la obra cuelga DENTRO de él
 * (en el mismo plano). Así no depende del orden de profundidad del navegador, que pintaba la
 * pared derecha encima de las obras. Devuelve [{ start, size, art? }].
 */
function rightTiles(hall) {
  const out = [];
  let pos = 0;
  const arts = hall.arts.filter((a) => a.side === 'right').sort((a, b) => a.d - b.d);
  const push = (from, to) => {
    for (let st = from; st < to; st += TILE) out.push({ start: st, size: Math.min(TILE, to - st) });
  };
  arts.forEach((it) => {
    const a = Math.max(pos, it.d - ART_SPAN / 2);
    const b = Math.min(hall.len, it.d + ART_SPAN / 2);
    push(pos, a);
    out.push({ start: a, size: b - a, art: it });
    pos = b;
  });
  push(pos, hall.len);
  return out;
}

/** Un pasillo. El siguiente va anidado: nace en la pared izquierda, girado 90°. */
function Hall({ halls, k, active, visited, onOpen, onFinale }) {
  const h = halls[k];
  const prev = halls[k - 1];
  const next = halls[k + 1];
  const place = prev
    ? { transform: `translate3d(${-W / 2}px, 0, ${-prev.len + W / 2}px) rotateY(90deg)` }
    : undefined;

  return (
    <div className={`hall${k === active ? ' is-active' : ''}`} style={place}>
      {tiles(h.len).map(([start, size]) => (
        <Fragment key={`f${start}`}>
          <div
            className="cw cw--floor"
            style={{ height: size + SEAM, transform: `translateZ(${-start}px) rotateX(-90deg)`, backgroundPosition: `0 ${-start}px, 0 0` }}
          />
          <div
            className="cw cw--ceiling"
            style={{ height: size + SEAM, transform: `translateZ(${-start}px) rotateX(-90deg)` }}
          />
          {start < h.leftLen && (
            <div
              className="cw cw--left"
              style={{ width: Math.min(size + SEAM, h.leftLen - start), transform: `translateZ(${-start}px) rotateY(90deg)` }}
            />
          )}
        </Fragment>
      ))}

      {/* Pared derecha: sus obras cuelgan dentro del propio tramo de pared. */}
      {rightTiles(h).map((t) => (
        <div
          key={`r${t.start}`}
          className="cw cw--right"
          style={{ width: t.size + SEAM, left: W / 2 - t.size - SEAM, transform: `translateZ(${-t.start}px) rotateY(-90deg)` }}
        >
          {t.art && <WallArtwork it={t.art} visited={visited} onOpen={onOpen} local={{ x: t.size + SEAM - (t.art.d - t.start) }} />}
        </div>
      ))}

      {/* Pared izquierda: las obras son planos propios, un poco separados de la pared. */}
      {h.arts
        .filter((it) => it.side === 'left')
        .map((it) => (
          <WallArtwork key={it.artwork.slug} it={it} visited={visited} onOpen={onOpen} />
        ))}

      <div className="cw cw--end" style={{ transform: `translateZ(${-h.len}px)` }}>
        {next ? (
          <>
            <small>Sala {roman(next.room.id)}</small>
            <p>{next.room.name}</p>
          </>
        ) : (
          <div className="finale">
            <button type="button" className="finale__frame" onClick={() => onFinale?.(FINALE)} aria-label={`Ver: ${FINALE.title}`}>
              <span className="finale__mat">
                <img src={FINALE.image} alt={FINALE.alt} draggable="false" decoding="async" />
              </span>
            </button>
            <p>{FINALE.caption}</p>
          </div>
        )}
      </div>
      {next && <Hall halls={halls} k={k + 1} active={active} visited={visited} onOpen={onOpen} onFinale={onFinale} />}
    </div>
  );
}

function WallArtwork({ it, visited, onOpen, local }) {
  const { artwork, d, side } = it;
  const discovered = visited.has(artwork.slug);
  // `local`: la obra va dentro de un tramo de pared (mismo plano), centrada en (x, centro de la pared).
  const placement = local
    ? { left: `${local.x}px`, top: 'calc(50% - 18px)', transform: 'translate(-50%, -50%)' }
    : {
        transform: `translate3d(${-W / 2 + ART_GAP}px, 0, ${-d}px) rotateY(90deg) translate(-50%, -50%)`,
      };
  return (
    <div
      className={`wa wa--${side}${discovered ? ' is-discovered' : ''}`}
      style={{ '--aspect': artwork.aspect, ...placement }}
    >
      <span className="wa__spot" aria-hidden="true" />
      <span className="wa__lamp" aria-hidden="true" />
      <button
        type="button"
        className="wa__button"
        onClick={() => onOpen(artwork)}
        aria-label={`Ver obra: ${artwork.title}${discovered ? ' (ya descubierta)' : ''}`}
      >
        <span className="wa__frame">
          <span className="wa__mat">
            <img src={artwork.imageUrl} alt={artwork.alt || artwork.title} draggable="false" decoding="async" />
          </span>
        </span>
        <span className="wa__badge" aria-hidden="true">{discovered ? '✓' : ''}</span>
      </button>
      <div className="wa__plaque">
        <strong>{artwork.title}</strong>
        <span>{discovered ? caption(artwork) : 'Toca para descubrir'}</span>
      </div>
    </div>
  );
}
