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

export default function AgentDashboard() {
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

  const atRiskColumns = [
    { key: 'name', header: 'Field' },
    { key: 'crop', header: 'Crop' },
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

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-mist-500">My Fields</p>
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
            <h3 className="font-display text-2xl font-semibold text-mist-900">Status Overview</h3>
            <p className="mt-2 text-sm text-mist-500">A quick read on the health of your assigned fields.</p>
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
            <h3 className="font-display text-2xl font-semibold text-mist-900">Stage Breakdown</h3>
            <p className="mt-2 text-sm text-mist-500">Where each assigned field sits in its crop cycle.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <XAxis dataKey="name" stroke="#667489" />
                <YAxis allowDecimals={false} stroke="#667489" />
                <Tooltip />
                <Bar dataKey="value" fill="#d79a1d" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card>
        <div className="mb-4">
          <h3 className="font-display text-2xl font-semibold text-mist-900">My Fields Needing Attention</h3>
          <p className="mt-2 text-sm text-mist-500">These assigned fields are currently marked as at risk.</p>
        </div>
        {data.at_risk_fields.length ? (
          <Table columns={atRiskColumns} rows={data.at_risk_fields} />
        ) : (
          <EmptyState
            title="No urgent issues right now"
            description="Your assigned fields are up to date based on the current status rules."
          />
        )}
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="font-display text-2xl font-semibold text-mist-900">Recent Updates</h3>
        </div>
        {data.recent_updates.length ? (
          <Table
            columns={[
              { key: 'field_name', header: 'Field' },
              { key: 'stage', header: 'Stage', render: (row) => <Badge>{row.stage}</Badge> },
              { key: 'notes', header: 'Notes' },
              { key: 'created_at', header: 'When', render: (row) => formatDate(row.created_at) },
            ]}
            rows={data.recent_updates}
          />
        ) : (
          <EmptyState
            title="No updates recorded yet"
            description="Recent field updates will appear here after you log activity."
          />
        )}
      </Card>
    </div>
  );
}
