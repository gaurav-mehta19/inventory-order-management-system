import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { ProductFormDrawer } from '@/features/products/components/ProductFormDrawer';
import { useDeleteProduct, useProducts } from '@/features/products/hooks';
import { useListQuery } from '@/hooks/useListQuery';
import { useToast } from '@/hooks/useToast';
import type { Product } from '@/types/domain';
import { formatCurrency, formatDate } from '@/utils/format';

const LOW_STOCK_THRESHOLD = 10;

export function ProductsPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const lowStockOnly = searchParams.get('low_stock') === '1';

  const { query, search, sort, setPage, onSearchChange, toggleSort } = useListQuery({
    initialSortBy: 'created_at',
    initialOrder: 'desc',
  });

  const productsQuery = useProducts({
    ...query,
    low_stock_threshold: lowStockOnly ? LOW_STOCK_THRESHOLD : undefined,
  });
  const deleteMutation = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Product | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success('Product archived', `${pendingDelete.name} was archived.`);
      setPendingDelete(undefined);
    } catch (error) {
      toast.error(error, 'Unable to delete product');
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (product) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{product.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      render: (product) => <span className="tabular-nums">{formatCurrency(product.price)}</span>,
    },
    {
      key: 'quantity_in_stock',
      header: 'Stock',
      sortable: true,
      align: 'right',
      render: (product) => (
        <Badge
          variant={
            product.quantity_in_stock === 0
              ? 'destructive'
              : product.quantity_in_stock <= LOW_STOCK_THRESHOLD
                ? 'warning'
                : 'secondary'
          }
        >
          {product.quantity_in_stock}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Added',
      sortable: true,
      render: (product) => (
        <span className="text-muted-foreground">{formatDate(product.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${product.name}`}
            onClick={() => openEdit(product)}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Archive ${product.name}`}
            onClick={() => setPendingDelete(product)}
          >
            <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your inventory catalog, pricing and stock levels."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            New product
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Search by name or SKU" />
        {lowStockOnly ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchParams({}, { replace: true })}
          >
            Showing low stock · Clear filter
          </Button>
        ) : null}
      </div>

      <DataTable
        columns={columns}
        data={productsQuery.data?.items ?? []}
        rowKey={(product) => product.id}
        isLoading={productsQuery.isLoading}
        isError={productsQuery.isError}
        error={productsQuery.error}
        onRetry={() => void productsQuery.refetch()}
        sort={sort}
        onSortChange={toggleSort}
        emptyState={
          <EmptyState
            icon={Package}
            title={search ? 'No products match your search' : 'No products yet'}
            description={
              search
                ? 'Try a different name or SKU.'
                : 'Create your first product to start tracking inventory.'
            }
            action={
              !search ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" aria-hidden />
                  New product
                </Button>
              ) : undefined
            }
          />
        }
      />

      {productsQuery.data && productsQuery.data.items.length > 0 ? (
        <Pagination meta={productsQuery.data.meta} onPageChange={setPage} />
      ) : null}

      <ProductFormDrawer open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => (open ? null : setPendingDelete(undefined))}
        title="Archive product"
        description={
          pendingDelete
            ? `This archives "${pendingDelete.name}" and hides it from active lists. Existing orders keep their history.`
            : undefined
        }
        confirmLabel="Archive"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
