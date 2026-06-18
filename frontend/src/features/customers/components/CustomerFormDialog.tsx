import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import type { Customer } from '@/types/domain';

import { useCreateCustomer, useUpdateCustomer } from '../hooks';
import { customerSchema, type CustomerFormValues } from '../schema';

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

const EMPTY_VALUES: CustomerFormValues = { full_name: '', email: '', phone: '' };

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const toast = useToast();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isEditing = Boolean(customer);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        customer
          ? { full_name: customer.full_name, email: customer.email, phone: customer.phone ?? '' }
          : EMPTY_VALUES,
      );
    }
  }, [open, customer, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = { ...values, phone: values.phone ? values.phone : null };
    try {
      if (customer) {
        await updateMutation.mutateAsync({ id: customer.id, payload });
        toast.success('Customer updated', `${values.full_name} has been saved.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Customer created', `${values.full_name} has been added.`);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.errorCode === 'DUPLICATE_EMAIL') {
        setError('email', { message: error.message });
        return;
      }
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof CustomerFormValues, { message });
        }
        return;
      }
      toast.error(error, 'Unable to save customer');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit customer' : 'New customer'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the contact details for this customer.'
                : 'Add a customer who can place orders.'}
            </DialogDescription>
          </DialogHeader>

          <FormField label="Full name" error={errors.full_name?.message} required>
            {(field) => <Input placeholder="Ada Lovelace" {...field} {...register('full_name')} />}
          </FormField>
          <FormField label="Email" error={errors.email?.message} required>
            {(field) => (
              <Input type="email" placeholder="ada@example.com" {...field} {...register('email')} />
            )}
          </FormField>
          <FormField label="Phone" error={errors.phone?.message} hint="Optional">
            {(field) => <Input placeholder="+1 202 555 0100" {...field} {...register('phone')} />}
          </FormField>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Create customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
