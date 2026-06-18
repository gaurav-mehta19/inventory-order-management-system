import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCustomers } from '@/features/customers/hooks';
import { useCreateOrder } from '@/features/orders/hooks';
import { orderSchema, type OrderFormValues } from '@/features/orders/schema';
import { useProducts } from '@/features/products/hooks';
import { useToast } from '@/hooks/useToast';
import { formatCurrency } from '@/utils/format';

const PICKER_QUERY = { page: 1, page_size: 100, sort_by: 'name', order: 'asc' as const };

export function CreateOrderPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateOrder();

  const customersQuery = useCustomers(PICKER_QUERY);
  const productsQuery = useProducts(PICKER_QUERY);

  const products = useMemo(() => productsQuery.data?.items ?? [], [productsQuery.data]);
  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customer_id: undefined, items: [{ product_id: undefined, quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const total = useMemo(
    () =>
      (watchedItems ?? []).reduce((sum, item) => {
        const product = productById.get(Number(item?.product_id));
        if (!product || !item?.quantity) return sum;
        return sum + Number(product.price) * Number(item.quantity);
      }, 0),
    [watchedItems, productById],
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      const order = await createMutation.mutateAsync({
        customer_id: values.customer_id,
        items: values.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      toast.success(
        'Order created',
        `Order #${order.id} totalling ${formatCurrency(order.total_amount)}.`,
      );
      navigate(`/orders/${order.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error, 'Unable to create order');
        return;
      }
      toast.error(error, 'Unable to create order');
    }
  });

  const isLoadingPickers = customersQuery.isLoading || productsQuery.isLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="New order"
        description="Select a customer and add products to the order."
      />

      <Button variant="ghost" size="sm" className="-ml-2 w-fit" onClick={() => navigate('/orders')}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to orders
      </Button>

      {isLoadingPickers ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3" noValidate>
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField label="Customer" error={errors.customer_id?.message} required>
                  {(field) => (
                    <Controller
                      control={control}
                      name="customer_id"
                      render={({ field: controllerField }) => (
                        <Select
                          value={controllerField.value ? String(controllerField.value) : undefined}
                          onValueChange={(value) => controllerField.onChange(Number(value))}
                        >
                          <SelectTrigger
                            id={field.id}
                            aria-invalid={field['aria-invalid']}
                            aria-describedby={field['aria-describedby']}
                          >
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {customersQuery.data?.items.map((customer) => (
                              <SelectItem key={customer.id} value={String(customer.id)}>
                                {customer.full_name} · {customer.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                </FormField>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Line items</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ product_id: undefined as unknown as number, quantity: 1 })
                  }
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Add product
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.items?.message ? (
                  <p className="text-sm text-destructive">{errors.items.message}</p>
                ) : null}
                {fields.map((fieldRow, index) => {
                  const selectedProduct = productById.get(
                    Number(watchedItems?.[index]?.product_id),
                  );
                  const lineTotal =
                    selectedProduct && watchedItems?.[index]?.quantity
                      ? Number(selectedProduct.price) * Number(watchedItems[index].quantity)
                      : 0;
                  return (
                    <div
                      key={fieldRow.id}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-border p-4 sm:grid-cols-12 sm:items-end"
                    >
                      <div className="sm:col-span-6">
                        <FormField
                          label="Product"
                          error={errors.items?.[index]?.product_id?.message}
                          required
                        >
                          {(field) => (
                            <Controller
                              control={control}
                              name={`items.${index}.product_id`}
                              render={({ field: controllerField }) => (
                                <Select
                                  value={
                                    controllerField.value
                                      ? String(controllerField.value)
                                      : undefined
                                  }
                                  onValueChange={(value) => controllerField.onChange(Number(value))}
                                >
                                  <SelectTrigger
                                    id={field.id}
                                    aria-invalid={field['aria-invalid']}
                                    aria-describedby={field['aria-describedby']}
                                  >
                                    <SelectValue placeholder="Select a product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem
                                        key={product.id}
                                        value={String(product.id)}
                                        disabled={product.quantity_in_stock === 0}
                                      >
                                        {product.name} · {formatCurrency(product.price)} (
                                        {product.quantity_in_stock} in stock)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          )}
                        </FormField>
                      </div>

                      <div className="sm:col-span-3">
                        <FormField
                          label="Quantity"
                          error={errors.items?.[index]?.quantity?.message}
                          required
                        >
                          {(field) => (
                            <Input
                              type="number"
                              min={1}
                              max={selectedProduct?.quantity_in_stock ?? undefined}
                              {...field}
                              {...register(`items.${index}.quantity`)}
                            />
                          )}
                        </FormField>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:col-span-3 sm:justify-end">
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(lineTotal)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove line item"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Line items</span>
                  <span>{fields.length}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-medium">Order total</span>
                  <span className="text-xl font-semibold tabular-nums">
                    {formatCurrency(total)}
                  </span>
                </div>
                <Button type="submit" className="w-full" loading={isSubmitting}>
                  Create order
                </Button>
                <p className="text-xs text-muted-foreground">
                  Stock is validated and reserved atomically when the order is created.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}
