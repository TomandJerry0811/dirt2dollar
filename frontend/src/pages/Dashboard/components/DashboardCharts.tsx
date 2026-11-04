import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { RiskDistributionSlice, ChurnTrendPoint } from '../dashboard.types';
import { PLACEHOLDER_RISK_DISTRIBUTION, PLACEHOLDER_CHURN_TREND } from '../dashboard.data';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/utils';

// ============================================================
// Custom Tooltip — shared white design
// ============================================================

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="section-card px-3 py-2.5 shadow-lg text-[12px]">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof entry.value === 'number' && entry.name !== 'Clients'
              ? `${entry.value}%`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// RiskDistributionChart — Pie
// ============================================================

interface RiskDistributionChartProps {
  data?: RiskDistributionSlice[];
  className?: string;
}

const CustomLegend = ({ payload }: { payload?: Array<{ color: string; value: string; payload: { value: number } }> }) => (
  <div className="flex flex-col gap-1.5 mt-3">
    {payload?.map((entry) => (
      <div key={entry.value} className="flex items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
        <span className="font-semibold text-foreground">{entry.payload?.value ?? 0}</span>
      </div>
    ))}
  </div>
);

export function RiskDistributionChart({ data = PLACEHOLDER_RISK_DISTRIBUTION, className }: RiskDistributionChartProps) {
  return (
    <div className={cn('section-card p-5', className)}>
      <h3 className="text-[14px] font-semibold text-foreground mb-4">Churn Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((slice, i) => (
              <Cell key={i} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            content={({ payload }) => (
              <CustomLegend payload={payload as Parameters<typeof CustomLegend>[0]['payload']} />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// ChurnTrendChart — Area
// ============================================================

interface ChurnTrendChartProps {
  data?: ChurnTrendPoint[];
  className?: string;
}

export function ChurnTrendChart({ data = PLACEHOLDER_CHURN_TREND, className }: ChurnTrendChartProps) {
  return (
    <div className={cn('section-card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">Monthly Churn Trend</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Actual vs AI predicted churn rate (%)</p>
        </div>
        <div className="flex items-center gap-3 text-[11.5px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-primary" />
            <span className="text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-info" style={{ opacity: 0.6 }} />
            <span className="text-muted-foreground">Predicted</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(221,83%,53%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(221,83%,53%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="hsl(199,89%,48%)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(199,89%,48%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 'dataMax + 2']}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="churnRate"
            name="Actual"
            stroke="hsl(221,83%,53%)"
            strokeWidth={2}
            fill="url(#churnGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            name="Predicted"
            stroke="hsl(199,89%,48%)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill="url(#predGrad)"
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
