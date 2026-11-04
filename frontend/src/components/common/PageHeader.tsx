import * as React from 'react';
import { cn } from '@/utils';

// ============================================================
// PageHeader
// ============================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('page-header mb-0', className)}>
      <div className="min-w-0">
        <h1 className="text-heading-1 text-foreground">{title}</h1>
        {description && (
          <p className="text-[13.5px] text-muted-foreground mt-1 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SectionHeader — inside a card
// ============================================================

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  noBorder?: boolean;
}

export function SectionHeader({ title, description, actions, className, noBorder }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3',
        !noBorder && 'pb-3 border-b border-border mb-4',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold text-foreground leading-tight">{title}</h2>
        {description && (
          <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

// ============================================================
// ContentWrapper — page wrapper enforcing max-width + spacing
// ============================================================

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function ContentWrapper({ children, className, fullWidth }: ContentWrapperProps) {
  return (
    <div className={cn(fullWidth ? 'page-container-full' : 'page-container', className)}>
      {children}
    </div>
  );
}

export default PageHeader;
