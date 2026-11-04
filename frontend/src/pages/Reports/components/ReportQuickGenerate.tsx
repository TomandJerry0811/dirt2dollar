import * as React from 'react';
import { SectionHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, TrendingUp, AlertTriangle, Lightbulb, Activity, Users, Box } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import type { ReportType } from '@/types';

interface ReportTemplate {
  type: ReportType;
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
}

const TEMPLATES: ReportTemplate[] = [
  { type: 'Executive Report', title: 'Executive Summary', description: 'High-level overview of portfolio health and key risks.', time: '~45s', icon: FileText },
  { type: 'Client Intelligence', title: 'Client Intelligence', description: 'Deep dive into a specific client\'s telemetry and CRM data.', time: '~60s', icon: Users },
  { type: 'KPI Analytics', title: 'KPI Analytics', description: 'Performance metrics against industry benchmarks.', time: '~20s', icon: TrendingUp },
  { type: 'AI Churn Analysis', title: 'AI Churn Analysis', description: 'Detailed breakdown of churn probability and risk factors.', time: '~90s', icon: AlertTriangle },
  { type: 'Recommendations', title: 'Recommendations', description: 'Actionable steps to improve client health scores.', time: '~30s', icon: Lightbulb },
  { type: 'Historical Similarity', title: 'Historical Similarity', description: 'Vector search results mapping to past client behaviors.', time: '~15s', icon: Box },
  { type: 'Workflow Execution', title: 'Workflow Execution', description: 'Technical execution logs and backend pipeline metrics.', time: '~10s', icon: Activity },
];

export function ReportQuickGenerate() {
  const { setIsGenerateDialogOpen, setActiveGenerationConfig } = useReports();

  const handleGenerate = (type: ReportType) => {
    setActiveGenerationConfig({
      reportType: type,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      format: 'PDF',
      sections: []
    });
    setIsGenerateDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <SectionHeader 
        title="Generate a Report" 
        description="Create an executive-ready report from your latest client intelligence." 
        noBorder
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {TEMPLATES.map((tmpl) => (
          <div key={tmpl.title} className="section-card p-5 group hover:border-primary/40 cursor-default">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <tmpl.icon className="w-5 h-5" />
              </div>
              <Badge variant="default" className="text-[10px]">{tmpl.time}</Badge>
            </div>
            <h4 className="text-body-sm font-semibold text-foreground mb-1">{tmpl.title}</h4>
            <p className="text-caption text-muted-foreground mb-4 line-clamp-2 h-8">
              {tmpl.description}
            </p>
            <Button 
              variant="outline" 
              className="w-full text-xs" 
              size="sm"
              onClick={() => handleGenerate(tmpl.type)}
            >
              Generate
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
