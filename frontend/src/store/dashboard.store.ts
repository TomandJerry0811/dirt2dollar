import { create } from 'zustand';
import type { DashboardMetrics, DashboardAlert, ChartDataPoint } from '@/types';

// ============================================================
// Dashboard Store
// ============================================================

interface DashboardStore {
  metrics: DashboardMetrics | null;
  alerts: DashboardAlert[];
  churnRiskChart: ChartDataPoint[];
  revenueChart: ChartDataPoint[];
  healthDistribution: ChartDataPoint[];
  isLoading: boolean;
  lastUpdated: string | null;

  // Actions
  setMetrics: (metrics: DashboardMetrics) => void;
  setAlerts: (alerts: DashboardAlert[]) => void;
  setChurnRiskChart: (data: ChartDataPoint[]) => void;
  setRevenueChart: (data: ChartDataPoint[]) => void;
  setHealthDistribution: (data: ChartDataPoint[]) => void;
  setIsLoading: (loading: boolean) => void;
  markAlertAsRead: (alertId: string) => void;
  clearAlerts: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  metrics: null,
  alerts: [],
  churnRiskChart: [],
  revenueChart: [],
  healthDistribution: [],
  isLoading: false,
  lastUpdated: null,

  setMetrics: (metrics) => set({ metrics, lastUpdated: new Date().toISOString() }),
  setAlerts: (alerts) => set({ alerts }),
  setChurnRiskChart: (data) => set({ churnRiskChart: data }),
  setRevenueChart: (data) => set({ revenueChart: data }),
  setHealthDistribution: (data) => set({ healthDistribution: data }),
  setIsLoading: (isLoading) => set({ isLoading }),

  markAlertAsRead: (alertId) =>
    set({
      alerts: get().alerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a
      ),
    }),

  clearAlerts: () => set({ alerts: [] }),
}));
