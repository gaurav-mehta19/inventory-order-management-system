import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { SidebarNav } from '@/components/layout/SidebarNav';
import { Topbar } from '@/components/layout/Topbar';
import { Drawer, DrawerContent } from '@/components/ui/Drawer';
import { useUiStore } from '@/store/uiStore';

export function AppLayout() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const location = useLocation();

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  return (
    <div className="flex min-h-full bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarNav />
        </div>
      </aside>

      <Drawer open={sidebarOpen} onOpenChange={(open) => (open ? null : closeSidebar())}>
        <DrawerContent className="left-0 right-auto max-w-64 border-l-0 border-r p-0">
          <SidebarNav onNavigate={closeSidebar} />
        </DrawerContent>
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
