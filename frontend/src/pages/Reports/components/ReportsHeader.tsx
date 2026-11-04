import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Download, RefreshCw } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

export function ReportsHeader() {
  const { setIsGenerateDialogOpen, setIsExportDialogOpen, refresh } = useReports();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-heading-2">Reports</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Generate, analyze, and manage client intelligence reports.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => setIsExportDialogOpen(true)}>
          Export Data
        </Button>
        <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={refresh}>
          Refresh
        </Button>
        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsGenerateDialogOpen(true)}>
          Generate Report
        </Button>
      </div>
    </div>
  );
}
