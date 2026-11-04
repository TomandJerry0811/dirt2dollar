import * as React from 'react';
import { ContentWrapper } from '@/components/common/PageHeader';
import { 
  WorkflowHeader, 
  WorkflowMetricCards, 
  WorkflowExecutionBanner,
  WorkflowPipeline,
  WorkflowNodeDrawer,
  WorkflowExecutionLogs,
  WorkflowHistoryTable,
  WorkflowAnalytics
} from './components';

// ============================================================
// Workflow Execution & Monitoring Center Page
// ============================================================

export function WorkflowPage() {
  return (
    <ContentWrapper>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
        {/* Header Area */}
        <WorkflowHeader />
        
        {/* KPI Metrics */}
        <WorkflowMetricCards />

        {/* Current Active Execution */}
        <WorkflowExecutionBanner />

        {/* Visual Pipeline */}
        <WorkflowPipeline />

        {/* Analytics & Logs Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <WorkflowExecutionLogs />
          <WorkflowAnalytics />
        </div>

        {/* Execution History */}
        <WorkflowHistoryTable />

        {/* Overlay Drawers */}
        <WorkflowNodeDrawer />
      </div>
    </ContentWrapper>
  );
}

export default WorkflowPage;
