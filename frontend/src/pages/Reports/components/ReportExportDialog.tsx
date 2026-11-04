import * as React from 'react';
import { useReports } from '@/hooks/useReports';
import { X, Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function ReportExportDialog() {
  const { isExportDialogOpen, setIsExportDialogOpen } = useReports();
  const [format, setFormat] = React.useState('csv');
  const [scope, setScope] = React.useState('all');

  if (!isExportDialogOpen) return null;

  const handleExport = () => {
    toast.success(`Data export started (${format.toUpperCase()})`);
    setIsExportDialogOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-[slide-up_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-body font-semibold">Export Data</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsExportDialogOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          
          <div className="space-y-3">
            <span className="text-caption font-semibold text-muted-foreground uppercase">Format</span>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setFormat('csv')} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${format === 'csv' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-secondary'}`}>
                <Database className="w-5 h-5" />
                <span className="text-xs font-semibold">CSV</span>
              </button>
              <button onClick={() => setFormat('xlsx')} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${format === 'xlsx' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-secondary'}`}>
                <FileSpreadsheet className="w-5 h-5" />
                <span className="text-xs font-semibold">Excel</span>
              </button>
              <button onClick={() => setFormat('pdf')} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${format === 'pdf' ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card text-foreground hover:bg-secondary'}`}>
                <FileText className="w-5 h-5" />
                <span className="text-xs font-semibold">PDF</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-caption font-semibold text-muted-foreground uppercase">Data Scope</span>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="w-full p-2 text-sm rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">All Clients Data</option>
              <option value="filtered">Currently Filtered Results</option>
              <option value="selected">Selected Reports Only</option>
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsExportDialogOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
