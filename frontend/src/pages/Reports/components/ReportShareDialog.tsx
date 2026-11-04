import * as React from 'react';
import { useReports } from '@/hooks/useReports';
import { X, Copy, Mail, MessageSquare, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ReportShareDialog() {
  const { isShareDialogOpen, setIsShareDialogOpen, selectedReport } = useReports();
  const [copied, setCopied] = React.useState(false);

  if (!isShareDialogOpen || !selectedReport) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://app.churnpredictor.ai/reports/share/${selectedReport.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
      <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-[slide-up_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-body font-semibold">Share Report</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsShareDialogOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div>
            <p className="text-body-sm text-foreground font-medium mb-1">{selectedReport.name}</p>
            <p className="text-caption text-muted-foreground">{selectedReport.clientName} &bull; {selectedReport.format}</p>
          </div>

          <div className="space-y-3">
            <span className="text-caption font-semibold text-muted-foreground uppercase">Share via</span>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full justify-start" leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}>
                Email
              </Button>
              <Button variant="outline" className="w-full justify-start" leftIcon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}>
                Slack
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <span className="text-caption font-semibold text-muted-foreground uppercase">Copy Link</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground font-mono truncate">
                https://app.churnpredictor.ai/reports/share/{selectedReport.id}
              </div>
              <Button variant="primary" onClick={handleCopy} className="w-24 shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
