import * as React from 'react';
import { useClientStore } from '@/store/client.store';
import { ClientService } from '@/services/client.service';
import { ContentWrapper } from '@/components/common/PageHeader';
import { ErrorState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/utils/errors';

import { ClientPageHeader } from './components/ClientPageHeader';
import { ClientSearch } from './components/ClientSearch';
import { ClientFilters } from './components/ClientFilters';
import { ClientStats } from './components/ClientStats';
import { ClientTable } from './components/ClientTable';
import { Pagination } from './components/Pagination';
import { BulkActions } from './components/BulkActions';
import { EmptyClients } from './components/EmptyClients';
import { ClientQuickView } from './components/ClientQuickView';

// ============================================================
// ClientsPage — Enterprise Client Management Module
// ============================================================

export function ClientsPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const { 
    setClients, 
    setIsLoading, 
    getQueryParams,
    filters,
    pagination: { page, pageSize }
  } = useClientStore();

  const fetchClients = React.useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else if (useClientStore.getState().clients.length === 0) setIsLoading(true);

    try {
      const params = getQueryParams();
      const res = await ClientService.getClients(params);
      setClients(res.data, res.total, res.totalPages);
      setFetchError(null);
    } catch (err) {
      console.error('Failed to fetch clients', err);
      setFetchError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getQueryParams, setClients, setIsLoading]);

  // Effect to fetch clients when filters or pagination change
  React.useEffect(() => {
    fetchClients();
  }, [
    page, 
    pageSize, 
    filters.search, 
    filters.industry, 
    filters.riskLevel, 
    filters.status, 
    filters.campaign,
    fetchClients
  ]);

  return (
    <ContentWrapper fullWidth className="relative flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto pb-24 space-y-5 px-4 sm:px-6 lg:px-8 pt-6">
        
        <ClientPageHeader 
          onRefresh={() => fetchClients(true)} 
          isRefreshing={isRefreshing} 
        />

        {fetchError ? (
          <div className="section-card py-16 flex justify-center mt-4">
            <ErrorState
              title="Couldn't load clients"
              description={fetchError}
              onRetry={() => fetchClients(true)}
            />
          </div>
        ) : (
          <>
            <ClientStats />

            <div className="flex flex-col gap-3">
              <ClientSearch />
              <ClientFilters />
            </div>

            <ClientTable />
            <EmptyClients />
            <Pagination />
          </>
        )}

      </div>

      {/* Floating Elements */}
      <BulkActions />
      <ClientQuickView />

    </ContentWrapper>
  );
}

export default ClientsPage;