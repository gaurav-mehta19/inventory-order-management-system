import { Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';
import { CreateOrderPage } from '@/pages/CreateOrderPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ProductsPage } from '@/pages/ProductsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<CreateOrderPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
