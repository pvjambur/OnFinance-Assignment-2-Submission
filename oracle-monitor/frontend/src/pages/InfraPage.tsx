import { Server } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PodMetrics } from '@/components/PodMetrics';
import { PodTable } from '@/components/PodTable';
import { LogsConsole } from '@/components/LogsConsole';
import { mockWorkload, mockLogs } from '@/data/mockData';

const InfraPage = () => {
  const totalPods = mockWorkload.reduce((sum, w) => sum + w.pods.length, 0);
  const runningPods = mockWorkload.flatMap(w => w.pods).filter(p => p.status === 'Running').length;
  const failedPods = mockWorkload.flatMap(w => w.pods).filter(p => p.status === 'Failed').length;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
            <Server size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Infrastructure Grid
            </h1>
            <p className="text-sm text-muted-deep">
              Container and cluster health monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-foreground">{mockWorkload.length}</div>
          <div className="text-xs text-muted-deep">Deployments</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-accent">{runningPods}</div>
          <div className="text-xs text-muted-deep">Running Pods</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-secondary">{totalPods - runningPods - failedPods}</div>
          <div className="text-xs text-muted-deep">Pending Pods</div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="text-2xl font-bold text-primary">{failedPods}</div>
          <div className="text-xs text-muted-deep">Failed Pods</div>
        </div>
      </div>

      {/* Pod Metrics Chart - Expanded */}
      <div className="mb-8">
        <PodMetrics workload={mockWorkload} />
      </div>

      {/* Pod Status Table */}
      <div className="mb-8">
        <PodTable workload={mockWorkload} />
      </div>

      {/* Logs Console */}
      <div>
        <LogsConsole logs={mockLogs} maxHeight="max-h-80" />
      </div>
    </MainLayout>
  );
};

export default InfraPage;
