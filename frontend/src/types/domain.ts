export interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity_in_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  product: Product | null;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface OrderDetail extends Order {
  customer: Customer;
}

export interface DashboardSummary {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: string;
  low_stock_count: number;
  low_stock_threshold: number;
  low_stock_products: Product[];
  orders_by_status: Array<{ status: string; count: number }>;
  revenue_trend: Array<{ date: string; revenue: string; orders: number }>;
}
