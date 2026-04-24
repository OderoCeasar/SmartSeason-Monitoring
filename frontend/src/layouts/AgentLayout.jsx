import { Link, NavLink, Outlet } from 'react-router-dom';

import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const agentNavItems = [
  { to: '/agent/dashboard', label: 'Dashboard' },
  { to: '/agent/fields', label: 'My Fields' },
];

function navClassName({ isActive }) {
  return [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive ? 'bg-sun-400 text-mist-900 shadow-soft' : 'text-mist-600 hover:bg-white hover:text-mist-900',
  ].join(' ');
}

export function AgentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-field-glow bg-[#f7f5ee] text-mist-900">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-[#f7f5ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link to="/agent/dashboard" className="font-display text-2xl font-semibold text-mist-900">
              SmartSeason Agent
            </Link>
            <p className="mt-1 text-sm text-mist-500">Track assigned fields and keep field progress current.</p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <nav className="flex flex-wrap gap-2">
              {agentNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-mist-700">{user?.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-mist-400">{user?.role}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
