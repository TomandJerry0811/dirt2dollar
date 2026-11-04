import * as React from 'react';
import { ContentWrapper } from '@/components/common/PageHeader';
import { 
  ReportsHeader,
  ReportMetricCards,
  ReportQuickGenerate,
  ReportLibrary,
  ReportAnalytics,
  ReportHistory,
  ReportPreview,
  ReportDetailsDrawer,
  ReportShareDialog,
  ReportExportDialog,
  ReportGenerationDialog
} from './components';

// ============================================================
// Reports & Export Center Page
// ============================================================

export function ReportsPage() {
  return (
    <ContentWrapper>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
        {/* Header Area */}
        <ReportsHeader />
        
        {/* KPI Metrics */}
        <ReportMetricCards />

        {/* Quick Generate Action Blocks */}
        <ReportQuickGenerate />

        {/* Main Report Library Data Grid */}
        <ReportLibrary />

        {/* Analytics & History Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ReportAnalytics />
          </div>
          <div className="xl:col-span-1">
            <ReportHistory />
          </div>
        </div>
      </div>

      {/* Overlay Modals & Drawers */}
      <ReportPreview />
      <ReportDetailsDrawer />
      <ReportShareDialog />
      <ReportExportDialog />
      <ReportGenerationDialog />
      
    </ContentWrapper>
  );
}

export default ReportsPage;
