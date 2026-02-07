import { useState, useEffect } from 'react';
import { Cpu, Server, Radio, Zap, Activity, Loader2, X, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/layouts/MainLayout';
import { StatCard } from '@/components/StatCard';
import { PodMetrics } from '@/components/PodMetrics';
import { QueuePanel } from '@/components/QueuePanel';
import { AlertsTicker } from '@/components/AlertsTicker';
import { LogsConsole } from '@/components/LogsConsole';
import { api } from '@/services/api';
import type { Agent, Workload, Queue, LLMModel, Alert, LogEntry } from '@/types';

const Index = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workload, setWorkload] = useState<Workload[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [llmModels, setLlmModels] = useState<LLMModel[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [snapshot, logs] = await Promise.all([
        api.getLatestSnapshot(),
        api.getLogs(50) // Fetch recent logs for alerts
      ]);

      if (snapshot) {
        setAgents(snapshot.agents || []);
        setWorkload(snapshot.workload || []);
        setQueues(snapshot.queues || []);
        setLlmModels(snapshot.litellm || []);
        setLastUpdated(new Date(snapshot.timestamp));
      }

      if (logs) {
        setLogs(logs);
        // Convert logs to alerts (filter for warnings/errors)
        const newAlerts: Alert[] = logs
          .filter(l => l.level === 'warning' || l.level === 'error')
          .map(l => ({
            id: l.id,
            level: l.level as 'warning' | 'error',
            message: l.message,
            timestamp: l.timestamp,
            source: l.source,
            acknowledged: false
          }));
        setAlerts(newAlerts);
      }

      setLoading(false);
    };

    fetchData();

    const subscription = api.subscribeToSnapshots((snapshot) => {
      if (snapshot) {
        setAgents(snapshot.agents || []);
        setWorkload(snapshot.workload || []);
        setQueues(snapshot.queues || []);
        setLlmModels(snapshot.litellm || []);
        setLastUpdated(new Date(snapshot.timestamp));
      }
      // Refresh logs/alerts on new snapshot
      api.getLogs(50).then(logs => {
        setLogs(logs);
        const newAlerts: Alert[] = logs
          .filter(l => l.level === 'warning' || l.level === 'error')
          .map(l => ({
            id: l.id,
            level: l.level as 'warning' | 'error',
            message: l.message,
            timestamp: l.timestamp,
            source: l.source,
            acknowledged: false
          }));
        setAlerts(newAlerts);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Calculate stats from real data
  const activeAgents = agents.filter(a => a.activity.active_task_ids.length > 0).length;
  const totalPods = workload.reduce((sum, w) => sum + w.pods.length, 0);
  const queuedTasks = queues.reduce((sum, q) => sum + q.tasks.length, 0);
  const llmThroughput = llmModels.reduce((sum, m) => sum + m.tpm, 0);

  // Filter only high priority tasks for the condensed queue view
  const highPriorityQueues = queues.map(q => ({
    ...q,
    tasks: q.tasks.filter(t => t.priority.level === 'critical' || t.priority.level === 'high')
  })).filter(q => q.tasks.length > 0);

  // Calculate cluster health percentage
  const runningPods = workload.flatMap(w => w.pods).filter(p => p.status === 'Running').length;
  const clusterHealth = totalPods > 0 ? Math.round((runningPods / totalPods) * 100) : 100;

  const handleInitiateTask = async () => {
    setIsInitiating(true);
    const result = await api.createTask("Scan system for optimizations", "high");
    if (result) {
      console.log("Task initiated:", result);
      // Optional: Show toast
    }
    setIsInitiating(false);
  };

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    try {
      const response = await fetch('http://localhost:8000/reports/progress-report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oracle_monitor_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
    setIsDownloadingReport(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Activity size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mission Control
            </h1>
            <p className="text-sm text-muted-deep line-clamp-1">
              {lastUpdated ? `Last state sync: ${lastUpdated.toLocaleTimeString()}` : 'Connecting to Oracle...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleInitiateTask}
            disabled={isInitiating}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isInitiating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
            Initiate Task
          </button>

          <button
            onClick={handleDownloadReport}
            disabled={isDownloadingReport}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isDownloadingReport ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Stats Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Active Agents"
          value={`${activeAgents}/${agents.length}`}
          icon={<Cpu />}
          trend="up"
          color="coral"
        />
        <StatCard
          label="Queue Depth"
          value={queuedTasks}
          icon={<Radio />}
          alert={queuedTasks > 5}
          color="amber"
        />
        <StatCard
          label="LLM Token Rate"
          value={`${(llmThroughput / 1000).toFixed(0)}K TPM`}
          icon={<Zap />}
          trend="up"
          color="lavender"
        />
        <StatCard
          label="Cluster Health"
          value={`${clusterHealth}%`}
          icon={<Server />}
          trend={clusterHealth >= 90 ? 'up' : 'stable'}
          alert={clusterHealth < 80}
          color="mint"
        />
      </div>

      {/* Main Grid - Middle Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Pod Metrics (2/3 width) */}
        <div className="xl:col-span-2">
          <PodMetrics workload={workload} />
        </div>

        {/* Right Column - High Priority Queue (1/3 width) */}
        <div className="xl:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground mb-1">
              Priority Queue
            </h2>
            <p className="text-xs text-muted-deep">
              Critical & High priority tasks only
            </p>
          </div>
          <QueuePanel queues={highPriorityQueues.length > 0 ? highPriorityQueues : [{
            name: 'priority-queue',
            updated_at: new Date().toISOString(),
            tasks: []
          }]} />
        </div>
      </div>

      {/* Bottom - Recent Alerts */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground mb-1">
            System Alerts
          </h2>
          <p className="text-xs text-muted-deep">
            Recent warnings and errors
          </p>
        </div>
        <AlertsTicker alerts={alerts} />
      </div>

      {/* Logs Console */}
      <div className="mt-8 mb-12">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-foreground mb-1">
            Real-time Output
          </h2>
          <p className="text-xs text-muted-deep">
            Live execution stream from Kubernetes collectors
          </p>
        </div>
        <LogsConsole
          logs={logs}
          onTaskClick={(taskId) => {
            console.log("Telemetry Action: Trace Task", taskId);
            // In a real app, this would open a Task Trace View
            alert(`Tracing Telemetry for Task ID: ${taskId}\n\nThis feature allows you to see the exact K8s pod and Agent that handled this request.`);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
