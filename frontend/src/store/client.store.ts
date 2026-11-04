import { create } from 'zustand';
import type { Client, ClientListParams, ClientStatus, RiskLevel } from '@/types';

// ============================================================
// Client Store (Client Management Module State)
// ============================================================

export interface ClientFilters {
  search: string;
  industry: string;
  campaign: string;
  program: string;
  riskLevel: RiskLevel | '';
  status: ClientStatus | '';
  accountManager: string;
  minHealth?: number;
  maxHealth?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ClientStoreState {
  // Data
  clients: Client[];
  
  // Selection & View State
  selectedClient: Client | null;
  selectedRowIds: Set<string>;
  
  // Search & Filter State
  filters: ClientFilters;
  
  // Pagination State
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  
  // Actions
  setClients: (clients: Client[], total: number, totalPages: number) => void;
  setSelectedClient: (client: Client | null) => void;
  
  toggleRowSelection: (id: string) => void;
  selectAllRows: (ids: string[]) => void;
  clearRowSelection: () => void;
  
  updateFilter: (key: keyof ClientFilters, value: any) => void;
  resetFilters: () => void;
  
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  getQueryParams: () => ClientListParams;
}

const defaultFilters: ClientFilters = {
  search: '',
  industry: '',
  campaign: '',
  program: '',
  riskLevel: '',
  status: '',
  accountManager: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useClientStore = create<ClientStoreState>((set, get) => ({
  clients: [],
  selectedClient: null,
  selectedRowIds: new Set(),
  
  filters: defaultFilters,
  
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  
  setClients: (clients, total, totalPages) =>
    set((state) => ({
      clients,
      pagination: { ...state.pagination, total, totalPages },
    })),
    
  setSelectedClient: (client) => set({ selectedClient: client }),
  
  toggleRowSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return { selectedRowIds: newSet };
  }),
  
  selectAllRows: (ids) => set({ selectedRowIds: new Set(ids) }),
  
  clearRowSelection: () => set({ selectedRowIds: new Set() }),
  
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
      selectedRowIds: new Set(), // clear selection on filter change
    })),
    
  resetFilters: () =>
    set({ filters: defaultFilters, pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }),
    
  setPage: (page) =>
    set((state) => ({ pagination: { ...state.pagination, page } })),
    
  setPageSize: (pageSize) =>
    set((state) => ({ pagination: { ...state.pagination, pageSize, page: 1 } })),
    
  setIsLoading: (isLoading) => set({ isLoading }),
  
  
  getQueryParams: (): ClientListParams => {
    const { filters, pagination } = get();

    return {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: filters.search.trim() || undefined,
      status: (filters.status as ClientStatus) || undefined,
      riskLevel: (filters.riskLevel as RiskLevel) || undefined,
      industry: filters.industry || undefined,
      campaign: filters.campaign || undefined,
      program: filters.program || undefined,
      accountManager: filters.accountManager || undefined,
      minHealth: filters.minHealth,
      maxHealth: filters.maxHealth,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
  },
}));
