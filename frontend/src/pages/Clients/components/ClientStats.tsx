import * as React from 'react';
import { Users, Shield, AlertTriangle, AlertCircle, UserX, Clock } from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { useClientStore } from '@/store/client.store';

// ============================================================
// ClientStats
// ============================================================

export function ClientStats() {
  const { clients, pagination: { total }, isLoading } = useClientStore();

  const healthy = clients.filter((c) => c.riskLevel === 'healthy' || c.riskLevel === 'low').length;
  const medium = clients.filter((c) => c.riskLevel === 'medium').length;
  const high = clients.filter((c) => c.riskLevel === 'high' || c.riskLevel === 'critical').length;
  const inactive = clients.filter((c) => c.status === 'churned').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <MetricCard
        title="Total Clients"
        value={total}
        icon={Users}
        iconColor="primary"
        isLoading={isLoading}
      />
      <MetricCard
        title="Healthy"
        value={healthy}
        icon={Shield}
        iconColor="success"
        isLoading={isLoading}
      />
      <MetricCard
        title="Medium Risk"
        value={medium}
        icon={AlertTriangle}
        iconColor="warning"
        isLoading={isLoading}
      />
      <MetricCard
        title="High Risk"
        value={high}
        icon={AlertCircle}
        iconColor="danger"
        isLoading={isLoading}
      />
      <MetricCard
        title="Inactive"
        value={inactive}
        icon={UserX}
        iconColor="info"
        isLoading={isLoading}
      />
      <MetricCard
        title="Recently Updated"
        value={Math.round(total * 0.4) || 2} // Mock metric
        icon={Clock}
        iconColor="primary"
        isLoading={isLoading}
      />
    </div>
  );
}
