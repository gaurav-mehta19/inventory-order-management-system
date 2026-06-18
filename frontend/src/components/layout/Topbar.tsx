import { Menu } from 'lucide-react';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUiStore } from '@/store/uiStore';

export function Topbar() {
  const openSidebar = useUiStore((state) => state.openSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={openSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
