import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReportStore } from '@/store';
import { reportService } from '@/services';
import { QUERY_STALE_TIME } from '@/constants';
import { getApiErrorMessage } from '@/utils/errors';
import { toast } from 'sonner';
import { useEffect } from 'react';
import type { ReportConfiguration } from '@/types';

// ============================================================
// Reports Hook
// ============================================================

export function useReports() {
  const store = useReportStore();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.getReports().then((r) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  const statsQuery = useQuery({
    queryKey: ['reports', 'stats'],
    queryFn: () => reportService.getReportStatistics().then((r) => r.data),
    staleTime: QUERY_STALE_TIME.SHORT,
  });

  const analyticsQuery = useQuery({
    queryKey: ['reports', 'analytics'],
    queryFn: () => reportService.getAnalytics().then((r) => r.data),
    staleTime: QUERY_STALE_TIME.LONG,
  });

  useEffect(() => {
    if (reportsQuery.data) store.setReports(reportsQuery.data);
  }, [reportsQuery.data]);

  const generateMutation = useMutation({
    mutationFn: (config: ReportConfiguration) => reportService.generateReport(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'stats'] });
      toast.success('Report generation started');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted');
      store.setSelectedReportIds(store.selectedReportIds.filter((sId) => sId !== deleteMutation.variables));
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return {
    reports: reportsQuery.data ?? store.reports,
    stats: statsQuery.data,
    analytics: analyticsQuery.data,
    isLoading: reportsQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,
    isError: reportsQuery.isError,
    errorMessage: reportsQuery.error ? getApiErrorMessage(reportsQuery.error) : null,
    refetchReports: reportsQuery.refetch,
    isGenerating: generateMutation.isPending,
    generateReport: generateMutation.mutate,
    generateReportAsync: generateMutation.mutateAsync,
    deleteReport: deleteMutation.mutate,
    refresh: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: ['reports'] });
        toast.success('Reports refreshed');
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      }
    },
    
    // Store proxies
    selectedReport: store.selectedReport,
    setSelectedReport: store.setSelectedReport,
    selectedReportIds: store.selectedReportIds,
    toggleReportSelection: store.toggleReportSelection,
    filters: store.filters,
    setFilters: store.setFilters,
    
    isGenerateDialogOpen: store.isGenerateDialogOpen,
    setIsGenerateDialogOpen: store.setIsGenerateDialogOpen,
    isPreviewOpen: store.isPreviewOpen,
    setIsPreviewOpen: store.setIsPreviewOpen,
    isShareDialogOpen: store.isShareDialogOpen,
    setIsShareDialogOpen: store.setIsShareDialogOpen,
    isExportDialogOpen: store.isExportDialogOpen,
    setIsExportDialogOpen: store.setIsExportDialogOpen,
    isDetailsDrawerOpen: store.isDetailsDrawerOpen,
    setIsDetailsDrawerOpen: store.setIsDetailsDrawerOpen,
    
    activeGenerationConfig: store.activeGenerationConfig,
    setActiveGenerationConfig: store.setActiveGenerationConfig,
    generationStatus: store.generationStatus,
    setGenerationStatus: store.setGenerationStatus,
    generationProgress: store.generationProgress,
    setGenerationProgress: store.setGenerationProgress,
  };
}