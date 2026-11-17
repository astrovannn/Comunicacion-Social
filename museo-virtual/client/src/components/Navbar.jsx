import { SITE_NAME } from '../config.js';

const ITEMS = [
  { id: 'museo', label: 'Museo', protected: false },
  { id: 'inicio', label: 'Inicio', protected: true },
  { id: 'sobre-mi', label: 'Sobre nosotros', protected: true },
];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

/**
 * Navegación principal. Las secciones protegidas se muestran bloqueadas hasta que
 * el servidor confirme el recorrido completo (`completed`).
 */
export default function Navbar({ view, completed, onNavigate, onLockedClick }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <button type="button" className="navbar__brand" onClick={() => onNavigate('museo')}>
          {SITE_NAME}
        </button>

        <nav aria-label="Principal">
          <ul className="navbar__list">
            {ITEMS.map((item) => {
              const locked = item.protected && !completed;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`navbar__link${view === item.id ? ' is-current' : ''}${locked ? ' is-locked' : ''}`}
                    aria-current={view === item.id ? 'page' : undefined}
                    aria-disabled={locked || undefined}
                    title={locked ? 'Completa el recorrido para desbloquear' : undefined}
                    onClick={() => (locked ? onLockedClick() : onNavigate(item.id))}
                  >
                    {locked && <LockIcon />}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
