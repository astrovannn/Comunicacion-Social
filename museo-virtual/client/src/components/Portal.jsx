import { createPortal } from 'react-dom';

/** Renderiza fuera de la vista animada, directamente dentro de .app, para que position: fixed use la ventana. */
export default function Portal({ children }) {
  return createPortal(children, document.querySelector('.app') ?? document.body);
}
