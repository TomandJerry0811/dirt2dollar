import * as React from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

// ============================================================
// PageLoader — full page centered spinner
// ============================================================

interface PageLoaderProps {
  label?: string;
  className?: string;
}

export function PageLoader({ label = 'Loading…', className }: PageLoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[300px] gap-3', className)}>
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}

// ============================================================
// InlineLoader — small inline spinner
// ============================================================

interface InlineLoaderProps {
  size?: 'sm' | 'md';
  className?: string;
}

export function InlineLoader({ size = 'md', className }: InlineLoaderProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-muted-foreground',
        size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
        className
      )}
      aria-hidden="true"
    />
  );
}

// ============================================================
// LoadingOverlay — translucent over-content overlay
// ============================================================

interface LoadingOverlayProps {
  label?: string;
  className?: string;
}

export function LoadingOverlay({ label, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center gap-3',
        'bg-card/80 backdrop-blur-[1px] rounded-[inherit]',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label ?? 'Loading'}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {label && <p className="text-[12.5px] text-muted-foreground">{label}</p>}
    </div>
  );
}

export default PageLoader;
