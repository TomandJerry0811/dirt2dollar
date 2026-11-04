import * as React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { SEED_RISK_FACTORS } from '../client-details.data';
import type { RiskFactor, Client } from '@/types';
import { cn } from '@/utils';

// ============================================================
// ChurnScoreGauge
// ============================================================

function ChurnScoreGauge({ client }: { client: Client }) {
  const prob = client.churnProbability;
  
  let color = '#22C55E';
  if (prob > 30) color = '#F59E0B';
  if (prob > 60) color = '#EF4444';
  if (prob > 85) color = '#991B1B';

  const radius = 60;
  const circ = 2 * Math.PI * radius;
  const strokePct = ((100 - prob) * circ) / 100;

  return (
    <div className="section-card p-6 flex flex-col items-center justify-center text-center">
      <h3 className="text-[14px] font-semibold text-foreground mb-6">Overall Churn Risk</h3>
      <div className="relative flex items-center justify-center mb-4">
        <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" />
          <motion.circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: strokePct }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-foreground" style={{ color }}>{prob}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
        <Brain className="h-3.5 w-3.5" />
        AI Confidence: 89%
      </div>
    </div>
  );
}

// ============================================================
// RiskFactorsList
// ============================================================

function RiskFactorsList({ factors = SEED_RISK_FACTORS }: { factors?: RiskFactor[] }) {
  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'text-destructive bg-destructive/10 border-destructive/20';
    if (impact === 'medium') return 'text-warning bg-warning/10 border-warning/20';
    return 'text-info bg-info/10 border-info/20';
  };

  return (
    <div className="section-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-4 w-4 text-foreground" />
        <h3 className="text-[14px] font-semibold text-foreground">Identified Risk Factors</h3>
      </div>
      
      <div className="space-y-3">
        {factors.map((factor) => (
          <div key={factor.id} className="p-3.5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="text-[13px] font-semibold text-foreground">{factor.name}</h4>
              <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', getImpactColor(factor.impact))}>
                {factor.impact} Impact
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{factor.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Model Weight:</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${factor.weight}%` }} />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{factor.weight}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// AIAnalysisTab
// ============================================================

export function AIAnalysisTab({ client }: { client: Client }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="section-card p-6 border-l-4 border-l-primary bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-[16px] font-bold text-foreground">Deep Dive Analysis</h2>
        </div>
        <p className="text-[14px] leading-relaxed text-foreground/90">
          The Customer Churn Predictor analysis model has processed 45 data points across engagement, support, and billing history. 
          The primary driver for the high churn probability is the recent departure of the executive sponsor combined with a stagnant adoption of the secondary module. 
          Historically, accounts in this tier with similar health degradation trajectories churn within 90 days of renewal if executive alignment is not re-established.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ChurnScoreGauge client={client} />
        </div>
        <div className="lg:col-span-2">
          <RiskFactorsList />
        </div>
      </div>
    </motion.div>
  );
}
