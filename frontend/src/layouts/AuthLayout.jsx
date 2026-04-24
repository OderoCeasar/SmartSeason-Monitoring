import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-field-glow bg-gradient-to-br from-soil-50 via-white to-leaf-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-4xl bg-mist-900 p-10 text-white shadow-panel lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sun-300">SmartSeason</p>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-tight">
              Field visibility for teams that need action, not guesswork.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-mist-200">
              Keep every assigned field, crop stage, and update timeline visible in one place, with at-risk
              fields surfaced before they become missed opportunities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-mist-300">Roles</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">2</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-mist-300">Statuses</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">4</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-mist-300">Updates</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">Live</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
