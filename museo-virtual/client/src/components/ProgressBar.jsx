/** Indicador fijo de cuántas obras obligatorias lleva descubiertas el visitante. */
export default function ProgressBar({ done, total, completed, onEnterSite }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="progress">
      <div className="progress__inner">
        <p className="progress__label">
          <strong>
            {done} de {total}
          </strong>{' '}
          obras descubiertas
        </p>

        <div
          className="progress__track"
          role="progressbar"
          aria-label="Progreso del recorrido"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <div className="progress__fill" style={{ width: `${percent}%` }} />
        </div>

        {completed ? (
          <button type="button" className="progress__cta" onClick={onEnterSite}>
            Entrar al sitio →
          </button>
        ) : (
          <span className="progress__hint">Descubre todas para abrir el sitio</span>
        )}
      </div>
    </div>
  );
}
