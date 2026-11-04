import * as React from 'react';
import { Download, Plus, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';

// ============================================================
// ClientPageHeader
// ============================================================

interface ClientPageHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ClientPageHeader({ onRefresh, isRefreshing }: ClientPageHeaderProps) {
  return (
    <PageHeader
      title="Clients"
      description="Manage and analyze all enterprise clients. Select a client to view AI insights or trigger automated workflows."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Import Clients
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            Analyze Client
          </Button>
        </>
      }
    />
  );
}
