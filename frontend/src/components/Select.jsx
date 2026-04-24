export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={[
        'min-h-11 w-full rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm text-mist-800 outline-none transition focus:border-leaf-400 focus:ring-4 focus:ring-leaf-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </select>
  );
}
