import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login, isAuthenticated, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const destination = user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard';
    navigate(destination, { replace: true });
  }, [isAuthenticated, navigate, user]);

  async function onSubmit(values) {
    try {
      const response = await login(values);
      const destination =
        location.state?.from?.pathname ||
        (response.user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');

      toast.success('Welcome back to SmartSeason.');
      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || 'We could not sign you in with those credentials.';
      toast.error(message);
    }
  }

  return (
    <Card className="w-full max-w-lg border-white/80 bg-white/95 p-8 sm:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-leaf-600">Login</p>
        <h2 className="mt-4 font-display text-4xl font-semibold text-mist-900">Sign in to your workspace</h2>
        <p className="mt-3 text-sm leading-6 text-mist-600">
          Use your SmartSeason credentials to access dashboards, field records, and field update workflows.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Email address" error={errors.email?.message}>
          <Input type="email" placeholder="you@smartseason.com" {...register('email')} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" placeholder="Enter your password" {...register('password')} />
        </FormField>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 rounded-3xl bg-mist-50 p-4 text-sm text-mist-600">
        <p className="font-semibold text-mist-700">Demo access</p>
        <p className="mt-2">Admin: `admin@smartseason.com` / `Admin1234!`</p>
        <p>Agent: `agent1@smartseason.com` / `Agent1234!`</p>
      </div>
    </Card>
  );
}
