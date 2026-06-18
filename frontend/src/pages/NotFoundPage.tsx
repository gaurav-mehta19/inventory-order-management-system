import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you are looking for doesn’t exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
