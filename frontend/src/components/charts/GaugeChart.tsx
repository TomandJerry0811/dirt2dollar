import * as React from 'react';
import { cn } from '@/utils';
import { CHART_COLORS } from '@/constants';

// ============================================================
// GaugeChart Component
// ============================================================

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  colorThresholds?: { value: number; color: string }[];
}

const defaultThresholds = [
  { value: 20, color: CHART_COLORS.riskPalette.healthy },
  { value: 40, color: CHART_COLORS.riskPalette.low },
  { value: 60, color: CHART_COLORS.riskPalette.medium },
  { value: 80, color: CHART_COLORS.riskPalette.high },
  { value: 100, color: CHART_COLORS.riskPalette.critical },
];

function getColorForValue(
  value: number,
  thresholds: { value: number; color: string }[]
): string {
  const sorted = [...thresholds].sort((a, b) => a.value - b.value);
  for (const threshold of sorted) {
    if (value <= threshold.value) return threshold.color;
  }
  return sorted[sorted.length - 1].color;
}

const sizes = {
  sm: { width: 100, height: 60, strokeWidth: 8, fontSize: 16 },
  md: { width: 160, height: 90, strokeWidth: 10, fontSize: 22 },
  lg: { width: 220, height: 125, strokeWidth: 12, fontSize: 30 },
};

export function GaugeChart({
  value,
  max = 100,
  label,
  sublabel,
  size = 'md',
  className,
  colorThresholds = defaultThresholds,
}: GaugeChartProps) {
  const { width, height, strokeWidth, fontSize } = sizes[size];
  const normalized = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = getColorForValue(normalized, colorThresholds);

  const cx = width / 2;
  const cy = height - 8;
  const r = Math.min(cx, cy) - strokeWidth / 2 - 4;
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = endAngle - startAngle + Math.PI * 2;

  const valueAngle = startAngle + (normalized / 100) * Math.PI;

  function polarToCartesian(angle: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle > startAngle ? endAngle : endAngle + Math.PI * 2);
  const valueEnd = polarToCartesian(valueAngle);

  const bgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  const fgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 ${normalized > 50 ? 1 : 0} 1 ${valueEnd.x} ${valueEnd.y}`;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <svg width={width} height={height + 16} viewBox={`0 0 ${width} ${height + 16}`}>
        <path
          d={bgPath}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {normalized > 0 && (
          <path
            d={fgPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ transition: 'stroke 0.4s ease, d 0.6s ease' }}
          />
        )}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="700"
          fill="hsl(var(--foreground))"
        >
          {Math.round(normalized)}%
        </text>
      </svg>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

// ============================================================
// HeatMap Component (simplified grid-based)
// ============================================================

interface HeatMapCell {
  row: string;
  col: string;
  value: number;
}

interface HeatMapProps {
  data: HeatMapCell[];
  rows: string[];
  cols: string[];
  className?: string;
  minColor?: string;
  maxColor?: string;
}

export function HeatMap({ data, rows, cols, className }: HeatMapProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getCell = (row: string, col: string) =>
    data.find((d) => d.row === row && d.col === col);

  const getOpacity = (value: number) => 0.1 + (value / maxValue) * 0.9;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-24 p-1 text-left text-muted-foreground font-medium" />
            {cols.map((col) => (
              <th key={col} className="p-1 text-center text-muted-foreground font-medium whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <td className="p-1 text-muted-foreground font-medium whitespace-nowrap pr-3">{row}</td>
              {cols.map((col) => {
                const cell = getCell(row, col);
                const opacity = cell ? getOpacity(cell.value) : 0;
                return (
                  <td
                    key={col}
                    className="p-0.5"
                    title={`${row} / ${col}: ${cell?.value ?? 0}`}
                  >
                    <div
                      className="h-7 w-full min-w-[28px] rounded transition-all duration-200 hover:ring-1 hover:ring-primary cursor-default"
                      style={{
                        backgroundColor: `hsl(217 91% 60% / ${opacity})`,
                      }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GaugeChart;
