import { Toaster as SonnerToaster } from 'sonner';

import { useThemeStore } from '@/store/themeStore';

export function Toaster() {
  const resolved = useThemeStore((state) => state.resolved);

  return (
    <SonnerToaster
      theme={resolved}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-border',
        },
      }}
    />
  );
}
