import type { Report, ReportStatistics, ReportHistoryItem } from '@/types';

export const MOCK_REPORT_STATISTICS: ReportStatistics = {
  totalReports: 243,
  generatedThisMonth: 42,
  scheduledReports: 12,
  pendingReports: 3,
  failedReports: 1,
};

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-001',
    name: 'AI Churn Audit - Yardworx Land Management',
    type: 'Client Intelligence',
    clientId: 'yardworx',
    clientName: 'Yardworx Land Management',
    status: 'ready',
    format: 'PDF',
    sizeBytes: 2540000,
    generatedBy: 'Sarah Jenkins',
    createdAt: '2026-08-21T18:24:25Z',
    updatedAt: '2026-08-21T18:24:25Z',
    generationDuration: 24.5,
    sections: ['Executive Summary', 'KPI Analysis', 'AI Churn Analysis', 'Recommendations'],
    version: 1,
  },
  {
    id: 'rep-002',
    name: 'Executive Risk Assessment - Yardworx Land Management',
    type: 'AI Churn Analysis',
    clientId: 'yardworx',
    clientName: 'Yardworx Land Management',
    status: 'ready',
    format: 'PDF',
    sizeBytes: 1100000,
    generatedBy: 'Automated System',
    createdAt: '2026-08-20T08:15:00Z',
    updatedAt: '2026-08-20T08:15:45Z',
    generationDuration: 22.1,
    sections: ['Executive Summary', 'AI Churn Analysis', 'Historical Similar Clients', 'Recommendations'],
    version: 1,
  },
];

export const MOCK_REPORT_HISTORY: ReportHistoryItem[] = [
  { id: 'hist-1', reportId: 'rep-001', action: 'generated', reportType: 'Client Intelligence', clientName: 'Yardworx Land Management', timestamp: '2026-08-21T18:24:25Z', actor: 'Sarah Jenkins' },
  { id: 'hist-2', reportId: 'rep-001', action: 'downloaded', reportType: 'Client Intelligence', clientName: 'Yardworx Land Management', timestamp: '2026-08-21T19:05:00Z', actor: 'Sarah Jenkins' },
  { id: 'hist-3', reportId: 'rep-002', action: 'generated', reportType: 'AI Churn Analysis', clientName: 'Yardworx Land Management', timestamp: '2026-08-20T08:15:45Z', actor: 'Automated System' },
];

export const MOCK_REPORT_VOLUME_DATA = [
  { date: 'Mon', reports: 12 },
  { date: 'Tue', reports: 19 },
  { date: 'Wed', reports: 15 },
  { date: 'Thu', reports: 22 },
  { date: 'Fri', reports: 28 },
  { date: 'Sat', reports: 4 },
  { date: 'Sun', reports: 7 },
];

export const MOCK_REPORT_TYPE_DATA = [
  { name: 'Executive', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Client Intelligence', value: 30, color: 'hsl(var(--purple-accent))' },
  { name: 'KPI Analytics', value: 25, color: 'hsl(var(--success))' },
  { name: 'AI Churn Analysis', value: 20, color: 'hsl(var(--warning))' },
  { name: 'Recommendations', value: 15, color: 'hsl(var(--orange-accent))' },
];

export const MOCK_REPORT_TIME_DATA = [
  { name: 'Executive', time: 45 },
  { name: 'Client Intel', time: 62 },
  { name: 'KPI Analytics', time: 18 },
  { name: 'AI Churn', time: 85 },
  { name: 'Recommendations', time: 25 },
];
