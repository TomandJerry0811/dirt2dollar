import * as React from 'react';
import { useClientStore } from '@/store/client.store';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================================
// Pagination
// ============================================================

export function Pagination() {
  const { pagination, setPage, setPageSize } = useClientStore();
  const { page, pageSize, total, totalPages } = pagination;

  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <div className="flex items-center gap-4">
        <p className="text-[12.5px] text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{start}</span> to{' '}
          <span className="font-semibold text-foreground">{end}</span> of{' '}
          <span className="font-semibold text-foreground">{total}</span> clients
        </p>
        
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[12.5px] text-muted-foreground">Rows per page:</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="bg-transparent text-[12.5px] font-medium text-foreground outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          aria-label="Previous page"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 flex items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[12.5px] font-medium px-3">
          Page {page} of {totalPages}
        </span>
        <button
          aria-label="Next page"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
