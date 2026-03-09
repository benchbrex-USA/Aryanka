'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ArrowRight, CheckCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid work email required'),
  company: z.string().min(1, 'Company name is required'),
  role: z.string().optional(),
  team_size: z.string().optional(),
  use_case: z.string().optional(),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DemoBookingForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
        toast({ title: 'Demo booked!', description: 'We will reach out within 24 hours.' });
      } else {
        throw new Error('Failed');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to book demo. Please try again.', variant: 'destructive' });
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-accent-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Demo Booked!</h3>
        <p className="text-navy-400 text-sm">
          We'll reach out within 24 hours to confirm your slot.
          Check your email for a confirmation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register('name')} placeholder="Rahul Mehta" className="mt-1" />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Work Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="rahul@company.com" className="mt-1" />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company Name *</Label>
          <Input id="company" {...register('company')} placeholder="Acme Inc." className="mt-1" />
          {errors.company && <p className="text-xs text-red-400 mt-1">{errors.company.message}</p>}
        </div>
        <div>
          <Label htmlFor="role">Your Role</Label>
          <Input id="role" {...register('role')} placeholder="Head of Marketing" className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="team_size">Team Size</Label>
          <select
            id="team_size"
            {...register('team_size')}
            className="mt-1 flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="" className="bg-navy-800">Select size</option>
            {['1-5', '6-20', '21-50', '51-200', '200+'].map((s) => (
              <option key={s} value={s} className="bg-navy-800">{s} employees</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" {...register('phone')} placeholder="+91 98765 43210" className="mt-1" />
        </div>
      </div>

      <div>
        <Label htmlFor="use_case">What are you hoping to achieve?</Label>
        <textarea
          id="use_case"
          {...register('use_case')}
          placeholder="e.g. We want to generate 200 qualified B2B leads per month without paying for ads..."
          rows={3}
          className="mt-1 flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-navy-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Booking...' : 'Book My Free Demo'}
        <ArrowRight className="w-4 h-4" />
      </Button>

      <p className="text-xs text-center text-navy-500">
        30-minute personalized demo. No sales pressure. Cancel anytime.
      </p>
    </form>
  );
}
