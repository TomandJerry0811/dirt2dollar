import * as React from 'react';
import { Users, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useClientStore } from '@/store/client.store';
import { EmptyState } from '@/components/common/EmptyState';

// ============================================================
// EmptyClients
// ============================================================

export function EmptyClients() {
  const { clients, isLoading, resetFilters } = useClientStore();

  if (isLoading || clients.length > 0) return null;

  return (
    <div className="section-card py-16 flex justify-center mt-4">
      <EmptyState
        icon={SearchX}
        title="No Clients Found"
        description="We couldn't find any clients matching your search or filters. Try adjusting your criteria or adding a new client."
        action={
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Clear all filters
          </Button>
        }
      />
    </div>
  );
}
