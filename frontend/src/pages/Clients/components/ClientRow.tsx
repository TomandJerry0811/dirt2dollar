import * as React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils';
import type { Client } from '@/types';
import { useClientStore } from '@/store/client.store';
import { HealthScore, RiskBadge, WorkflowBadge, ClientAvatar } from './ClientTableBlocks';

// ============================================================
// DropdownMenu Stub (Simulates Shadcn Dropdown)
// ============================================================
// In a real app we'd use Shadcn DropdownMenu, but we use a native relative menu here for isolation

import { useNavigate } from 'react-router-dom';
import { useClientDetailsStore } from '@/store/client-details.store';

function ActionMenu({ client }: { client: Client }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setActiveTab } = useClientDetailsStore();

  React.useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="h-8 w-8 rounded flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveTab('overview'); navigate(`/client/${client.id}`); }} 
            className="w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-secondary"
          >
            View Details
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveTab('analytics'); navigate(`/client/${client.id}`); }} 
            className="w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-secondary"
          >
            KPI Analytics & Charts
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveTab('recommendations'); navigate(`/client/${client.id}`); }} 
            className="w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-secondary text-primary font-medium"
          >
            AI Recommendations
          </button>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              navigate(`/ai-analysis?query=${encodeURIComponent(`give me churn analysis for ${client.name}`)}&run=true`); 
            }} 
            className="w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-secondary"
          >
            Run AI Analysis
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ClientRow
// ============================================================

interface ClientRowProps {
  client: Client;
  index: number;
}

export function ClientRow({ client, index }: ClientRowProps) {
  const { selectedRowIds, toggleRowSelection, setSelectedClient } = useClientStore();
  const isSelected = selectedRowIds.has(client.id);

  const getRiskColor = (risk: string) => {
    if (risk === 'critical') return 'bg-destructive';
    if (risk === 'high') return 'bg-destructive/60';
    if (risk === 'medium') return 'bg-warning';
    if (risk === 'low') return 'bg-info';
    return 'bg-success';
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={() => setSelectedClient(client)}
      className={cn(
        'group cursor-pointer border-b border-border/50 last:border-0 transition-colors',
        isSelected ? 'bg-primary/5' : 'hover:bg-secondary/40'
      )}
    >
      {/* Selection Checkbox */}
      <td className="pl-4 py-3 w-10 relative">
        <div className={cn('absolute left-0 top-0 bottom-0 w-1', getRiskColor(client.riskLevel))} />
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            toggleRowSelection(client.id);
          }}
          className="rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
        />
      </td>

      <td className="px-3 py-3 min-w-[200px]">
        <ClientAvatar name={client.name} tier={client.tier} />
      </td>

      <td className="px-3 py-3 text-[12.5px] text-muted-foreground whitespace-nowrap">
        {client.industry}
      </td>

      <td className="px-3 py-3 text-[12.5px] text-muted-foreground whitespace-nowrap hidden lg:table-cell">
        {client.campaign || '—'}
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <HealthScore score={client.healthScore} />
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <RiskBadge level={client.riskLevel} />
      </td>

      <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
        <WorkflowBadge status={client.workflowStatus} />
      </td>

      <td className="px-3 py-3 text-[12.5px] text-muted-foreground whitespace-nowrap hidden xl:table-cell">
        {client.accountManager || 'Unassigned'}
      </td>

      <td className="pr-4 py-3 text-right">
        <ActionMenu client={client} />
      </td>
    </motion.tr>
  );
}
