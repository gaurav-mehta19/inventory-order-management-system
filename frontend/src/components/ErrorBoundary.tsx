import { Component, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            {this.state.message ?? 'An unexpected error occurred while rendering the page.'}
          </p>
          <Button onClick={() => window.location.reload()}>Reload application</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
