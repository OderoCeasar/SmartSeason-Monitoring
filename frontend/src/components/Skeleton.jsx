export function Skeleton({ className = '' }) {
  return <div className={['animate-pulse rounded-2xl bg-mist-100', className].filter(Boolean).join(' ')} />;
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 rounded-3xl border border-mist-100 bg-white p-4 shadow-panel">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
