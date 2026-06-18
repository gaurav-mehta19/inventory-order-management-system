import { LayoutDashboard, Package, ShoppingCart, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Products', to: '/products', icon: Package },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Orders', to: '/orders', icon: ShoppingCart },
];
