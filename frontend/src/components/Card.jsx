export function Card({ children, className = '' }) {
  return (
    <section
      className={[
        'rounded-4xl border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </section>
  );
}
