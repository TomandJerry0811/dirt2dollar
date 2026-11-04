import * as React from 'react';
import { useReports } from '@/hooks/useReports';
import { X, FileText, Download, Share2, Archive, Calendar, Clock, User, HardDrive, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ReportDetailsDrawer() {
  const { isDetailsDrawerOpen, setIsDetailsDrawerOpen, selectedReport, setIsPreviewOpen } = useReports();

  if (!isDetailsDrawerOpen || !selectedReport) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-card border-l border-border shadow-xl z-40 flex flex-col animate-[slide-in-right_0.25s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-heading-4">Report Details</h3>
          <p className="text-caption text-muted-foreground mt-1">Metadata and history</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsDetailsDrawerOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        
        {/* Name & Type */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="text-body font-semibold">{selectedReport.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default">{selectedReport.type}</Badge>
              <Badge variant="default" className="bg-secondary text-foreground">{selectedReport.format}</Badge>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
            <span className="text-caption text-muted-foreground flex items-center gap-1.5 mb-1"><User className="w-3.5 h-3.5" /> Client</span>
            <span className="font-semibold text-body-sm">{selectedReport.clientName}</span>
          </div>
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
            <span className="text-caption text-muted-foreground flex items-center gap-1.5 mb-1"><User className="w-3.5 h-3.5" /> Generator</span>
            <span className="font-semibold text-body-sm">{selectedReport.generatedBy}</span>
          </div>
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
            <span className="text-caption text-muted-foreground flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5" /> Created</span>
            <span className="font-semibold text-body-sm">{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
            <span className="text-caption text-muted-foreground flex items-center gap-1.5 mb-1"><HardDrive className="w-3.5 h-3.5" /> Size</span>
            <span className="font-semibold text-body-sm">
              {selectedReport.sizeBytes ? `${(selectedReport.sizeBytes / 1000000).toFixed(2)} MB` : 'Unknown'}
            </span>
          </div>
        </div>

        {/* Sections Included */}
        {selectedReport.sections && selectedReport.sections.length > 0 && (
          <div>
            <h4 className="text-body-sm font-semibold mb-3">Included Sections</h4>
            <div className="space-y-2">
              {selectedReport.sections.map((section, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-foreground bg-secondary/30 p-2 rounded-lg border border-border/30">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {section}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation Duration */}
        {selectedReport.generationDuration && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-xl border border-border/50">
            <Clock className="w-4 h-4" />
            <span>Generation took {selectedReport.generationDuration} seconds</span>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border bg-card grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" onClick={() => setIsPreviewOpen(true)}>
          View Preview
        </Button>
        <Button variant="primary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
          Download
        </Button>
        <Button variant="outline" className="w-full" leftIcon={<Share2 className="w-4 h-4" />}>
          Share
        </Button>
        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:border-destructive/30" leftIcon={<Archive className="w-4 h-4" />}>
          Archive
        </Button>
      </div>
    </div>
  );
}
