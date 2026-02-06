import { Cpu, Server, Radio, Zap, Activity } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { StatCard } from '@/components/StatCard';
import { PodMetrics } from '@/components/PodMetrics';
import { QueuePanel } from '@/components/QueuePanel';
import { AlertsTicker } from '@/components/AlertsTicker';
import { mockAgents, mockWorkload, mockQueues, mockLLMModels, mockAlerts } from '@/data/mockData';

const Index = () => {
  // Calculate stats from mock data
  const activeAgents = mockAgents.filter(a => a.activity.active_task_ids.length > 0).length;
  const totalPods = mockWorkload.reduce((sum, w) => sum + w.pods.length, 0);
  const queuedTasks = mockQueues.reduce((sum, q) => sum + q.tasks.length, 0);
  const llmThroughput = mockLLMModels.reduce((sum, m) => sum + m.tpm, 0);
  
  // Filter only high priority tasks for the condensed queue view
  const highPriorityQueues = mockQueues.map(q => ({
    ...q,
    tasks: q.tasks.filter(t => t.priority.level === 'critical' || t.priority.level === 'high')
  })).filter(q => q.tasks.length > 0);

  // Calculate cluster health percentage
  const runningPods = mockWorkload.flatMap(w => w.pods).filter(p => p.status === 'Running').length;
  const clusterHealth = Math.round((runningPods / totalPods) * 100);

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Activity size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mission Control
            </h1>
            <p className="text-sm text-muted-deep">
              Real-time system health overview
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Active Agents"
          value={`${activeAgents}/${mockAgents.length}`}
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
          <PodMetrics workload={mockWorkload} />
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
        <AlertsTicker alerts={mockAlerts} />
      </div>
    </MainLayout>
  );
};

export default Index;
