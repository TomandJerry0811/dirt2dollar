import { useQuery } from '@tanstack/react-query';
import { useClientStore } from '@/store';
import { ClientService } from '@/services';
import { QUERY_STALE_TIME } from '@/constants';

// ============================================================
// Clients Hook
// ============================================================

export function useClients() {
  const store = useClientStore();
  const queryParams = store.getQueryParams();

  const clientsQuery = useQuery({
    queryKey: ['clients', queryParams],
    queryFn: () => ClientService.getClients(queryParams).then((r: any) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
    placeholderData: (prev) => prev,
  });

  return {
    clients: clientsQuery.data?.data ?? store.clients,
    pagination: {
      ...store.pagination,
      total: clientsQuery.data?.total ?? store.pagination.total,
      totalPages: clientsQuery.data?.totalPages ?? store.pagination.totalPages,
    },
    filters: store.filters,
    isLoading: clientsQuery.isLoading,
    isFetching: clientsQuery.isFetching,
    isError: clientsQuery.isError,
    updateFilter: store.updateFilter,
    resetFilters: store.resetFilters,
    setPage: store.setPage,
    setPageSize: store.setPageSize,
    refetch: clientsQuery.refetch,
  };
}

// ============================================================
// Single Client Hook
// ============================================================

export function useClient(clientId: string) {
  const query = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => ClientService.getClient(clientId).then((r: any) => r),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    enabled: !!clientId,
  });

  return {
    client: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================
// Client KPIs Hook
// ============================================================

export function useClientKPIs(clientId: string) {
  const query = useQuery({
    queryKey: ['client', clientId, 'kpis'],
    queryFn: () => (ClientService as any).getKPIs(clientId).then((r: any) => r.data),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    enabled: !!clientId,
  });

  return {
    kpis: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ============================================================
// Client Analysis Hook
// ============================================================

export function useClientAnalysis(clientId: string) {
  const query = useQuery({
    queryKey: ['client', clientId, 'analysis'],
    queryFn: () => (ClientService as any).getAnalysis(clientId).then((r: any) => r.data),
    staleTime: QUERY_STALE_TIME.MEDIUM,
    enabled: !!clientId,
  });

  return {
    analysis: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ============================================================
// Client History Hook
// ============================================================

export function useClientHistory(clientId: string) {
  const query = useQuery({
    queryKey: ['client', clientId, 'history'],
    queryFn: () => (ClientService as any).getHistory(clientId).then((r: any) => r.data),
    staleTime: QUERY_STALE_TIME.LONG,
    enabled: !!clientId,
  });

  return {
    history: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
