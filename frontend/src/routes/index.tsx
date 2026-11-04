import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { DashboardPage } from '@/pages/Dashboard';
import { ClientsPage } from '@/pages/Clients';
import {
  ClientDetailPage,
  ClientKPIPage,
  ClientAnalysisPage,
  ClientHistoryPage,
  ClientRecommendationsPage,
} from '@/pages/ClientDetails';
import { AnalyticsPage } from '@/pages/Analytics';
import { WorkflowPage } from '@/pages/Workflow';
import { ErrorLogsPage } from '@/pages/ErrorLogs';
import { RecommendationsPage } from '@/pages/Recommendations';
import { ReportsPage } from '@/pages/Reports';
import { SettingsPage } from '@/pages/Settings';
import { AIAnalysisPage } from '@/pages/AIAnalysis';
import { AIUsagePage } from '@/pages/AIUsage';
import { UsersPage } from '@/pages/Users';
import { HistoricalClientsPage } from '@/pages/HistoricalClients';
import { ROUTES } from '@/constants/routes.constants';
import { LoginPage } from '@/pages/Auth';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';

// ============================================================
// Application Router
// ============================================================

export const router = createBrowserRouter([
  // Public Authentication Route
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // Protected Dashboard & Core Application Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    // A single errorElement on the parent route covers every child route
    // below it — React Router bubbles a route render error up to the
    // nearest ancestor route that has one defined.
    errorElement: <RouteErrorBoundary />,
    children: [
      // Dashboard
      {
        index: true,
        element: <DashboardPage />,
      },

      // AI Analysis Page
      {
        path: 'ai-analysis',
        element: <AIAnalysisPage />,
      },

      // AI Token Usage Page
      {
        path: 'ai-usage',
        element: <AIUsagePage />,
      },

      // Historical Clients Page
      {
        path: 'historical',
        element: <HistoricalClientsPage />,
      },
      {
        path: 'historical-clients',
        element: <HistoricalClientsPage />,
      },

      // Clients list
      {
        path: 'clients',
        element: <ClientsPage />,
      },

      // Client detail (nested)
      {
        path: 'client/:id',
        element: <ClientDetailPage />,
        children: [
          {
            index: true,
            element: <ClientKPIPage />,
          },
          {
            path: 'kpi',
            element: <ClientKPIPage />,
          },
          {
            path: 'analysis',
            element: <ClientAnalysisPage />,
          },
          {
            path: 'history',
            element: <ClientHistoryPage />,
          },
          {
            path: 'recommendations',
            element: <ClientRecommendationsPage />,
          },
        ],
      },

      // Analytics
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },

      // Workflow Monitor
      {
        path: 'workflow',
        element: <WorkflowPage />,
      },

      // Error Logs
      {
        path: 'error-logs',
        element: <ErrorLogsPage />,
      },

      // Recommendations
      {
        path: 'recommendations',
        element: <RecommendationsPage />,
      },

      // Reports
      {
        path: 'reports',
        element: <ReportsPage />,
      },

      // Users & Access Management
      {
        path: 'users',
        element: <UsersPage />,
      },

      // Settings
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);

export default router;