import * as React from 'react';
import { useClientStore } from '@/store/client.store';
import { ClientRow } from './ClientRow';
import { SkeletonTable } from '@/components/ui/Skeleton';

// ============================================================
// ClientTable
// ============================================================

export function ClientTable() {
  const { clients, isLoading, selectedRowIds, selectAllRows, clearRowSelection } = useClientStore();

  if (isLoading) {
    return <SkeletonTable rows={10} cols={6} className="mt-4" />;
  }

  if (clients.length === 0) {
    return null;
  }

  const allSelected = clients.length > 0 && selectedRowIds.size === clients.length;
  const someSelected = selectedRowIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) clearRowSelection();
    else selectAllRows(clients.map(c => c.id));
  };

  return (
    <div className="section-card overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/40 border-b border-border">
              <th className="pl-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider">Industry</th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Campaign</th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider">Health</th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Workflow</th>
              <th className="px-3 py-3 text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Owner</th>
              <th className="pr-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, i) => (
              <ClientRow key={client.id} client={client} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
