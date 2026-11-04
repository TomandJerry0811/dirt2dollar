import * as React from 'react';
import { ContentWrapper } from '@/components/common/PageHeader';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/MetricCard';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Sparkles, Lightbulb, AlertTriangle, ShieldAlert, Award, Clock } from 'lucide-react';

export function RecommendationsPage() {
  const { recommendations, isLoading, isError, errorMessage, refetch, generate, isGenerating } = useRecommendations();

  // Group recommendations by priority
  const critical = recommendations.filter((r) => r.priority === 'urgent');
  const high = recommendations.filter((r) => r.priority === 'high');
  const medium = recommendations.filter((r) => r.priority === 'medium');
  const low = recommendations.filter((r) => r.priority === 'low');

  const renderGroup = (title: string, list: typeof recommendations, colorClass: string, IconComponent: any) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className={`text-sm font-extrabold flex items-center gap-2 uppercase tracking-wider ${colorClass}`}>
          <IconComponent className="h-4 w-4" /> {title} ({list.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((rec) => (
            <SectionCard key={rec.id} className="p-5 hover:shadow-md transition duration-200 border-t-4 border-t-current">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-[14px] font-bold text-foreground leading-snug">{rec.title}</h4>
                  <span className="text-[10px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                    {rec.clientName || "Client Alert"}
                  </span>
                </div>
                
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-[11px] font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-secondary/20 px-2 py-1 rounded">
                    <Award className="h-3 w-3 text-primary" /> Impact: <span className="font-bold text-foreground uppercase">{rec.impactDescription || "medium"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary/20 px-2 py-1 rounded">
                    <Clock className="h-3 w-3 text-warning" /> Status: <span className="font-bold text-foreground uppercase">{rec.status || "pending"}</span>
                  </div>
                  {rec.confidenceScore !== undefined && (
                    <div className="ml-auto text-xs font-bold text-primary">
                      Confidence: {Math.round(rec.confidenceScore * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <ContentWrapper>
      <PageHeader
        title="AI Recommendations Playbook"
        description="AI-generated retention playbooks grouped by priority and expected impact."
        actions={
          <Button
            variant="primary"
            size="sm"
            isLoading={isGenerating}
            onClick={() => generate(undefined)}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            Generate Playbook
          </Button>
        }
      />

      {isLoading ? (
        <div className="section-card p-12 flex flex-col items-center justify-center min-h-[300px] border mt-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-sm text-muted-foreground">Compiling intelligence and ranking priorities...</p>
        </div>
      ) : isError ? (
        <SectionCard className="mt-6">
          <ErrorState
            title="Couldn't load recommendations"
            description={errorMessage ?? 'Something went wrong while fetching your recommendations.'}
            onRetry={refetch}
          />
        </SectionCard>
      ) : recommendations.length === 0 ? (
        <SectionCard className="mt-6">
          <EmptyState
            icon={Lightbulb}
            title="No recommendations yet"
            description='Click "Generate Playbook" to trigger the recommendation pipeline for all portfolio accounts.'
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => generate(undefined)}
                isLoading={isGenerating}
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                Generate Playbook
              </Button>
            }
          />
        </SectionCard>
      ) : (
        <div className="space-y-8 mt-6">
          {renderGroup("Urgent Priority", critical, "text-danger", ShieldAlert)}
          {renderGroup("High Priority", high, "text-danger/90", AlertTriangle)}
          {renderGroup("Medium Priority", medium, "text-warning", AlertTriangle)}
          {renderGroup("Low Priority", low, "text-success", Lightbulb)}
        </div>
      )}
    </ContentWrapper>
  );
}

export default RecommendationsPage;