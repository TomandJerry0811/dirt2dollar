import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/utils';
import { CHART_COLORS } from '@/constants';

// ============================================================
// Shared Chart Types
// ============================================================

export interface ChartDataItem {
  [key: string]: string | number;
}

export interface ChartSeries {
  dataKey: string;
  label: string;
  color?: string;
}

// ============================================================
// Custom Tooltip
// ============================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg border border-border/80 p-3 shadow-xl text-xs">
      {label && <p className="text-muted-foreground mb-2 font-medium">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// AreaChart Component
// ============================================================

interface AreaChartProps {
  data: ChartDataItem[];
  series: ChartSeries[];
  xDataKey: string;
  height?: number;
  className?: string;
  tooltipFormatter?: (value: number, name: string) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  gradient?: boolean;
}

export function AreaChart({
  data,
  series,
  xDataKey,
  height = 300,
  className,
  tooltipFormatter,
  showLegend = true,
  showGrid = true,
  gradient = true,
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? CHART_COLORS.palette[i % CHART_COLORS.palette.length];
              return (
                <linearGradient key={s.dataKey} id={`gradient-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          )}
          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS.palette[i % CHART_COLORS.palette.length];
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                fill={gradient ? `url(#gradient-${s.dataKey})` : color}
                fillOpacity={gradient ? 1 : 0.1}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { CustomTooltip };
export default AreaChart;
