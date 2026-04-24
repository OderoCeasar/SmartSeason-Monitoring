import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Table } from '../../components/Table';
import { TableSkeleton } from '../../components/Skeleton';
import { useDashboard } from '../../hooks/useDashboard';

function formatDate(value) {
  if (!value) {
    return 'No updates yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

const statusColors = ['#2f8751', '#c2410c', '#667489'];

export default function AdminDashboard() {
  const { data, loading } = useDashboard();

  const statusData = [
    { name: 'Active', value: data.by_status.active },
    { name: 'At Risk', value: data.by_status.at_risk },
    { name: 'Completed', value: data.by_status.completed },
  ];

  const stageData = [
    { name: 'Planted', value: data.by_stage.planted },
    { name: 'Growing', value: data.by_stage.growing },
    { name: 'Ready', value: data.by_stage.ready },
    { name: 'Harvested', value: data.by_stage.harvested },
  ];

  const riskColumns = [
    { key: 'name', header: 'Field' },
    {
      key: 'assigned_agent',
      header: 'Agent',
      render: (row) => row.assigned_agent?.name || 'Unassigned',
    },
    {
      key: 'last_update_at',
      header: 'Last Update',
      render: (row) => formatDate(row.last_update_at),
    },
    {
      key: 'days_stale',
      header: 'Days Stale',
      render: (row) => `${row.days_stale} days`,
    },
  ];

  const updatesColumns = [
    { key: 'field_name', header: 'Field' },
    { key: 'agent_name', header: 'Agent' },
    {
      key: 'stage',
      header: 'Stage',
      render: (row) => <Badge>{row.stage}</Badge>,
    },
    { key: 'notes', header: 'Notes' },
    {
      key: 'created_at',
      header: 'Timestamp',
      render: (row) => formatDate(row.created_at),
    },
  ];

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-mist-500">Total Fields</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-mist-900">{data.total_fields}</h2>
        </Card>
        <Card>
          <p className="text-sm text-mist-500">Active</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-leaf-700">{data.by_status.active}</h2>
        </Card>
        <Card>
          <p className="text-sm text-mist-500">At Risk</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-orange-700">{data.by_status.at_risk}</h2>
        </Card>
        <Card>
          <p className="text-sm text-mist-500">Completed</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-mist-700">{data.by_status.completed}</h2>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4">
            <h3 className="font-display text-2xl font-semibold text-mist-900">Fields by Status</h3>
            <p className="mt-2 text-sm text-mist-500">A fast view of operational field health.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {statusData.map((entry, index) => (
                    <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-display text-2xl font-semibold text-mist-900">Fields by Stage</h3>
            <p className="mt-2 text-sm text-mist-500">Current crop progression across the portfolio.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <XAxis dataKey="name" stroke="#667489" />
                <YAxis allowDecimals={false} stroke="#667489" />
                <Tooltip />
                <Bar dataKey="value" fill="#2f8751" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4">
            <h3 className="font-display text-2xl font-semibold text-mist-900">At Risk Fields</h3>
            <p className="mt-2 text-sm text-mist-500">Fields that need follow-up soonest.</p>
          </div>
          {data.at_risk_fields.length ? (
            <Table columns={riskColumns} rows={data.at_risk_fields} />
          ) : (
            <EmptyState
              title="No at-risk fields"
              description="Everything currently tracked looks healthy. Recent updates and stage progress are up to date."
            />
          )}
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-display text-2xl font-semibold text-mist-900">Recent Updates</h3>
            <p className="mt-2 text-sm text-mist-500">The latest field activity across your team.</p>
          </div>
          {data.recent_updates.length ? (
            <Table columns={updatesColumns} rows={data.recent_updates} />
          ) : (
            <EmptyState
              title="No updates yet"
              description="Field updates will appear here as soon as admins or agents start logging progress."
            />
          )}
        </Card>
      </section>
    </div>
  );
}
