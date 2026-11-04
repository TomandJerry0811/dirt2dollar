import * as React from 'react';
import { useReports } from '@/hooks/useReports';
import { X, ZoomIn, ZoomOut, Download, Share2, Printer, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ReportPreview() {
  const { isPreviewOpen, setIsPreviewOpen, selectedReport } = useReports();
  const [zoom, setZoom] = React.useState(100);

  if (!isPreviewOpen || !selectedReport) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.2s_ease-out]">
      <div className="bg-card w-full max-w-7xl h-full max-h-[90vh] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <div>
            <h3 className="text-body font-semibold">{selectedReport.name}</h3>
            <p className="text-caption text-muted-foreground">Previewing {selectedReport.format} format</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          
          {/* Document Preview (Left) */}
          <div className="flex-1 bg-[#525659] overflow-auto relative p-8 flex justify-center custom-scrollbar">
            <div 
              className="bg-white shadow-xl origin-top transition-transform duration-200"
              style={{ width: '816px', minHeight: '1056px', transform: `scale(${zoom / 100})`, padding: '48px' }}
            >
              {/* Dummy PDF Content */}
              <div className="text-black space-y-8 font-sans">
                
                <div className="text-center border-b-2 border-black/10 pb-6">
                  <h1 className="text-2xl font-bold tracking-tight">Customer Churn Predictor</h1>
                  <h2 className="text-sm text-gray-500 uppercase tracking-widest mt-1">CLIENT INTELLIGENCE REPORT</h2>
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold">{selectedReport.clientName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Generated: {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">Executive Summary</h4>
                  <p className="text-sm leading-relaxed text-gray-700">
                    {selectedReport.clientName} has shown a steady decline in campaign engagement over the last 30 days. 
                    The predictive model indicates a high probability of churn if intervention is not taken immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">Client Health</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-500">Health Score</span><span className="font-semibold">78%</span></div>
                    <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-500">Churn Probability</span><span className="font-semibold text-red-600">78%</span></div>
                    <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-500">AI Confidence</span><span className="font-semibold">91%</span></div>
                    <div className="flex justify-between border-b border-gray-50 py-2"><span className="text-gray-500">Risk Level</span><span className="font-semibold text-red-600">HIGH</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                    <li><strong className="text-red-600">Critical:</strong> Schedule executive meeting immediately.</li>
                    <li><strong className="text-orange-500">High:</strong> Review campaign strategy and offer structural discount.</li>
                    <li><strong className="text-blue-500">Medium:</strong> Increase communication frequency to bi-weekly check-ins.</li>
                  </ul>
                </div>

                <div className="pt-12 text-center text-xs text-gray-400 border-t border-gray-100">
                  END OF REPORT
                </div>
                
              </div>
            </div>
          </div>

          {/* Controls (Right) */}
          <div className="w-full lg:w-72 bg-card border-l border-border p-4 flex flex-col gap-6">
            
            <div className="space-y-2">
              <span className="text-caption font-semibold text-muted-foreground uppercase">Zoom</span>
              <div className="flex items-center justify-between gap-2 bg-secondary rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))} className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
                <span className="text-sm font-mono">{zoom}%</span>
                <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 10))} className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" size="sm" className="w-full" leftIcon={<Maximize2 className="h-3.5 w-3.5" />} onClick={() => setZoom(100)}>Fit Width</Button>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <span className="text-caption font-semibold text-muted-foreground uppercase">Actions</span>
              <Button variant="primary" className="w-full" leftIcon={<Download className="h-4 w-4" />}>
                Download {selectedReport.format}
              </Button>
              <Button variant="outline" className="w-full" leftIcon={<Share2 className="h-4 w-4" />}>
                Share Report
              </Button>
              <Button variant="outline" className="w-full" leftIcon={<Printer className="h-4 w-4" />}>
                Print
              </Button>
            </div>

            <div className="mt-auto space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Generated:</span> <span>{new Date(selectedReport.createdAt).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>By:</span> <span>{selectedReport.generatedBy}</span></div>
              <div className="flex justify-between"><span>Size:</span> <span>{selectedReport.sizeBytes ? `${(selectedReport.sizeBytes / 1000000).toFixed(2)} MB` : 'Unknown'}</span></div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
