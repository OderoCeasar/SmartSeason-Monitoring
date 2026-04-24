import { useNavigate } from 'react-router-dom';

import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { TableSkeleton } from '../../components/Skeleton';
import { useFields } from '../../hooks/useFields';

function formatDate(value) {
  if (!value) {
    return 'No updates yet';
  }

  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AgentMyFields() {
  const navigate = useNavigate();
  const { items, loading, params, setParams } = useFields();

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'crop', header: 'Crop' },
    { key: 'current_stage', header: 'Stage', render: (row) => <Badge>{row.current_stage}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    {
      key: 'last_update_at',
      header: 'Last Update',
      render: (row) => formatDate(row.last_update_at),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sun-500">Assigned Fields</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">My active field list</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search fields or crops"
            value={params.search || ''}
            onChange={(event) => setParams({ search: event.target.value, page: 1 })}
          />
          <Select value={params.status || ''} onChange={(event) => setParams({ status: event.target.value, page: 1 })}>
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Completed">Completed</option>
          </Select>
          <Select value={params.stage || ''} onChange={(event) => setParams({ stage: event.target.value, page: 1 })}>
            <option value="">All stages</option>
            <option value="Planted">Planted</option>
            <option value="Growing">Growing</option>
            <option value="Ready">Ready</option>
            <option value="Harvested">Harvested</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <TableSkeleton rows={7} />
      ) : items.length ? (
        <Card>
          <Table
            columns={columns}
            rows={items.map((item) => ({
              ...item,
              onClick: () => navigate(`/agent/fields/${item.id}`),
            }))}
          />
          <div className="mt-4 text-sm text-mist-500">Open a field from the URL path to log updates and view history.</div>
        </Card>
      ) : (
        <EmptyState
          title="No assigned fields found"
          description="Assigned fields will appear here once an admin links them to your account."
        />
      )}
    </div>
  );
}
