import * as React from 'react';
import { cn } from '@/utils';

// ============================================================
// Badge Component — Enterprise Design System
// ============================================================

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary'
  // Legacy aliases
  | 'destructive'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClassMap: Record<BadgeVariant, string> = {
  default:     'badge-default',
  primary:     'badge-primary',
  success:     'badge-success',
  warning:     'badge-warning',
  danger:      'badge-danger',
  destructive: 'badge-danger',
  info:        'badge-info',
  secondary:   'badge-default',
  outline:     'bg-transparent border-border text-muted-foreground',
};

const dotColorMap: Record<BadgeVariant, string> = {
  default:     'bg-muted-foreground',
  primary:     'bg-primary',
  success:     'bg-success',
  warning:     'bg-warning',
  danger:      'bg-destructive',
  destructive: 'bg-destructive',
  info:        'bg-info',
  secondary:   'bg-muted-foreground',
  outline:     'bg-muted-foreground',
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variantClassMap[variant],
        size === 'sm' && 'text-[10px] px-1.5 py-0',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('status-dot', dotColorMap[variant])}
          style={{ width: 6, height: 6 }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
