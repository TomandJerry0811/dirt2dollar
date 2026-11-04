import * as React from 'react';
import { cn } from '@/utils';
import type { ExecutionStatus } from '@/types';

interface WorkflowConnectorProps {
  status?: ExecutionStatus;
  orientation?: 'horizontal' | 'vertical';
}

export function WorkflowConnector({ status, orientation = 'horizontal' }: WorkflowConnectorProps) {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center relative",
        isHorizontal ? "w-12 h-px" : "h-12 w-px"
      )}
    >
      <div 
        className={cn(
          "absolute bg-border",
          isHorizontal ? "w-full h-[2px]" : "h-full w-[2px]",
          status === 'completed' && "bg-success",
          status === 'failed' && "bg-destructive",
          status === 'running' && "bg-primary overflow-hidden"
        )}
      >
        {status === 'running' && (
          <div 
            className={cn(
              "absolute bg-white/60",
              isHorizontal 
                ? "top-0 bottom-0 w-1/3 animate-[slide-in-right_1s_ease-in-out_infinite]" 
                : "left-0 right-0 h-1/3 animate-[slide-up_1s_ease-in-out_infinite]"
            )} 
          />
        )}
      </div>
      
      {/* Arrow head */}
      <div 
        className={cn(
          "absolute w-0 h-0 border-solid",
          isHorizontal 
            ? "right-0 border-y-[4px] border-y-transparent border-l-[6px]"
            : "bottom-0 border-x-[4px] border-x-transparent border-t-[6px]",
          status === 'completed' ? (isHorizontal ? "border-l-success" : "border-t-success") :
          status === 'failed' ? (isHorizontal ? "border-l-destructive" : "border-t-destructive") :
          status === 'running' ? (isHorizontal ? "border-l-primary" : "border-t-primary") :
          (isHorizontal ? "border-l-border" : "border-t-border")
        )}
      />
    </div>
  );
}
