import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/Drawer';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import type { Product } from '@/types/domain';

import { useCreateProduct, useUpdateProduct } from '../hooks';
import { productSchema, type ProductFormValues } from '../schema';

interface ProductFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

const EMPTY_VALUES: ProductFormValues = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: 0,
};

export function ProductFormDrawer({ open, onOpenChange, product }: ProductFormDrawerProps) {
  const toast = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isEditing = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              sku: product.sku,
              price: product.price,
              quantity_in_stock: product.quantity_in_stock,
            }
          : EMPTY_VALUES,
      );
    }
  }, [open, product, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (product) {
        await updateMutation.mutateAsync({ id: product.id, payload: values });
        toast.success('Product updated', `${values.name} has been saved.`);
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Product created', `${values.name} is now in your catalog.`);
      }
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof ProductFormValues, { message });
        }
        return;
      }
      if (error instanceof ApiError && error.errorCode === 'DUPLICATE_SKU') {
        setError('sku', { message: error.message });
        return;
      }
      toast.error(error, 'Unable to save product');
    }
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <form onSubmit={onSubmit} className="flex h-full flex-col" noValidate>
          <DrawerHeader>
            <DrawerTitle>{isEditing ? 'Edit product' : 'New product'}</DrawerTitle>
            <DrawerDescription>
              {isEditing
                ? 'Update the details for this product.'
                : 'Add a new product to your inventory catalog.'}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-4">
            <FormField label="Name" error={errors.name?.message} required>
              {(field) => (
                <Input placeholder="Mechanical Keyboard" {...field} {...register('name')} />
              )}
            </FormField>
            <FormField
              label="SKU"
              error={errors.sku?.message}
              hint="Unique identifier, e.g. KBD-MX-87"
              required
            >
              {(field) => <Input placeholder="KBD-MX-87" {...field} {...register('sku')} />}
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Price (USD)" error={errors.price?.message} required>
                {(field) => (
                  <Input
                    inputMode="decimal"
                    placeholder="129.00"
                    {...field}
                    {...register('price')}
                  />
                )}
              </FormField>
              <FormField
                label="Quantity in stock"
                error={errors.quantity_in_stock?.message}
                required
              >
                {(field) => (
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    {...field}
                    {...register('quantity_in_stock')}
                  />
                )}
              </FormField>
            </div>
          </DrawerBody>

          <DrawerFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Create product'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
