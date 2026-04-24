const statusClasses = {
  Active: 'bg-leaf-100 text-leaf-700 ring-1 ring-inset ring-leaf-200',
  'At Risk': 'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-200',
  Completed: 'bg-mist-200 text-mist-700 ring-1 ring-inset ring-mist-300',
  Pending: 'bg-sun-100 text-sun-800 ring-1 ring-inset ring-sun-200',
  Planted: 'bg-leaf-50 text-leaf-700 ring-1 ring-inset ring-leaf-200',
  Growing: 'bg-leaf-100 text-leaf-800 ring-1 ring-inset ring-leaf-200',
  Ready: 'bg-sun-100 text-sun-800 ring-1 ring-inset ring-sun-200',
  Harvested: 'bg-mist-200 text-mist-700 ring-1 ring-inset ring-mist-300',
};

export function Badge({ children, tone, className = '' }) {
  const value = tone || children;

  return (
    <span
      className={[
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        statusClasses[value] || 'bg-mist-100 text-mist-700 ring-1 ring-inset ring-mist-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
