import { cn } from '@/lib/utils';
import type { Pod, Workload } from '@/types';

interface PodTableProps {
  workload: Workload[];
}

export function PodTable({ workload }: PodTableProps) {
  const allPods = workload.flatMap((w) =>
    w.pods.map((p) => ({
      ...p,
      deployment: w.deployment_name,
      maxCpu: parseInt(w.pod_max_cpu),
      maxRam: parseInt(w.pod_max_ram) * 1024, // Convert Gi to MB
    }))
  );

  const getStatusColor = (status: Pod['status']) => {
    switch (status) {
      case 'Running':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'Pending':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'Failed':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted-deep/20 text-muted-deep border-muted-deep/30';
    }
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-primary';
    if (percent >= 70) return 'text-secondary';
    return 'text-accent';
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}GB`;
    return `${bytes}MB`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Pod Status</h3>
        <span className="text-xs font-medium text-muted-deep">
          {allPods.length} pods total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Pod ID
              </th>
              <th className="text-left text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Deployment
              </th>
              <th className="text-left text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-right text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                CPU
              </th>
              <th className="text-right text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Memory
              </th>
              <th className="text-right text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Network In
              </th>
              <th className="text-right text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Network Out
              </th>
              <th className="text-right text-[10px] font-bold text-muted-deep uppercase tracking-wider px-4 py-3">
                Restarts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allPods.map((pod) => {
              const cpuPercent = (pod.cpu / pod.maxCpu) * 100;
              const ramPercent = (pod.memory / pod.maxRam) * 100;
              return (
                <tr
                  key={pod.pod_id}
                  className="hover:bg-foreground/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-foreground">
                      {pod.pod_id.split('-').slice(-2).join('-')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted">{pod.deployment}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                        getStatusColor(pod.status)
                      )}
                    >
                      {pod.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-xs font-mono", getUsageColor(cpuPercent))}>
                      {pod.cpu}m
                    </span>
                    <span className="text-[10px] text-muted-deep ml-1">
                      ({cpuPercent.toFixed(0)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn("text-xs font-mono", getUsageColor(ramPercent))}>
                      {formatBytes(pod.memory)}
                    </span>
                    <span className="text-[10px] text-muted-deep ml-1">
                      ({ramPercent.toFixed(0)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-muted">
                      {pod.network_in} KB/s
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-muted">
                      {pod.network_out} KB/s
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "text-xs font-mono",
                        (pod.restarts ?? 0) > 2 ? "text-primary" : 
                        (pod.restarts ?? 0) > 0 ? "text-secondary" : "text-muted"
                      )}
                    >
                      {pod.restarts ?? 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
