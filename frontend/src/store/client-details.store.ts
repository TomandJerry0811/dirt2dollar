import { create } from 'zustand';

export type DetailsTab = 'overview' | 'analytics' | 'analysis' | 'similarity' | 'recommendations' | 'workflow' | 'activity';

interface ClientDetailsStoreState {
  // Navigation State
  activeTab: DetailsTab;
  setActiveTab: (tab: DetailsTab) => void;

  // Drawer State
  historicalDrawerOpen: boolean;
  selectedHistoricalClient: string | null;
  setHistoricalDrawer: (open: boolean, clientId?: string | null) => void;

  recommendationDrawerOpen: boolean;
  selectedRecommendation: string | null;
  setRecommendationDrawer: (open: boolean, recId?: string | null) => void;
}

export const useClientDetailsStore = create<ClientDetailsStoreState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),

  historicalDrawerOpen: false,
  selectedHistoricalClient: null,
  setHistoricalDrawer: (open, clientId = null) => set({ historicalDrawerOpen: open, selectedHistoricalClient: clientId }),

  recommendationDrawerOpen: false,
  selectedRecommendation: null,
  setRecommendationDrawer: (open, recId = null) => set({ recommendationDrawerOpen: open, selectedRecommendation: recId }),
}));
