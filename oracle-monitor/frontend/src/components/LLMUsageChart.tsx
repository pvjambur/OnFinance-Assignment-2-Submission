import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TokenHistoryEntry {
  time: string;
  openai: number;
  anthropic: number;
  google: number;
}

interface LLMUsageChartProps {
  data: TokenHistoryEntry[];
}

export function LLMUsageChart({ data }: LLMUsageChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <p className="text-sm font-bold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted capitalize">{entry.name}:</span>
              </div>
              <span className="text-xs font-bold text-foreground">
                {(entry.value / 1000).toFixed(1)}K TPM
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border hover:border-border-strong transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Token Usage Over Time</h3>
          <p className="text-xs text-muted-deep">Tokens per minute by provider</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorOpenAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorAnthropic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--lavender))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--lavender))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-deep))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              stroke="hsl(var(--muted-deep))"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-xs text-muted capitalize">{value}</span>
              )}
            />

            <Line
              type="monotone"
              dataKey="openai"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="anthropic"
              stroke="hsl(var(--lavender))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="google"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
