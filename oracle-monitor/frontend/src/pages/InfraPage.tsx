import { useState, useEffect } from 'react';
import { Server, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PodMetrics } from '@/components/PodMetrics';
import { PodTable } from '@/components/PodTable';
import { LogsConsole } from '@/components/LogsConsole';
import { api } from '@/services/api';
import type { Workload, LogEntry } from '@/types';

const InfraPage = () => {
  const [workload, setWorkload] = useState<Workload[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch initial data
      const [snapshot, fetchedLogs] = await Promise.all([
        api.getLatestSnapshot(),
        api.getLogs()
      ]);

      if (snapshot && snapshot.workload) {
        setWorkload(snapshot.workload);
      }
      if (fetchedLogs) {
        setLogs(fetchedLogs);
      }
      setLoading(false);
    };

    fetchData();

    // Subscribe to updates
    const subscription = api.subscribeToSnapshots((snapshot) => {
      if (snapshot && snapshot.workload) {
        setWorkload(snapshot.workload);
      }
      // Also refresh logs when new snapshots arrive (or separate logic for logs)
      api.getLogs().then(setLogs);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const totalPods = workload.reduce((sum, w) => sum + w.pods.length, 0);
  const runningPods = workload.flatMap(w => w.pods).filter(p => p.status === 'Running').length;
  const failedPods = workload.flatMap(w => w.pods).filter(p => p.status === 'Failed').length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

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
          <div className="text-2xl font-bold text-foreground">{workload.length}</div>
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
        <PodMetrics workload={workload} />
      </div>

      {/* Pod Status Table */}
      <div className="mb-8">
        <PodTable workload={workload} />
      </div>

      {/* Logs Console */}
      <div>
        <LogsConsole logs={logs} maxHeight="max-h-80" />
      </div>
    </MainLayout>
  );
};

export default InfraPage;
