import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientStore } from '@/store/client.store';
import { FileText, Sparkles, Download, Trash2, X, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ============================================================
// BulkActions
// ============================================================

export function BulkActions() {
  const { selectedRowIds, clearRowSelection } = useClientStore();
  
  const count = selectedRowIds.size;
  if (count === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-xl bg-card border border-border shadow-xl"
      >
        <div className="flex items-center gap-2 pr-4 border-r border-border">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[12px] font-bold">
            {count}
          </div>
          <span className="text-[13px] font-semibold text-foreground">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
            Generate Reports
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
            Run AI Analysis
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Export
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Archive className="h-3.5 w-3.5" />}>
            Archive
          </Button>
          <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
            Delete
          </Button>
        </div>

        <button
          onClick={clearRowSelection}
          className="ml-2 h-7 w-7 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
