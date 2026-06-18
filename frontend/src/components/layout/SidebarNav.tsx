import { Boxes } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { NAV_ITEMS } from '@/layouts/navigation';
import { cn } from '@/utils/cn';

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes className="h-5 w-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Stockflow</p>
          <p className="text-xs text-muted-foreground">Inventory & Orders</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Primary">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
