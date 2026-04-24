import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone: 'info', ...toast }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => pushToast({ tone: 'success', message }),
      error: (message) => pushToast({ tone: 'error', message }),
      info: (message) => pushToast({ tone: 'info', message }),
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rounded-3xl border px-4 py-3 text-sm shadow-panel backdrop-blur',
              toast.tone === 'success' && 'border-leaf-200 bg-leaf-50 text-leaf-800',
              toast.tone === 'error' && 'border-orange-200 bg-orange-50 text-orange-800',
              toast.tone === 'info' && 'border-mist-200 bg-white text-mist-700',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
