import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils';
import { useClientStore } from '@/store/client.store';

// ============================================================
// ClientSearch
// ============================================================

export function ClientSearch() {
  const { filters, updateFilter } = useClientStore();
  const [searchTerm, setSearchTerm] = React.useState(filters.search);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keep local search term in sync when filters are reset externally
  React.useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  // Debounce the store update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilter('search', searchTerm);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.search, updateFilter]);

  // Ctrl+K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    updateFilter('search', '');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        ref={inputRef}
        type="text"
        className={cn(
          'block w-full pl-10 pr-20 py-3',
          'bg-card border border-border rounded-xl',
          'text-[14px] text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-shadow',
          'shadow-sm hover:border-border-hover'
        )}
        placeholder="Search by Client Name, Industry, or Account Manager..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-secondary text-[10px] font-medium text-muted-foreground">
          <span className="text-[12px]">⌘</span>K
        </kbd>
      </div>
    </div>
  );
}
