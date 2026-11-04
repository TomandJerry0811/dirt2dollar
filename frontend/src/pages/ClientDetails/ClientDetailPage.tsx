import * as React from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { useClient } from '@/hooks/useClients';
import { PageLoader } from '@/components/ui/Loader';
import { ErrorState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/utils/errors';
import { useClientDetailsStore } from '@/store/client-details.store';

import { ClientHero } from './components/ClientHero';
import { TopKPICards } from './components/TopKPICards';
import { StickySidebar } from './components/StickySidebar';

import { OverviewTab } from './components/OverviewTab';
import { KPIAnalyticsTab } from './components/KPIAnalyticsTab';
import { AIAnalysisTab } from './components/AIAnalysisTab';
import { HistoricalSimilarityTab } from './components/HistoricalSimilarityTab';
import { RecommendationsTab } from './components/RecommendationsTab';
import { WorkflowTab } from './components/WorkflowTab';
import { ActivityTab } from './components/ActivityTab';

// ============================================================
// Client Detail Page
// ============================================================

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { client, isLoading, isError, error, refetch } = useClient(id ?? '');
  const { activeTab } = useClientDetailsStore();

  if (isLoading) return <PageLoader label="Loading Client Intelligence Workspace…" />;

  // Distinguish a real fetch failure (network down, 500, etc.) from a
  // genuine "this client doesn't exist" 404 — they need different
  // messaging and only the former makes sense to retry.
  if (isError) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          title="Couldn't load this client"
          description={getApiErrorMessage(error)}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Client Not Found</h2>
          <p className="text-muted-foreground">The requested client could not be loaded.</p>
        </div>
      </div>
    );
  }

  // Map active tab to component
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab client={client} />;
      case 'analytics': return <KPIAnalyticsTab client={client} />;
      case 'analysis': return <AIAnalysisTab client={client} />;
      case 'similarity': return <HistoricalSimilarityTab />;
      case 'recommendations': return <RecommendationsTab client={client} />;
      case 'workflow': return <WorkflowTab />;
      case 'activity': return <ActivityTab />;
      default: return <OverviewTab client={client} />;
    }
  };

  return (
    <div className="page-container flex flex-col gap-6 relative">
      
      {/* 1. Page Header / Hero Section */}
      <ClientHero client={client} />

      {/* 2. Top KPI Cards */}
      <TopKPICards client={client} />

      {/* 3. Main Workspace Layout */}
      <div className="flex flex-col xl:flex-row gap-6 items-start relative">
        
        {/* Left: Sticky Sidebar & Tab Navigation */}
        <div className="xl:sticky xl:top-6 w-full xl:w-auto z-20">
          <StickySidebar client={client} />
        </div>

        {/* Right: Tabbed Content Area */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            <React.Fragment key={activeTab}>
              {renderActiveTab()}
            </React.Fragment>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default ClientDetailPage;