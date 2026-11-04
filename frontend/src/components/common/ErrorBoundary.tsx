import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ============================================================
// ErrorBoundary
// ============================================================
// Catches render-time errors anywhere in the component tree below it,
// so a bug in one page/component shows a recoverable error screen
// instead of a blank white page for the whole app.
//
// React error boundaries MUST be class components — there is no hook
// equivalent as of React 18/19.

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback renderer. Defaults to a full-page error screen. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production this is where you'd forward to an error-tracking
    // service (Sentry, LogRocket, etc.). For now, log clearly to console
    // so it's not silently lost.
    console.error('[ErrorBoundary] Caught a render error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20 mb-5">
            <AlertTriangle className="h-7 w-7 text-destructive" strokeWidth={1.5} />
          </div>
          <h1 className="text-[16px] font-semibold text-foreground mb-1.5">
            Something went wrong
          </h1>
          <p className="text-[13px] text-muted-foreground max-w-sm mb-6">
            An unexpected error occurred while rendering this page. You can try reloading it, or
            go back to the dashboard.
          </p>
          {import.meta.env.DEV && (
            <pre className="mb-6 max-w-xl overflow-auto rounded-lg border border-border bg-secondary p-3 text-left text-[11px] text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.reset}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary/80"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
            <button
              onClick={() => {
                this.reset();
                window.location.href = '/';
              }}
              className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}