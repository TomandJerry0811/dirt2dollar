import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

// ============================================================
// RouteErrorBoundary
// ============================================================
// React Router's data routers (createBrowserRouter) catch render errors
// PER ROUTE internally, before they can bubble up to any ErrorBoundary
// wrapping <RouterProvider>. Without an explicit `errorElement` on each
// route, a crash falls back to React Router's default dev-only error
// screen instead of a styled, recoverable one. This component is that
// errorElement — attach it to the router config's `errorElement` prop.

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.data?.message || error.statusText || `Error ${error.status}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = getErrorMessage(error);

  // Log for debugging — in production this is where you'd forward
  // to an error-tracking service (Sentry, LogRocket, etc.).
  console.error('[RouteErrorBoundary] Caught a routing/render error:', error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 mb-5">
        <AlertTriangle className="h-7 w-7 text-destructive" strokeWidth={1.5} />
      </div>
      <h1 className="text-[16px] font-semibold text-foreground mb-1.5">
        Something went wrong
      </h1>
      <p className="text-[13px] text-muted-foreground max-w-sm mb-6">
        An unexpected error occurred while loading this page. You can try reloading it, or go
        back to the dashboard.
      </p>
      {import.meta.env.DEV && (
        <pre className="mb-6 max-w-xl overflow-auto rounded-lg border border-border bg-secondary p-3 text-left text-[11px] text-muted-foreground">
          {message}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary/80"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload page
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Home className="h-3.5 w-3.5" />
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}