import { Artwork } from '../models/Artwork.js';
import { Visit } from '../models/Visit.js';

/**
 * Calcula el progreso de un visitante. Es la ÚNICA fuente de verdad sobre si
 * el recorrido está completo: el cliente solo puede mostrar lo que esto devuelva.
 *
 * Como se recalcula en cada consulta, si se agrega una obra obligatoria nueva
 * el sitio vuelve a bloquearse hasta que el visitante la descubra.
 */
export async function getProgress(visitorId) {
  const [mandatory, visits] = await Promise.all([
    Artwork.find({ mandatory: true }).select('slug -_id').lean(),
    Visit.find({ visitorId }).select('artworkSlug -_id').lean(),
  ]);

  const visited = visits.map((v) => v.artworkSlug);
  const visitedSet = new Set(visited);
  const requiredTotal = mandatory.length;
  const requiredDone = mandatory.filter((a) => visitedSet.has(a.slug)).length;

  return {
    visited,
    requiredDone,
    requiredTotal,
    // Sin obras cargadas nunca se considera completo (evita desbloquear una BD vacía).
    completed: requiredTotal > 0 && requiredDone === requiredTotal,
  };
}
