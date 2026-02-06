import { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Workload } from '@/types';

interface PodMetricsProps {
  workload: Workload[];
}

export function PodMetrics({ workload }: PodMetricsProps) {
  if (!workload?.length) return null;

  const pods = workload.flatMap(w => w.pods.map(p => ({
    name: p.pod_id.split('-').slice(-2).join('-'),
    cpu: p.cpu,
    memory: p.memory,
    status: p.status,
    deployment: w.deployment_name,
    cpuPercent: (p.cpu / 1000) * 100,
    memPercent: (p.memory / 2048) * 100,
  })));

  // Using forwardRef to avoid React warning about refs on function components
  const CustomTooltip = forwardRef<HTMLDivElement, { active?: boolean; payload?: Array<{ payload: typeof pods[0] }> }>(
    ({ active, payload }, ref) => {
      if (!active || !payload?.length) return null;

      const data = payload[0].payload;
      return (
        <div ref={ref} className="bg-background border border-border-strong rounded-xl p-4 shadow-2xl backdrop-blur-md">
          <p className="text-sm font-bold text-foreground mb-2">{data.deployment}</p>
          <p className="text-xs text-muted mb-1">Pod: <span className="font-mono text-primary">{data.name}</span></p>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-accent">CPU:</span>
              <span className="text-xs font-bold text-foreground">{data.cpu}m ({data.cpuPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-lavender">Memory:</span>
              <span className="text-xs font-bold text-foreground">{data.memory}MB ({data.memPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-muted">Status:</span>
              <span className={`text-xs font-bold ${data.status === 'Running' ? 'text-accent' : 'text-primary'}`}>
                {data.status}
              </span>
            </div>
          </div>
        </div>
      );
    }
  );
  CustomTooltip.displayName = 'CustomTooltip';

  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-border-strong transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Cluster Resources
          </h3>
          <p className="text-xs text-muted-deep">
            Real-time pod utilization metrics
          </p>
        </div>
        <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
          <span className="text-xs font-bold text-accent">
            {pods.length} Pod{pods.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pods} barGap={8} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(174, 63%, 55%)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(174, 63%, 55%)" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(263, 86%, 76%)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(263, 86%, 76%)" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              stroke="hsl(217, 20%, 44%)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(210, 40%, 98%, 0.08)' }}
            />
            <YAxis
              stroke="hsl(217, 20%, 44%)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(210, 40%, 98%, 0.08)' }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(0, 100%, 71%, 0.05)' }} />

            <Bar 
              dataKey="cpu" 
              fill="url(#cpuGradient)" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={50}
              name="CPU"
            >
              {pods.map((entry, index) => (
                <Cell key={`cpu-${index}`} fill={entry.status === 'Running' ? 'url(#cpuGradient)' : 'hsl(0, 100%, 71%)'} />
              ))}
            </Bar>

            <Bar 
              dataKey="memory" 
              fill="url(#memGradient)" 
              radius={[6, 6, 0, 0]} 
              maxBarSize={50}
              name="Memory"
            >
              {pods.map((entry, index) => (
                <Cell key={`mem-${index}`} fill={entry.status === 'Running' ? 'url(#memGradient)' : 'hsl(36, 100%, 65%)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-accent to-accent/30" />
          <span className="text-xs font-medium text-muted">CPU (millicores)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-lavender to-lavender/30" />
          <span className="text-xs font-medium text-muted">Memory (MB)</span>
        </div>
      </div>
    </div>
  );
}
