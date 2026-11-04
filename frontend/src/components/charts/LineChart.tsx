import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/utils';
import { CHART_COLORS } from '@/constants';
import { CustomTooltip, type ChartDataItem, type ChartSeries } from './AreaChart';

// ============================================================
// LineChart Component
// ============================================================

interface LineChartProps {
  data: ChartDataItem[];
  series: ChartSeries[];
  xDataKey: string;
  height?: number;
  className?: string;
  tooltipFormatter?: (value: number, name: string) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  dots?: boolean;
  curved?: boolean;
}

export function LineChart({
  data,
  series,
  xDataKey,
  height = 300,
  className,
  tooltipFormatter,
  showLegend = true,
  showGrid = true,
  dots = false,
  curved = true,
}: LineChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
          {showLegend && series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS.palette[i % CHART_COLORS.palette.length];
            return (
              <Line
                key={s.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={s.dataKey}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                dot={dots ? { r: 3, fill: color, strokeWidth: 0 } : false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// TrendChart — minimal sparkline variant
// ============================================================

interface TrendChartProps {
  data: Array<{ value: number }>;
  color?: string;
  height?: number;
  className?: string;
}

export function TrendChart({
  data,
  color = CHART_COLORS.primary,
  height = 48,
  className,
}: TrendChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
