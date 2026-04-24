import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Table } from '../../components/Table';
import { TableSkeleton } from '../../components/Skeleton';
import { useAgents } from '../../hooks/useFields';

export default function AdminUsers() {
  const { agents, loading } = useAgents();

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    {
      key: 'active_field_count',
      header: 'Active Fields',
      render: (row) => row.active_field_count,
    },
  ];

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-leaf-600">Users</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">Field agents</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-mist-600">
          Review active field ownership and use this list when assigning or reassigning field responsibility.
        </p>
      </Card>

      <Card>
        {agents.length ? (
          <Table columns={columns} rows={agents} />
        ) : (
          <EmptyState
            title="No agents available"
            description="Field agents will appear here once user records are available in the backend."
          />
        )}
      </Card>
    </div>
  );
}
