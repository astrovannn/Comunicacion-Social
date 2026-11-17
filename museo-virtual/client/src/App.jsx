import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Museum from './components/Museum.jsx';
import SiteSection from './components/SiteSection.jsx';
import StatusMessage from './components/StatusMessage.jsx';
import { useArtworks } from './hooks/useArtworks.js';
import { useProgress } from './hooks/useProgress.js';
import { useHashView } from './hooks/useHashView.js';

const PROTECTED_VIEWS = ['inicio', 'sobre-mi'];

/**
 * Control general: decide qué vista se muestra y cuándo el sitio está desbloqueado.
 *
 * `completed` proviene exclusivamente del servidor (useProgress). Aunque alguien
 * fuerce una vista protegida desde la URL o el DOM, el contenido real solo se
 * entrega desde /api/site/*, que valida el recorrido en el backend.
 */
export default function App() {
  const { artworks, status, reload } = useArtworks();
  const { visited, completed, ready, justCompleted, markVisited, dismissCompletion } = useProgress();
  const [view, navigate] = useHashView();
  const [toast, setToast] = useState(null);

  const mandatory = useMemo(() => artworks.filter((a) => a.mandatory), [artworks]);
  const done = useMemo(() => mandatory.filter((a) => visited.has(a.slug)).length, [mandatory, visited]);
  const total = mandatory.length;

  const wantsProtected = PROTECTED_VIEWS.includes(view);
  const locked = wantsProtected && !completed;
  const checking = wantsProtected && !ready; // aún no sabemos qué dice el servidor
  const effectiveView = locked ? 'museo' : view;

  const showToast = useCallback((message) => setToast({ message, id: Date.now() }), []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Si el servidor confirma que sigue bloqueado, se corrige la URL y se vuelve al museo.
  useEffect(() => {
    if (ready && locked) {
      navigate('museo', { replace: true });
      showToast('Esa sección se abre al terminar el recorrido.');
    }
  }, [ready, locked, navigate, showToast]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [effectiveView]);

  const goToMuseum = useCallback(() => navigate('museo'), [navigate]);
  const enterSite = useCallback(() => navigate('inicio'), [navigate]);

  let content;
  if (checking) {
    content = <StatusMessage busy title="Verificando tu recorrido…" />;
  } else if (effectiveView === 'museo') {
    if (status === 'loading') {
      content = <StatusMessage busy title="Abriendo las salas…" />;
    } else if (status === 'error' || artworks.length === 0) {
      content = (
        <StatusMessage
          title="El museo está cerrado por ahora"
          text="No se pudieron cargar las obras. Comprueba que el servidor esté en marcha."
          actionLabel="Reintentar"
          onAction={reload}
        />
      );
    } else {
      content = (
        <Museum
          artworks={artworks}
          visited={visited}
          done={done}
          total={total}
          completed={completed}
          justCompleted={justCompleted}
          onDiscover={markVisited}
          onEnterSite={enterSite}
          onDismissCompletion={dismissCompletion}
        />
      );
    }
  } else {
    content = <SiteSection slug={effectiveView} artworks={artworks} onBackToMuseum={goToMuseum} />;
  }

  return (
    <div className="app" data-theme={effectiveView === 'museo' ? 'museum' : 'site'}>
      <Navbar
        view={effectiveView}
        completed={completed}
        onNavigate={navigate}
        onLockedClick={() =>
          showToast(
            total > 0
              ? `Descubre las ${total} obras para abrir el sitio (llevas ${done}).`
              : 'Completa el recorrido para abrir el sitio.',
          )
        }
      />

      <main key={effectiveView} className="view">
        {content}
      </main>

      {toast && (
        <div key={toast.id} className="toast" role="status">
          {toast.message}
        </div>
      )}
    </div>
  );
}
