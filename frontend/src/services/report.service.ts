import type { Report, ReportStatistics, ReportHistoryItem, ReportConfiguration } from '@/types';
import apiClient from './api/axios.instance';

export const reportService = {
  getReports: async () => {
    const { data } = await apiClient.get<Report[]>('/reports');
    return { data };
  },

  getReport: async (id: string) => {
    const { data } = await apiClient.get<Report>(`/reports/${id}`);
    return { data };
  },

  getReportStatistics: async () => {
    const { data } = await apiClient.get<Report[]>('/reports');
    return {
      data: {
        totalReports: data.length,
        generatedThisMonth: data.length,
        scheduledReports: 0,
        pendingReports: 0,
        failedReports: 0,
      }
    };
  },

  getReportHistory: async () => {
    const { data } = await apiClient.get<Report[]>('/reports');
    return {
      data: data.map((r: Report) => ({
        id: "rh-" + r.id,
        reportId: r.id,
        action: "generated",
        reportType: r.type,
        clientName: r.clientName,
        timestamp: r.createdAt,
        actor: r.generatedBy
      }))
    };
  },

  generateReport: async (config: ReportConfiguration) => {
    const { data } = await apiClient.post<Report>('/reports', config);
    return { data };
  },
  
  deleteReport: async (_id: string) => {
    return { data: { success: true } };
  },
  
  archiveReport: async (_id: string) => {
    return { data: { success: true } };
  },

  getAnalytics: async () => {
    const { data } = await apiClient.get<Report[]>('/reports');
    return {
      data: {
        volume: [
          { date: "Recent", reports: data.length },
        ],
        typeDistribution: [
          { name: "AI Churn Report", value: data.length, color: "hsl(var(--primary))" },
        ],
        generationTime: [
          { name: "0-2s", value: data.length },
        ]
      }
    };
  }
};


