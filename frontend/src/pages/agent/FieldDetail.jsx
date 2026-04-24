import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Table } from '../../components/Table';
import { TableSkeleton } from '../../components/Skeleton';
import { useFieldDetail } from '../../hooks/useFields';

function formatDate(value) {
  if (!value) {
    return 'No updates yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AgentFieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { field, updates, loading } = useFieldDetail(id);

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (!field) {
    return (
      <EmptyState
        title="Field not found"
        description="The requested field could not be loaded or is not currently assigned to you."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sun-500">Field Detail</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">{field.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge>{field.status}</Badge>
              <Badge>{field.current_stage}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate(`/agent/fields/${id}/update`)}>Add Update</Button>
            <Button variant="secondary" onClick={() => navigate(`/agent/fields/${id}/update`)}>
              Open Update Form
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl font-semibold text-mist-900">Field metadata</h2>
          <dl className="mt-6 grid gap-4 text-sm text-mist-600 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-mist-700">Crop</dt>
              <dd className="mt-1">{field.crop}</dd>
            </div>
            <div>
              <dt className="font-semibold text-mist-700">Planting Date</dt>
              <dd className="mt-1">{formatDate(field.planting_date)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-mist-700">Expected Harvest</dt>
              <dd className="mt-1">{formatDate(field.expected_harvest_date)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-mist-700">Last Update</dt>
              <dd className="mt-1">{formatDate(field.last_update_at)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-semibold text-mist-900">Update workflow</h2>
          <p className="mt-4 text-sm leading-6 text-mist-600">
            Use the update action whenever field conditions change. Notes should be specific enough to help the next
            person understand the latest field conditions quickly.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate(`/agent/fields/${id}/update`)}>Add Field Update</Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-semibold text-mist-900">Update history</h2>
          <p className="mt-2 text-sm text-mist-500">Newest activity appears first.</p>
        </div>
        {updates.length ? (
          <Table
            columns={[
              { key: 'created_at', header: 'When', render: (row) => formatDate(row.created_at) },
              { key: 'updated_by_name', header: 'By' },
              { key: 'stage', header: 'Stage', render: (row) => <Badge>{row.stage}</Badge> },
              { key: 'notes', header: 'Notes' },
            ]}
            rows={updates}
          />
        ) : (
          <EmptyState
            title="No updates recorded"
            description="Add the first update to start the activity timeline for this field."
            actionLabel="Add Update"
            onAction={() => navigate(`/agent/fields/${id}/update`)}
          />
        )}
      </Card>

    </div>
  );
}
