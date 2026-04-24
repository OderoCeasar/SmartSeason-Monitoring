import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { useToast } from '../../components/Toast';
import { useFieldActions } from '../../hooks/useFields';

const schema = z.object({
  name: z.string().min(2, 'Field name is required'),
  crop: z.string().min(2, 'Crop is required'),
  planting_date: z.string().min(1, 'Planting date is required'),
  expected_harvest_date: z.string().optional(),
  current_stage: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']),
});

export default function CreateField() {
  const navigate = useNavigate();
  const toast = useToast();
  const actions = useFieldActions();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      crop: '',
      planting_date: '',
      expected_harvest_date: '',
      current_stage: 'Planted',
    },
  });

  async function onSubmit(values) {
    try {
      const response = await actions.createField({
        ...values,
        expected_harvest_date: values.expected_harvest_date || null,
      });
      toast.success('Field created successfully.');
      navigate(`/admin/fields/${response.item.id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create field.');
    }
  }

  return (
    <Card className="max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-leaf-600">New Field</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-mist-900">Create a new monitored field</h1>
      </div>

      <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Field Name" error={errors.name?.message} className="sm:col-span-2">
          <Input placeholder="North Plot A" {...register('name')} />
        </FormField>

        <FormField label="Crop" error={errors.crop?.message}>
          <Input placeholder="Maize" {...register('crop')} />
        </FormField>

        <FormField label="Current Stage" error={errors.current_stage?.message}>
          <Select {...register('current_stage')}>
            <option value="Planted">Planted</option>
            <option value="Growing">Growing</option>
            <option value="Ready">Ready</option>
            <option value="Harvested">Harvested</option>
          </Select>
        </FormField>

        <FormField label="Planting Date" error={errors.planting_date?.message}>
          <Input type="date" {...register('planting_date')} />
        </FormField>

        <FormField label="Expected Harvest Date" error={errors.expected_harvest_date?.message}>
          <Input type="date" {...register('expected_harvest_date')} />
        </FormField>

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Field'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/fields')}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
