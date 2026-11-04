import { create } from 'zustand';
import type { Report, ReportFilters, ReportConfiguration } from '@/types';

interface ReportStore {
  reports: Report[];
  selectedReport: Report | null;
  selectedReportIds: string[];
  
  // UI State Modals
  isGenerateDialogOpen: boolean;
  isPreviewOpen: boolean;
  isShareDialogOpen: boolean;
  isExportDialogOpen: boolean;
  isDetailsDrawerOpen: boolean;
  
  // Generation State
  activeGenerationConfig: ReportConfiguration | null;
  generationStatus: 'idle' | 'generating' | 'success' | 'failed';
  generationProgress: number; // 0 to 100
  
  // Filters & Search
  filters: ReportFilters;
  
  // Actions
  setReports: (reports: Report[]) => void;
  setSelectedReport: (report: Report | null) => void;
  setSelectedReportIds: (ids: string[]) => void;
  toggleReportSelection: (id: string) => void;
  
  setIsGenerateDialogOpen: (isOpen: boolean) => void;
  setIsPreviewOpen: (isOpen: boolean) => void;
  setIsShareDialogOpen: (isOpen: boolean) => void;
  setIsExportDialogOpen: (isOpen: boolean) => void;
  setIsDetailsDrawerOpen: (isOpen: boolean) => void;
  
  setActiveGenerationConfig: (config: ReportConfiguration | null) => void;
  setGenerationStatus: (status: 'idle' | 'generating' | 'success' | 'failed') => void;
  setGenerationProgress: (progress: number) => void;
  
  setFilters: (filters: Partial<ReportFilters>) => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  reports: [],
  selectedReport: null,
  selectedReportIds: [],
  
  isGenerateDialogOpen: false,
  isPreviewOpen: false,
  isShareDialogOpen: false,
  isExportDialogOpen: false,
  isDetailsDrawerOpen: false,
  
  activeGenerationConfig: null,
  generationStatus: 'idle',
  generationProgress: 0,
  
  filters: {},
  
  setReports: (reports) => set({ reports }),
  setSelectedReport: (report) => set({ selectedReport: report }),
  setSelectedReportIds: (ids) => set({ selectedReportIds: ids }),
  toggleReportSelection: (id) => set((state) => ({
    selectedReportIds: state.selectedReportIds.includes(id)
      ? state.selectedReportIds.filter(i => i !== id)
      : [...state.selectedReportIds, id]
  })),
  
  setIsGenerateDialogOpen: (isOpen) => set({ isGenerateDialogOpen: isOpen }),
  setIsPreviewOpen: (isOpen) => set({ isPreviewOpen: isOpen }),
  setIsShareDialogOpen: (isOpen) => set({ isShareDialogOpen: isOpen }),
  setIsExportDialogOpen: (isOpen) => set({ isExportDialogOpen: isOpen }),
  setIsDetailsDrawerOpen: (isOpen) => set({ isDetailsDrawerOpen: isOpen }),
  
  setActiveGenerationConfig: (config) => set({ activeGenerationConfig: config }),
  setGenerationStatus: (status) => set({ generationStatus: status }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
}));
