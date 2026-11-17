// Medidas del museo en px (el CSS las recibe como variables).
export const W = 520; // ancho del pasillo
export const H = 400; // alto
export const EYE = 70; // la cámara va por debajo del centro: así se ve bien el piso
export const STEP = 340; // separación entre obras
const FIRST = 640; // distancia de la primera obra desde el inicio del pasillo
const TURN = 380; // scroll que dura cada giro
const START_U = 60; // la cámara arranca un poco dentro del primer pasillo
const STOP = 260; // en el último pasillo, la cámara se detiene a esta distancia del final
const CLEARANCE = 160; // separación mínima entre pasillos que no son vecinos
const PAD_STEP = 80; // cuánto se alarga un pasillo en cada intento
const PAD_MAX = 3200;

const rad = Math.PI / 180;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));

/** Posiciones y largos de cada pasillo. `pads[k]` alarga el pasillo k (reparte las obras y el final). */
function layout(rooms, pads) {
  const halls = rooms.map((room, k) => {
    const n = room.artworks.length;
    const hasNext = k < rooms.length - 1;
    const pad = pads[k] || 0;
    // Mitad del alargue separa las obras entre sí; la otra mitad queda como pasillo libre al final.
    const step = STEP + (n > 1 ? pad / 2 / (n - 1) : 0);
    const lastD = FIRST + (n - 1) * step;
    const tail = pad - (n > 1 ? pad / 2 : 0);
    const len = hasNext ? lastD + 200 + W + tail : lastD + 600; // el último tramo W es la esquina
    return {
      room,
      k,
      hasNext,
      len,
      leftLen: hasNext ? len - W : len, // la pared izquierda se abre en la esquina
      arts: room.artworks.map((artwork, i) => ({ artwork, d: FIRST + i * step, side: i % 2 === 0 ? 'left' : 'right' })),
    };
  });

  const toWorld = (h, lx, lz) => {
    const a = h.k * 90 * rad;
    return { x: h.ox + lx * Math.cos(a) + lz * Math.sin(a), z: h.oz - lx * Math.sin(a) + lz * Math.cos(a) };
  };
  halls.forEach((h, k) => {
    if (k === 0) Object.assign(h, { ox: 0, oz: 0 });
    else {
      const p = halls[k - 1];
      const o = toWorld(p, -W / 2, -p.len + W / 2);
      Object.assign(h, { ox: o.x, oz: o.z });
    }
  });
  return { halls, toWorld };
}

/** Rectángulo (en el mundo) que ocupa un pasillo. */
function rectOf(h, toWorld) {
  const pts = [[-W / 2, 0], [W / 2, 0], [W / 2, -h.len], [-W / 2, -h.len]].map(([x, z]) => toWorld(h, x, z));
  const xs = pts.map((p) => p.x);
  const zs = pts.map((p) => p.z);
  return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
}

/** Primer par de pasillos no vecinos que se pisan (o quedan a menos de CLEARANCE); null si todo está libre. */
function findOverlap(halls, toWorld) {
  const rects = halls.map((h) => rectOf(h, toWorld));
  for (let j = 2; j < rects.length; j++) {
    for (let i = 0; i <= j - 2; i++) {
      const a = rects[i];
      const b = rects[j];
      const hit = a.x0 < b.x1 + CLEARANCE && b.x0 < a.x1 + CLEARANCE && a.z0 < b.z1 + CLEARANCE && b.z0 < a.z1 + CLEARANCE;
      if (hit) return { i, j };
    }
  }
  return null;
}

/**
 * Arma la geometría: cada sala es un pasillo; entre pasillos hay un giro a la izquierda.
 * Marco de cada pasillo: x a la derecha, z hacia adelante = -z, origen en su inicio.
 * El pasillo siguiente nace en la pared izquierda del anterior, girado 90°.
 *
 * Con 4 o más salas el recorrido da la vuelta y el último pasillo podría atravesar el primero:
 * si se detecta, se alarga el segundo pasillo (con obras más espaciadas) hasta que quepa todo.
 */
export function build(rooms) {
  const pads = rooms.map(() => 0);
  let { halls, toWorld } = layout(rooms, pads);
  for (let tries = 0; rooms.length > 3 && tries < PAD_MAX / PAD_STEP; tries++) {
    if (!findOverlap(halls, toWorld)) break;
    pads[1] += PAD_STEP;
    ({ halls, toWorld } = layout(rooms, pads));
  }

  // Recorrido de la cámara: tramo recto por pasillo + giro en la esquina.
  let s = 0;
  const segs = [];
  halls.forEach((h) => {
    const u0 = h.k === 0 ? START_U : -W / 2;
    const u1 = h.hasNext ? h.len - W / 2 : h.len - STOP;
    h.start = s;
    segs.push({ type: 'walk', h, u0, u1, s0: s, s1: s + (u1 - u0) });
    s += u1 - u0;
    if (h.hasNext) {
      segs.push({ type: 'turn', h, s0: s, s1: s + TURN });
      s += TURN;
    }
  });

  const camAt = (pos) => {
    const p = Math.min(s, Math.max(0, pos));
    const seg = segs.find((g) => p <= g.s1) || segs[segs.length - 1];
    const { h } = seg;
    if (seg.type === 'walk') {
      const w = toWorld(h, 0, -(seg.u0 + p - seg.s0));
      return { ...w, yaw: h.k * 90, hall: h.k };
    }
    const t = (p - seg.s0) / TURN;
    const w = toWorld(h, 0, -(h.len - W / 2));
    return { ...w, yaw: h.k * 90 + 90 * ease(t), hall: t > 0.5 ? h.k + 1 : h.k };
  };

  return { halls, total: s, camAt, turn: TURN };
}
