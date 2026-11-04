import * as React from 'react';
import { cn } from '@/utils';
import { AlertCircle, FileX, Search, WifiOff, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================
// EmptyState
// ============================================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = FileX, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary border border-border mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-semibold text-foreground mb-1">{title}</p>
      {description && (
        <p className="text-[13px] text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================
// NoSearchResults — for filtered empty states
// ============================================================

interface NoSearchResultsProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

export function NoSearchResults({ query, onClear, className }: NoSearchResultsProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary border border-border mb-4">
        <Search className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-semibold text-foreground mb-1">No results found</p>
      {query && (
        <p className="text-[13px] text-muted-foreground">
          No results for <span className="font-medium text-foreground">"{query}"</span>
        </p>
      )}
      {onClear && (
        <button
          onClick={onClear}
          className="mt-4 text-[13px] font-medium text-primary hover:underline"
        >
          Clear search
        </button>
      )}
    </div>
  );
}

// ============================================================
// ErrorState
// ============================================================

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-semibold text-foreground mb-1">{title}</p>
      <p className="text-[13px] text-muted-foreground max-w-xs">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}

// ============================================================
// OfflineState
// ============================================================

export function OfflineState({ className }: { className?: string }) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning/10 border border-warning/20 mb-4">
        <WifiOff className="h-6 w-6 text-warning" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-semibold text-foreground mb-1">No internet connection</p>
      <p className="text-[13px] text-muted-foreground">
        Please check your connection and try again.
      </p>
    </div>
  );
}
