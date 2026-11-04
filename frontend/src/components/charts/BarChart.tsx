import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { cn } from '@/utils';
import { CHART_COLORS } from '@/constants';
import { CustomTooltip, type ChartDataItem, type ChartSeries } from './AreaChart';

// ============================================================
// BarChart Component
// ============================================================

interface BarChartProps {
  data: ChartDataItem[];
  series: ChartSeries[];
  xDataKey: string;
  height?: number;
  className?: string;
  tooltipFormatter?: (value: number, name: string) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  layout?: 'vertical' | 'horizontal';
  rounded?: boolean;
  colorByValue?: boolean;
}

export function BarChart({
  data,
  series,
  xDataKey,
  height = 300,
  className,
  tooltipFormatter,
  showLegend = true,
  showGrid = true,
  layout = 'horizontal',
  rounded = true,
  colorByValue = false,
}: BarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}
          <XAxis
            dataKey={isVertical ? undefined : xDataKey}
            type={isVertical ? 'number' : 'category'}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey={isVertical ? xDataKey : undefined}
            type={isVertical ? 'category' : 'number'}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
            width={isVertical ? 80 : 40}
          />
          <Tooltip content={<CustomTooltip formatter={tooltipFormatter} />} />
          {showLegend && series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => {
            const color = s.color ?? CHART_COLORS.palette[i % CHART_COLORS.palette.length];
            return (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.label}
                fill={color}
                radius={rounded ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                maxBarSize={48}
              >
                {colorByValue &&
                  data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]}
                    />
                  ))}
              </Bar>
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
