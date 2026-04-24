import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Table } from '../../components/Table';
import { TableSkeleton } from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { useAgents, useFieldActions, useFieldDetail } from '../../hooks/useFields';

function formatDate(value) {
  if (!value) {
    return 'No updates yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminFieldDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { field, updates, pagination, loading, refresh } = useFieldDetail(id);
  const { agents } = useAgents();
  const actions = useFieldActions();
  const [assignOpen, setAssignOpen] = useState(false);

  const editForm = useForm({
    values: field
      ? {
          name: field.name || '',
          crop: field.crop || '',
          planting_date: field.planting_date || '',
          expected_harvest_date: field.expected_harvest_date || '',
        }
      : undefined,
  });

  const assignForm = useForm({
    defaultValues: {
      agent_id: field?.assigned_agent?.id || '',
    },
  });

  const columns = [
    {
      key: 'created_at',
      header: 'When',
      render: (row) => formatDate(row.created_at),
    },
    { key: 'updated_by_name', header: 'By' },
    { key: 'stage', header: 'Stage', render: (row) => <Badge>{row.stage}</Badge> },
    { key: 'notes', header: 'Notes' },
  ];

  async function handleFieldUpdate(values) {
    try {
      await actions.updateField(id, {
        ...values,
        expected_harvest_date: values.expected_harvest_date || null,
      });
      toast.success('Field details updated.');
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update field.');
    }
  }

  async function handleAssign(values) {
    try {
      await actions.assignField(id, {
        agent_id: Number(values.agent_id),
      });
      toast.success('Field assignment updated.');
      setAssignOpen(false);
      refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to assign field.');
    }
  }

  if (loading) {
    return <TableSkeleton rows={6} />;
  }

  if (!field) {
    return (
      <EmptyState
        title="Field not found"
        description="The requested field could not be loaded or may no longer exist."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-leaf-600">Field Detail</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">{field.name}</h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge>{field.status}</Badge>
              <Badge>{field.current_stage}</Badge>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setAssignOpen(true)}>
            Assign Agent
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="font-display text-2xl font-semibold text-mist-900">Field metadata</h2>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={editForm.handleSubmit(handleFieldUpdate)}>
            <FormField label="Field Name" error={editForm.formState.errors.name?.message} className="sm:col-span-2">
              <Input {...editForm.register('name', { required: true })} />
            </FormField>
            <FormField label="Crop" error={editForm.formState.errors.crop?.message}>
              <Input {...editForm.register('crop', { required: true })} />
            </FormField>
            <FormField label="Assigned Agent">
              <Input value={field.assigned_agent?.name || 'Unassigned'} disabled />
            </FormField>
            <FormField label="Planting Date">
              <Input type="date" {...editForm.register('planting_date', { required: true })} />
            </FormField>
            <FormField label="Expected Harvest Date">
              <Input type="date" {...editForm.register('expected_harvest_date')} />
            </FormField>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={actions.submitting}>
                {actions.submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-2xl font-semibold text-mist-900">Assignment & activity</h2>
          <dl className="mt-6 space-y-4 text-sm text-mist-600">
            <div>
              <dt className="font-semibold text-mist-700">Current agent</dt>
              <dd className="mt-1">{field.assigned_agent?.name || 'No active assignment'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-mist-700">Last update</dt>
              <dd className="mt-1">{formatDate(field.last_update_at)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-mist-700">Timeline pages</dt>
              <dd className="mt-1">
                {pagination.page} of {pagination.pages}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-semibold text-mist-900">Update timeline</h2>
          <p className="mt-2 text-sm text-mist-500">Newest updates first.</p>
        </div>
        {updates.length ? (
          <Table columns={columns} rows={updates} />
        ) : (
          <EmptyState
            title="No updates recorded"
            description="This field has not received any update events yet."
          />
        )}
      </Card>

      <Modal
        open={assignOpen}
        title="Assign field"
        onClose={() => setAssignOpen(false)}
        footer={[
          <Button key="cancel" variant="secondary" onClick={() => setAssignOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            onClick={assignForm.handleSubmit(handleAssign)}
            disabled={actions.submitting}
          >
            {actions.submitting ? 'Assigning...' : 'Save Assignment'}
          </Button>,
        ]}
      >
        <FormField label="Assigned Agent">
          <Select {...assignForm.register('agent_id')}>
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </Select>
        </FormField>
      </Modal>
    </div>
  );
}
