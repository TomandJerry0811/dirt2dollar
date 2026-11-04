import * as React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain,
  FileText,
  Sparkles,
  GitBranch,
  Download,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/utils';
import type { QuickAction } from '../dashboard.types';
import { QUICK_ACTIONS } from '../dashboard.data';

// ============================================================
// Icon map
// ============================================================

const ICON_MAP: Record<string, React.ElementType> = {
  'brain':       Brain,
  'file-text':   FileText,
  'sparkles':    Sparkles,
  'git-branch':  GitBranch,
  'download':    Download,
  'refresh-cw':  RefreshCw,
};

const colorConfig: Record<QuickAction['color'], { bg: string; icon: string; border: string; hoverBg: string }> = {
  primary: { bg: 'bg-primary/10',     icon: 'text-primary',     border: 'border-primary/20',      hoverBg: 'hover:bg-primary/15' },
  success: { bg: 'bg-success/10',     icon: 'text-success',     border: 'border-success/20',      hoverBg: 'hover:bg-success/15' },
  warning: { bg: 'bg-warning/10',     icon: 'text-warning',     border: 'border-warning/20',      hoverBg: 'hover:bg-warning/15' },
  info:    { bg: 'bg-info/10',        icon: 'text-info',        border: 'border-info/20',         hoverBg: 'hover:bg-info/15' },
  default: { bg: 'bg-secondary',      icon: 'text-muted-foreground', border: 'border-border',     hoverBg: 'hover:bg-secondary' },
};

// ============================================================
// QuickActionCard
// ============================================================

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

function QuickActionCard({ action, index }: QuickActionCardProps) {
  const Icon = ICON_MAP[action.icon] ?? Sparkles;
  const colors = colorConfig[action.color];

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        'section-card p-4 flex flex-col gap-3 cursor-pointer select-none',
        'transition-all duration-200',
        'hover:shadow-md hover:border-primary/25',
        'group'
      )}
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', colors.bg, colors.border)}>
        <Icon className={cn('h-4 w-4', colors.icon)} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
          {action.label}
        </p>
        <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
          {action.description}
        </p>
      </div>
    </motion.div>
  );

  if (action.href) {
    return <Link to={action.href}>{content}</Link>;
  }

  return <div onClick={action.onClick}>{content}</div>;
}

// ============================================================
// QuickActionBar
// ============================================================

interface QuickActionBarProps {
  onRefresh?: () => void;
  onOpenAI?: () => void;
}

export function QuickActionBar({ onRefresh, onOpenAI }: QuickActionBarProps) {
  const actions = QUICK_ACTIONS.map((action) => ({
    ...action,
    onClick:
      action.id === 'refresh' ? onRefresh :
      action.id === 'ai'      ? onOpenAI  :
      action.onClick,
  }));

  return (
    <div className="space-y-2">
      <p className="text-label text-muted-foreground">Quick Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, i) => (
          <QuickActionCard key={action.id} action={action} index={i} />
        ))}
      </div>
    </div>
  );
}
