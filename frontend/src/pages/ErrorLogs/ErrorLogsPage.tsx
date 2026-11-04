import * as React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Bug } from 'lucide-react';
import { ContentWrapper, PageHeader } from '@/components/common/PageHeader';
import {
  ErrorMetricCards,
  ErrorFilters,
  ErrorTable,
  ErrorDetailModal,
} from './components';
import { useErrorLogs } from '@/hooks/useErrorLogs';
import type { WorkflowErrorLog } from '@/types';

// ============================================================
// Workflow Error Logs Observability Page
// ============================================================

export function ErrorLogsPage() {
  const [search, setSearch] = React.useState('');
  const [selectedWorkflow, setSelectedWorkflow] = React.useState('all');
  const [selectedNode, setSelectedNode] = React.useState('all');
  const [selectedLog, setSelectedLog] = React.useState<WorkflowErrorLog | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Debounced search or direct filter params
  const {
    logs,
    stats,
    total,
    isLoading,
    isRefetching,
    refetch,
    triggerTestError,
    isTriggeringTest,
  } = useErrorLogs({
    workflow_name: selectedWorkflow,
    failed_node: selectedNode,
    search: search.trim() ? search.trim() : undefined,
  });

  const handleOpenDetail = (log: WorkflowErrorLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedWorkflow('all');
    setSelectedNode('all');
  };

  const handleSimulateError = () => {
    triggerTestError({
      workflow_name: 'Client Churn & Recommendation Analysis',
      failed_node: 'Google Sheets Fetch',
      error_message: 'Simulated connection timeout while fetching client row data from Google Sheets Provider',
    });
  };

  return (
    <ContentWrapper>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16">
        {/* Page Header */}
        <PageHeader
          title="Errors Logging"
          description="Observability registry for workflow exceptions, failed execution steps, and full tracebacks persisted in Supabase."
          actions={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{stats?.totalErrors ?? total ?? 0} Recorded Incidents</span>
            </div>
          }
        />

        {/* High-Level Incident Metrics */}
        <ErrorMetricCards stats={stats} total={total} />

        {/* Search & Filter Controls */}
        <ErrorFilters
          search={search}
          onSearchChange={setSearch}
          selectedWorkflow={selectedWorkflow}
          onWorkflowChange={setSelectedWorkflow}
          selectedNode={selectedNode}
          onNodeChange={setSelectedNode}
          onReset={handleResetFilters}
          onRefresh={() => refetch()}
          onTriggerTest={handleSimulateError}
          isRefreshing={isRefetching}
          isTriggering={isTriggeringTest}
          availableWorkflows={stats?.availableWorkflows ?? []}
          availableNodes={stats?.availableNodes ?? []}
        />

        {/* Interactive Error Incident Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <ErrorTable
            logs={logs}
            onSelectLog={handleOpenDetail}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Detailed Inspection Modal */}
        <ErrorDetailModal
          log={selectedLog}
          isOpen={isModalOpen}
          onClose={handleCloseDetail}
        />
      </div>
    </ContentWrapper>
  );
}

export default ErrorLogsPage;
