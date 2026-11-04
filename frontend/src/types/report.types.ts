// ============================================================
// Report Types
// ============================================================

export type ReportType =
  | 'Executive Report'
  | 'Client Intelligence'
  | 'KPI Analytics'
  | 'AI Churn Analysis'
  | 'Recommendations'
  | 'Workflow Execution'
  | 'Historical Similarity';

export type ReportStatus =
  | 'generating'
  | 'ready'
  | 'failed'
  | 'scheduled'
  | 'archived';

export type ReportFormat = 'PDF' | 'CSV' | 'Excel';

export type ReportSection =
  | 'Executive Summary'
  | 'KPI Analysis'
  | 'Trend Interpretation'
  | 'AI Churn Analysis'
  | 'Historical Similar Clients'
  | 'Recommendations'
  | 'Workflow Details'
  | 'Activity';

export interface ReportConfiguration {
  reportType: ReportType;
  clientId?: string;
  clientName?: string;
  startDate: string;
  endDate: string;
  format: ReportFormat;
  sections: ReportSection[];
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  clientId: string;
  clientName: string;
  status: ReportStatus;
  format: ReportFormat;
  sizeBytes?: number;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
  generationDuration?: number;
  sections: ReportSection[];
  version: number;
  downloadUrl?: string;
}

export interface ReportStatistics {
  totalReports: number;
  generatedThisMonth: number;
  scheduledReports: number;
  pendingReports: number;
  failedReports: number;
}

export interface ReportHistoryItem {
  id: string;
  reportId: string;
  action: 'generated' | 'downloaded' | 'shared' | 'archived' | 'failed';
  reportType: ReportType;
  clientName: string;
  timestamp: string;
  actor: string;
}

export interface ReportFilters {
  type?: string[];
  client?: string[];
  status?: string[];
  format?: string[];
  dateRange?: { start: string; end: string };
  search?: string;
}
