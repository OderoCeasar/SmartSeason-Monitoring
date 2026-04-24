import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { useToast } from '../../components/Toast';
import { useFieldActions, useFieldDetail } from '../../hooks/useFields';

const schema = z.object({
  stage: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']),
  notes: z.string().min(10, 'Notes must be at least 10 characters long'),
});

export default function AgentAddUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const actions = useFieldActions();
  const { field, loading } = useFieldDetail(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      stage: 'Growing',
      notes: '',
    },
  });

  async function onSubmit(values) {
    try {
      await actions.createFieldUpdate(id, values);
      toast.success('Field update added successfully.');
      navigate(`/agent/fields/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save field update.');
    }
  }

  return (
    <Card className="max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sun-500">Add Update</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">
          {loading ? 'Loading field...' : `Update ${field?.name || 'field'}`}
        </h1>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Stage" error={errors.stage?.message}>
          <Select {...register('stage')}>
            <option value="Planted">Planted</option>
            <option value="Growing">Growing</option>
            <option value="Ready">Ready</option>
            <option value="Harvested">Harvested</option>
          </Select>
        </FormField>

        <FormField label="Notes" error={errors.notes?.message} hint="Required, minimum 10 characters.">
          <Textarea rows={6} placeholder="Describe what changed in the field and anything that needs follow-up." {...register('notes')} />
        </FormField>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Update'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/agent/fields/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
