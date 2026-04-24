import { Button } from './Button';

export function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-4xl border border-dashed border-mist-200 bg-white/70 px-6 py-10 text-center shadow-panel">
      <h3 className="font-display text-2xl font-semibold text-mist-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-mist-600">{description}</p>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
