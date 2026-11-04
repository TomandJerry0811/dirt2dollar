import * as React from 'react';
import { cn } from '@/utils';
import type { WorkflowNode, ExecutionStatus } from '@/types';
import { 
  PlayCircle, Search, FileText, BarChart2, Activity, 
  Box, Users, BrainCircuit, Lightbulb, Save,
  CheckCircle2, AlertCircle, XCircle, Clock
} from 'lucide-react';

interface WorkflowNodeProps {
  node: WorkflowNode;
  isSelected?: boolean;
  onClick?: () => void;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'trigger': return <PlayCircle className="w-5 h-5" />;
    case 'client_retrieval': return <Search className="w-5 h-5" />;
    case 'summary_generation': return <FileText className="w-5 h-5" />;
    case 'kpi_analysis': return <BarChart2 className="w-5 h-5" />;
    case 'trend_interpretation': return <Activity className="w-5 h-5" />;
    case 'embedding_generation': return <Box className="w-5 h-5" />;
    case 'similarity_search': return <Users className="w-5 h-5" />;
    case 'ai_churn_analysis': return <BrainCircuit className="w-5 h-5" />;
    case 'recommendation_generation': return <Lightbulb className="w-5 h-5" />;
    case 'result_persistence': return <Save className="w-5 h-5" />;
    default: return <Box className="w-5 h-5" />;
  }
};

const getStatusConfig = (status?: ExecutionStatus) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-success/10',
        border: 'border-success/30',
        iconColor: 'text-success',
        statusIcon: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
        text: 'Completed',
        animation: ''
      };
    case 'running':
      return {
        bg: 'bg-primary/10',
        border: 'border-primary',
        iconColor: 'text-primary',
        statusIcon: <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />,
        text: 'Running',
        animation: 'ring-4 ring-primary/20 shadow-primary/20 shadow-lg'
      };
    case 'failed':
      return {
        bg: 'bg-destructive/10',
        border: 'border-destructive',
        iconColor: 'text-destructive',
        statusIcon: <XCircle className="w-3.5 h-3.5 text-destructive" />,
        text: 'Failed',
        animation: ''
      };
    case 'warning':
      return {
        bg: 'bg-warning/10',
        border: 'border-warning/50',
        iconColor: 'text-warning',
        statusIcon: <AlertCircle className="w-3.5 h-3.5 text-warning" />,
        text: 'Warning',
        animation: ''
      };
    default: // pending or undefined
      return {
        bg: 'bg-secondary',
        border: 'border-border',
        iconColor: 'text-muted-foreground',
        statusIcon: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
        text: 'Pending',
        animation: 'opacity-60'
      };
  }
};

export function WorkflowNodeComponent({ node, isSelected, onClick }: WorkflowNodeProps) {
  const config = getStatusConfig(node.status);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 w-[220px] rounded-xl border bg-card cursor-pointer transition-all duration-300",
        config.border,
        config.animation,
        isSelected && "ring-2 ring-primary ring-offset-2",
        !isSelected && "hover:border-primary/50 hover:shadow-md"
      )}
    >
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg mb-3", config.bg, config.iconColor)}>
        {getNodeIcon(node.type)}
      </div>
      
      <div className="text-center w-full">
        <h4 className="text-body-sm font-semibold truncate px-2" title={node.data.label}>
          {node.data.label}
        </h4>
        
        <div className="flex items-center justify-center gap-1.5 mt-2 text-caption">
          {config.statusIcon}
          <span className="font-medium">{config.text}</span>
          {node.duration && (
            <span className="text-muted-foreground ml-1">· {node.duration}s</span>
          )}
        </div>
      </div>
    </div>
  );
}
