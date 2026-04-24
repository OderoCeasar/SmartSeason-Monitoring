import { useEffect } from 'react';

export function Modal({ open, title, children, onClose, footer = null }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mist-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-4xl border border-white/40 bg-white p-6 shadow-panel">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-mist-900">{title}</h2>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-mist-500 transition hover:bg-mist-100 hover:text-mist-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
