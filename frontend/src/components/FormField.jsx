export function FormField({ label, error, hint, children, className = '' }) {
  return (
    <label className={['block space-y-2', className].filter(Boolean).join(' ')}>
      <span className="text-sm font-semibold text-mist-700">{label}</span>
      {children}
      {hint ? <p className="text-xs text-mist-500">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-orange-700">{error}</p> : null}
    </label>
  );
}
