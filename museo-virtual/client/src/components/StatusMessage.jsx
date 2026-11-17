/** Mensaje centrado para estados de carga, error o bloqueo. */
export default function StatusMessage({ title, text, actionLabel, onAction, busy = false }) {
  return (
    <div className="status" role={busy ? 'status' : 'alert'} aria-busy={busy || undefined}>
      <div>
        {busy && <span className="status__spinner" aria-hidden="true" />}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
        {actionLabel && (
          <button type="button" className="btn btn--solid" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
