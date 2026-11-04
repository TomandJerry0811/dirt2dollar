import * as React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { SectionHeader } from '@/components/common/PageHeader';

const volumeData = [
  { time: '00:00', executions: 4 },
  { time: '04:00', executions: 28 }, // CRON spike
  { time: '08:00', executions: 12 },
  { time: '12:00', executions: 42 },
  { time: '16:00', executions: 35 },
  { time: '20:00', executions: 18 },
  { time: '24:00', executions: 8 },
];

const successData = [
  { name: 'Success', value: 1400, color: 'hsl(var(--success))' },
  { name: 'Failed', value: 50, color: 'hsl(var(--destructive))' },
];

export function WorkflowAnalytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Execution Volume */}
      <div className="section-card lg:col-span-2">
        <SectionHeader title="Execution Volume" description="Workflow runs over the last 24 hours" noBorder />
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              />
              <Area 
                type="monotone" 
                dataKey="executions" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExecutions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Success Rate */}
      <div className="section-card">
        <SectionHeader title="Success Rate" description="All-time execution status" noBorder />
        <div className="h-[250px] w-full mt-4 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={successData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--secondary))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {successData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 w-full flex justify-between px-8 text-body-sm font-semibold">
            <span className="text-success">96.5% Success</span>
            <span className="text-destructive">3.5% Failed</span>
          </div>
        </div>
      </div>

    </div>
  );
}
