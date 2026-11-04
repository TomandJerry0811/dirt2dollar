import * as React from 'react';
import { cn } from '@/utils';

// ============================================================
// LoadingSkeleton — flexible shimmer placeholder
// ============================================================

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className, height, width, rounded }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', rounded && 'rounded-full', className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================
// SkeletonMetricCard — matches MetricCard shape
// ============================================================

export function SkeletonMetricCard({ className }: { className?: string }) {
  return (
    <div className={cn('metric-card', className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton height={12} width="45%" />
        <Skeleton height={32} width={32} className="rounded-lg" />
      </div>
      <Skeleton height={30} width="60%" className="mb-2" />
      <Skeleton height={11} width="35%" />
    </div>
  );
}

// ============================================================
// SkeletonCard — generic card
// ============================================================

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('section-card p-5 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton height={36} width={36} className="rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton height={12} width="50%" />
          <Skeleton height={10} width="35%" />
        </div>
      </div>
      <Skeleton height={10} width="90%" />
      <Skeleton height={10} width="75%" />
      <div className="flex gap-2 pt-1">
        <Skeleton height={24} width={60} className="rounded-full" />
        <Skeleton height={24} width={72} className="rounded-full" />
      </div>
    </div>
  );
}

// ============================================================
// SkeletonTable — table placeholder
// ============================================================

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('section-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-secondary/40">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={11} width={i === 0 ? '30%' : '15%'} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              height={12}
              width={colIdx === 0 ? '30%' : `${15 + Math.random() * 10}%`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SkeletonText — line-by-line text placeholder
// ============================================================

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={12}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export default Skeleton;
