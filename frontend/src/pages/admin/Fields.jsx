import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { TableSkeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { useAgents, useFieldActions, useFields } from '../../hooks/useFields';

function formatDate(value) {
  if (!value) {
    return 'No updates yet';
  }

  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value));
}

export default function AdminFields() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, loading, params, setParams, refresh } = useFields();
  const { agents } = useAgents();
  const actions = useFieldActions();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'crop', header: 'Crop' },
    { key: 'current_stage', header: 'Stage', render: (row) => <Badge>{row.current_stage}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
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
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/fields/${row.id}`)}>
            View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/fields/${row.id}`)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await actions.deleteField(deleteTarget.id);
      toast.success('Field deleted successfully.');
      setDeleteTarget(null);
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete field.');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-leaf-600">Field Registry</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">Manage all monitored fields</h1>
          </div>
          <Button onClick={() => navigate('/admin/fields/create')}>New Field</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search by field, crop, or agent"
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
          <Select
            value={params.agent_id || ''}
            onChange={(event) => setParams({ agent_id: event.target.value, page: 1 })}
          >
            <option value="">All agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <TableSkeleton rows={7} />
      ) : items.length ? (
        <Card>
          <Table columns={columns} rows={items} />
        </Card>
      ) : (
        <EmptyState
          title="No fields match these filters"
          description="Try broadening the filters or create a new field to start tracking activity."
          actionLabel="Create Field"
          onAction={() => navigate('/admin/fields/create')}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete field"
        description={`Delete ${deleteTarget?.name || 'this field'}? This action cannot be undone.`}
        confirmLabel="Delete Field"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actions.submitting}
      />
    </div>
  );
}
