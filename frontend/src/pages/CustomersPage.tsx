import { Mail, Pencil, Phone, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { CustomerFormDialog } from '@/features/customers/components/CustomerFormDialog';
import { useCustomers, useDeleteCustomer } from '@/features/customers/hooks';
import { useListQuery } from '@/hooks/useListQuery';
import { useToast } from '@/hooks/useToast';
import type { Customer } from '@/types/domain';
import { formatDate, initials } from '@/utils/format';

export function CustomersPage() {
  const toast = useToast();
  const { query, search, sort, setPage, onSearchChange, toggleSort } = useListQuery({
    initialSortBy: 'created_at',
    initialOrder: 'desc',
  });

  const customersQuery = useCustomers(query);
  const deleteMutation = useDeleteCustomer();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Customer | undefined>(undefined);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success('Customer archived', `${pendingDelete.full_name} was archived.`);
      setPendingDelete(undefined);
    } catch (error) {
      toast.error(error, 'Unable to delete customer');
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'full_name',
      header: 'Customer',
      sortable: true,
      render: (customer) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials(customer.full_name)}
          </span>
          <span className="font-medium">{customer.full_name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (customer) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Mail className="h-3.5 w-3.5" aria-hidden />
          {customer.email}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (customer) =>
        customer.phone ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            {customer.phone}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      render: (customer) => (
        <span className="text-muted-foreground">{formatDate(customer.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (customer) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${customer.full_name}`}
            onClick={() => openEdit(customer)}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Archive ${customer.full_name}`}
            onClick={() => setPendingDelete(customer)}
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
        title="Customers"
        description="People and organizations that place orders."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            New customer
          </Button>
        }
      />

      <SearchInput value={search} onChange={onSearchChange} placeholder="Search by name or email" />

      <DataTable
        columns={columns}
        data={customersQuery.data?.items ?? []}
        rowKey={(customer) => customer.id}
        isLoading={customersQuery.isLoading}
        isError={customersQuery.isError}
        error={customersQuery.error}
        onRetry={() => void customersQuery.refetch()}
        sort={sort}
        onSortChange={toggleSort}
        emptyState={
          <EmptyState
            icon={Users}
            title={search ? 'No customers match your search' : 'No customers yet'}
            description={
              search ? 'Try a different name or email.' : 'Add your first customer to get started.'
            }
            action={
              !search ? (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" aria-hidden />
                  New customer
                </Button>
              ) : undefined
            }
          />
        }
      />

      {customersQuery.data && customersQuery.data.items.length > 0 ? (
        <Pagination meta={customersQuery.data.meta} onPageChange={setPage} />
      ) : null}

      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editing} />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => (open ? null : setPendingDelete(undefined))}
        title="Archive customer"
        description={
          pendingDelete
            ? `This archives "${pendingDelete.full_name}" and hides them from active lists. Their past orders are kept.`
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
