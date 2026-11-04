import * as React from 'react';
import { useReports } from '@/hooks/useReports';
import { X, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ReportGenerationDialog() {
  const { 
    isGenerateDialogOpen, 
    setIsGenerateDialogOpen, 
    activeGenerationConfig, 
    setActiveGenerationConfig,
    generateReportAsync
  } = useReports();
  
  const [step, setStep] = React.useState(1);
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!isGenerateDialogOpen) return null;

  const handleGenerate = async () => {
    if (!activeGenerationConfig) return;
    setIsGenerating(true);
    setStep(2); // Move to progress step
    try {
      await generateReportAsync(activeGenerationConfig);
      setStep(3); // Move to success step
    } catch (e) {
      setStep(1); // Error, go back
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setIsGenerateDialogOpen(false);
    setTimeout(() => {
      setStep(1);
      setIsGenerating(false);
      setActiveGenerationConfig(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-[slide-up_0.2s_ease-out]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
          <h3 className="text-body font-semibold">Generate Report</h3>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isGenerating}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Report Configuration Form Stubs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Report Type</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-input focus:ring-2 focus:ring-primary/20"
                    value={activeGenerationConfig?.reportType || 'Executive Report'}
                    onChange={(e) => setActiveGenerationConfig({ ...activeGenerationConfig!, reportType: e.target.value as any })}
                  >
                    <option value="Executive Report">Executive Report</option>
                    <option value="Client Intelligence">Client Intelligence</option>
                    <option value="KPI Analytics">KPI Analytics</option>
                    <option value="AI Churn Analysis">AI Churn Analysis</option>
                    <option value="Recommendations">Recommendations</option>
                    <option value="Workflow Execution">Workflow Execution</option>
                    <option value="Historical Similarity">Historical Similarity</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Client</label>
                  <select 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-input focus:ring-2 focus:ring-primary/20"
                    value={activeGenerationConfig?.clientName || ''}
                    onChange={(e) => setActiveGenerationConfig({ ...activeGenerationConfig!, clientName: e.target.value })}
                  >
                    <option value="">Select Client...</option>
                    <option value="Yardworx Land Management">Yardworx Land Management</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Start Date</label>
                  <input type="date" className="w-full h-10 px-3 rounded-lg border border-border bg-input focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">End Date</label>
                  <input type="date" className="w-full h-10 px-3 rounded-lg border border-border bg-input focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Output Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="format" checked={activeGenerationConfig?.format === 'PDF'} onChange={() => setActiveGenerationConfig({...activeGenerationConfig!, format: 'PDF'})} /> PDF</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="format" checked={activeGenerationConfig?.format === 'Excel'} onChange={() => setActiveGenerationConfig({...activeGenerationConfig!, format: 'Excel'})} /> Excel</label>
                  <label className="flex items-center gap-2 text-sm"><input type="radio" name="format" checked={activeGenerationConfig?.format === 'CSV'} onChange={() => setActiveGenerationConfig({...activeGenerationConfig!, format: 'CSV'})} /> CSV</label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="text-heading-3 mb-2">Generating Report...</h3>
              <p className="text-muted-foreground text-body-sm max-w-sm">
                Assembling data from multiple AI modules. This usually takes around 15-30 seconds.
              </p>
              
              {/* Dummy Pipeline visualization */}
              <div className="mt-8 w-full max-w-md bg-secondary/50 rounded-xl p-4 border border-border text-left">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-primary animate-pulse">Running vector similarity search...</span>
                  <span>68%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-heading-3 mb-2">Report Ready</h3>
              <p className="text-muted-foreground text-body-sm max-w-sm">
                The report has been successfully generated and is now available in your library.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex justify-end gap-3">
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button variant="primary" onClick={handleGenerate} leftIcon={<PlayCircle className="w-4 h-4" />}>
                Generate
              </Button>
            </>
          )}
          {step === 3 && (
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
