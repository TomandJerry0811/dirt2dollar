import * as React from 'react';
import { useWorkflowMonitor } from '@/hooks/useWorkflowMonitor';
import { WorkflowNodeComponent } from './WorkflowNode';
import { WorkflowConnector } from './WorkflowConnector';
import type { WorkflowNode } from '@/types';

// The logical sequence of our pipeline
const PIPELINE_ORDER = [
  'trigger',
  'client_retrieval',
  'summary_generation',
  'kpi_analysis',
  'trend_interpretation',
  'embedding_generation',
  'similarity_search',
  'ai_churn_analysis',
  'recommendation_generation',
  'result_persistence'
];

export function WorkflowPipeline() {
  const { activeExecution, isLoadingExecution, selectedNode, setSelectedNode, setIsNodeDrawerOpen } = useWorkflowMonitor();

  if (isLoadingExecution) {
    return (
      <div className="section-card py-12 flex items-center justify-center">
        <div className="skeleton w-full h-32 rounded-xl" />
      </div>
    );
  }

  if (!activeExecution || !activeExecution.nodes) {
    return null;
  }

  // Sort nodes based on the pipeline order so they render sequentially
  const orderedNodes = [...activeExecution.nodes].sort(
    (a, b) => PIPELINE_ORDER.indexOf(a.type) - PIPELINE_ORDER.indexOf(b.type)
  );

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
    setIsNodeDrawerOpen(true);
  };

  return (
    <div className="section-card overflow-x-auto custom-scrollbar relative p-8">
      
      {/* Desktop Horizontal View */}
      <div className="hidden lg:flex items-center min-w-max pb-4">
        {orderedNodes.map((node, index) => {
          const isLast = index === orderedNodes.length - 1;
          
          return (
            <React.Fragment key={node.id}>
              <WorkflowNodeComponent 
                node={node} 
                isSelected={selectedNode?.id === node.id}
                onClick={() => handleNodeClick(node)}
              />
              {!isLast && (
                <WorkflowConnector 
                  status={node.status} 
                  orientation="horizontal" 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile/Tablet Vertical View */}
      <div className="flex flex-col items-center lg:hidden space-y-0">
        {orderedNodes.map((node, index) => {
          const isLast = index === orderedNodes.length - 1;
          
          return (
            <React.Fragment key={node.id}>
              <WorkflowNodeComponent 
                node={node} 
                isSelected={selectedNode?.id === node.id}
                onClick={() => handleNodeClick(node)}
              />
              {!isLast && (
                <WorkflowConnector 
                  status={node.status} 
                  orientation="vertical" 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}
