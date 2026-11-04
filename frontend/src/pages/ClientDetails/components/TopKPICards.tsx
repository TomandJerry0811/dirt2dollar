import * as React from 'react';
import { Activity, ShieldAlert, Heart, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import type { Client } from '@/types';

// ============================================================
// TopKPICards
// ============================================================

export function TopKPICards({ client }: { client: Client }) {
  const satScore = (client.metadata as any)?.satisfaction_score ?? Math.round(100 - client.churnProbability * 0.6);
  const recCount = (client.metadata as any)?.action_items?.length ?? 5;
  const roi = Math.max(95, Math.min(220, Math.round(120 + (client.healthScore - 50) * 0.8)));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        title="Health Score"
        value={`${client.healthScore}/100`}
        icon={Heart}
        iconColor={client.healthScore > 70 ? 'success' : client.healthScore > 50 ? 'warning' : 'danger'}
        trend={{ value: 5, percent: 5, period: 'vs last month', direction: client.healthScore > 50 ? 'up' : 'down' }}
      />
      <MetricCard
        title="Churn Probability"
        value={`${client.churnProbability}%`}
        icon={ShieldAlert}
        iconColor={client.churnProbability > 60 ? 'danger' : client.churnProbability > 30 ? 'warning' : 'success'}
        trend={{ 
          value: client.churnProbability > 60 ? 8 : -4, 
          percent: client.churnProbability > 60 ? 8 : -4, 
          period: 'vs AI benchmark', 
          direction: client.churnProbability > 60 ? 'up' : 'down' 
        }}
      />
      <MetricCard
        title="Revenue (MRR)"
        value={`$${(client.mrr / 1000).toFixed(1)}k`}
        icon={TrendingUp}
        iconColor="primary"
        trend={{ value: 12, percent: 12, period: 'annual run rate', direction: 'up' }}
      />
      <MetricCard
        title="Satisfaction Score"
        value={`${satScore}/100`}
        icon={Activity}
        iconColor={satScore > 70 ? 'success' : satScore > 40 ? 'warning' : 'danger'}
        trend={{ value: satScore > 60 ? 6 : -10, percent: satScore > 60 ? 6 : -10, period: 'vs baseline', direction: satScore > 60 ? 'up' : 'down' }}
      />
      <MetricCard
        title="Campaign ROI"
        value={`${roi}%`}
        icon={Target}
        iconColor="success"
        trend={{ value: 8, percent: 8, period: 'vs expected', direction: 'up' }}
      />
      <MetricCard
        title="AI Recommendations"
        value={`${recCount} Action${recCount === 1 ? '' : 's'}`}
        icon={Lightbulb}
        iconColor="warning"
      />
    </div>
  );
}

export default TopKPICards;
