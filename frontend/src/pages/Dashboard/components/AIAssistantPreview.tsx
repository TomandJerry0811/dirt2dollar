import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/Button';

// ============================================================
// AI Assistant Preview Card
// ============================================================

const SUGGESTED_PROMPTS = [
  'Show high risk clients',
  'Explain KPI trend',
  'Generate executive summary',
  'Which clients need EBR?',
];

interface AIAssistantPreviewProps {
  onOpen?: () => void;
  className?: string;
}

export function AIAssistantPreview({ onOpen, className }: AIAssistantPreviewProps) {
  const [selectedPrompt, setSelectedPrompt] = React.useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        'section-card overflow-hidden',
        'border border-primary/20 bg-gradient-to-br from-card to-primary/[0.03]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-foreground leading-snug">AI Assistant</p>
            <p className="text-[11.5px] text-muted-foreground">Ask Customer Churn Predictor AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11.5px] text-muted-foreground">Ready</span>
        </div>
      </div>

      {/* Chat preview area */}
      <div className="px-5 py-4 space-y-3">
        {/* AI bubble */}
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="bg-secondary rounded-lg rounded-tl-none px-3 py-2.5 max-w-xs">
            <p className="text-[12.5px] text-foreground leading-relaxed">
              Hello! I'm your AI assistant. I can analyze clients, generate summaries, and answer questions about your portfolio.
            </p>
          </div>
        </div>

        {/* Suggested question */}
        {selectedPrompt && (
          <div className="flex justify-end">
            <div className="bg-primary/10 border border-primary/20 rounded-lg rounded-tr-none px-3 py-2 max-w-xs">
              <p className="text-[12.5px] text-primary font-medium">{selectedPrompt}</p>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="px-5 pb-4">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
          Suggested Questions
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setSelectedPrompt(prompt)}
              className={cn(
                'text-left px-3 py-2 rounded-lg text-[12px] font-medium',
                'border transition-all duration-150',
                selectedPrompt === prompt
                  ? 'border-primary/40 bg-primary/8 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground'
              )}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={onOpen}
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
        >
          Open AI Assistant
        </Button>
      </div>
    </motion.div>
  );
}
