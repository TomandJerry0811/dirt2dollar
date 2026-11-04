import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services';
import { SectionHeader } from '@/components/common/PageHeader';
import { Download, Share2, FileText, XCircle, Archive, Clock } from 'lucide-react';
import { cn } from '@/utils';

export function ReportHistory() {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['reports', 'history'],
    queryFn: () => reportService.getReportHistory().then(r => r.data)
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'generated': return <FileText className="w-4 h-4 text-primary" />;
      case 'downloaded': return <Download className="w-4 h-4 text-success" />;
      case 'shared': return <Share2 className="w-4 h-4 text-info" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'archived': return <Archive className="w-4 h-4 text-muted-foreground" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="section-card h-full flex flex-col">
      <SectionHeader title="Recent Activity" description="Timeline of report actions" noBorder />
      
      <div className="flex-1 mt-6 relative pl-4 custom-scrollbar overflow-y-auto max-h-[300px]">
        {/* Vertical line connecting timeline */}
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border/60" />

        {isLoading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4 relative z-10 items-start">
                <div className="w-6 h-6 rounded-full bg-secondary skeleton border-2 border-card shrink-0 mt-0.5" />
                <div className="w-full space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No recent history</div>
        ) : (
          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={item.id} className="flex gap-4 relative z-10 items-start group">
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border-2 border-card shrink-0 mt-0.5 group-hover:bg-primary/10 transition-colors">
                  {getActionIcon(item.action)}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm font-semibold">
                    <span className="capitalize">{item.action} </span>
                    <span className="font-normal text-muted-foreground">the</span> {item.reportType}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-caption font-medium">{item.clientName}</span>
                    <span className="text-caption text-muted-foreground">&bull;</span>
                    <span className="text-caption text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-caption text-muted-foreground">&bull;</span>
                    <span className="text-caption text-muted-foreground">{item.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
