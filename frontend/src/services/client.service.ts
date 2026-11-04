import type { Client, ClientListParams, ClientListResponse, ClientAnalysisResponse } from '@/types';
import apiClient from './api/axios.instance';

export class ClientService {
  /**
   * Fetch paginated and filtered clients
   */
  static async getClients(params: ClientListParams): Promise<ClientListResponse> {
    const { data } = await apiClient.get<Client[]>('/clients', {
      params: {
        search: params.search,
        status: params.status,
        riskLevel: params.riskLevel,
        industry: params.industry,
        campaign: params.campaign,
        tier: params.tier,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }
    });

    let filtered = [...data];

    // Client-side search (search by name, industry, account manager, campaign, email, city, tags)
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(q);
        const industryMatch = c.industry?.toLowerCase().includes(q);
        const managerMatch = c.accountManager?.toLowerCase().includes(q);
        const campaignMatch = c.campaign?.toLowerCase().includes(q);
        const emailMatch = c.contact?.email?.toLowerCase().includes(q);
        const cityMatch = c.address?.city?.toLowerCase().includes(q);
        const tagsMatch = c.tags?.some((t) => t.toLowerCase().includes(q));
        const tierMatch = c.tier?.toLowerCase().includes(q);
        return nameMatch || industryMatch || managerMatch || campaignMatch || emailMatch || cityMatch || tagsMatch || tierMatch;
      });
    }

    // Status filter
    if (params.status) {
      filtered = filtered.filter((c) => c.status?.toLowerCase() === params.status?.toLowerCase());
    }

    // Risk Level filter
    if (params.riskLevel) {
      filtered = filtered.filter((c) => c.riskLevel?.toLowerCase() === params.riskLevel?.toLowerCase());
    }

    // Industry filter
    if (params.industry) {
      filtered = filtered.filter((c) => c.industry?.toLowerCase() === params.industry?.toLowerCase());
    }

    // Campaign filter
    if (params.campaign) {
      filtered = filtered.filter((c) => c.campaign?.toLowerCase() === params.campaign?.toLowerCase());
    }

    // Tier filter
    if (params.tier) {
      filtered = filtered.filter((c) => c.tier?.toLowerCase() === params.tier?.toLowerCase());
    }

    // Sorting
    if (params.sortBy) {
      const field = params.sortBy as keyof Client;
      const order = params.sortOrder === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return 0;
      });
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Fetch single client by ID
   */
  static async getClient(id: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(`/clients/${id}`);
    return data;
  }

  /**
   * Fetch client KPIs
   */
  static async getKPIs(id: string): Promise<{ data: any[] }> {
    const { data } = await apiClient.get<any[]>(`/clients/${id}/kpis`);
    return { data };
  }

  /**
   * Fetch client Analysis
   */
  static async getAnalysis(id: string): Promise<{ data: any }> {
    const { data } = await apiClient.get<any>(`/clients/${id}/analysis`);
    return { data: data.data };
  }

  /**
   * Fetch client History
   */
  static async getHistory(id: string): Promise<{ data: any[] }> {
    const { data } = await apiClient.get<any[]>(`/clients/${id}/history`);
    return { data };
  }

  /**
   * Run full AI Churn analysis with a text query
   */
  static async runAnalysis(userQuery: string): Promise<ClientAnalysisResponse> {
    const { data } = await apiClient.post<ClientAnalysisResponse>('/client-analysis', {
      user_query: userQuery,
    });
    return data;
  }
}


