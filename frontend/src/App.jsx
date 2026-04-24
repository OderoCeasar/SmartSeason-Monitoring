import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { AgentLayout } from './layouts/AgentLayout';
import { AuthLayout } from './layouts/AuthLayout';
import AdminCreateField from './pages/admin/CreateField';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFieldDetail from './pages/admin/FieldDetail';
import AdminFields from './pages/admin/Fields';
import AdminUsers from './pages/admin/Users';
import AgentAddUpdate from './pages/agent/AddUpdate';
import AgentDashboard from './pages/agent/Dashboard';
import AgentFieldDetail from './pages/agent/FieldDetail';
import AgentMyFields from './pages/agent/MyFields';
import Login from './pages/auth/Login';

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-field-glow bg-soil-50 px-4">
      <div className="max-w-lg rounded-4xl border border-white/80 bg-white/95 p-8 text-center shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">Unauthorized</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">You do not have access to this area</h1>
        <p className="mt-4 text-sm leading-6 text-mist-600">
          Your account is signed in, but it does not have permission to open this section of SmartSeason.
        </p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-field-glow bg-soil-50 px-4">
      <div className="max-w-lg rounded-4xl border border-white/80 bg-white/95 p-8 text-center shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mist-500">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">Page not found</h1>
        <p className="mt-4 text-sm leading-6 text-mist-600">
          The page you requested does not exist or may have been moved.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/fields" element={<AdminFields />} />
            <Route path="/admin/fields/create" element={<AdminCreateField />} />
            <Route path="/admin/fields/:id" element={<AdminFieldDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['field_agent']} />}>
          <Route element={<AgentLayout />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/fields" element={<AgentMyFields />} />
            <Route path="/agent/fields/:id" element={<AgentFieldDetail />} />
            <Route path="/agent/fields/:id/update" element={<AgentAddUpdate />} />
          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
