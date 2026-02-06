import { X, Activity, Cpu, Zap, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent, Task } from '@/types';

interface AgentDetailModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDetailModal({ agent, isOpen, onClose }: AgentDetailModalProps) {
  if (!isOpen || !agent) return null;

  const isActive = agent.activity.active_task_ids.length > 0;
  const taskCount = agent.activity.active_task_ids.length;

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 size={12} className="text-accent animate-spin" />;
      case 'waiting':
        return <Clock size={12} className="text-secondary" />;
      case 'completed':
        return <CheckCircle size={12} className="text-accent" />;
      case 'failed':
        return <AlertCircle size={12} className="text-primary" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l border-border z-50 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              isActive 
                ? "bg-accent/20 text-accent border border-accent/30" 
                : "bg-muted-deep/20 text-muted-deep border border-border"
            )}>
              <Activity size={20} className={isActive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{agent.name}</h2>
              <p className="text-sm text-muted-deep mt-1">{agent.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <X size={20} className="text-muted-deep" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-foreground">{taskCount}</div>
              <div className="text-xs text-muted-deep mt-1">Active Tasks</div>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-foreground">{agent.max_parallel_invocations}</div>
              <div className="text-xs text-muted-deep mt-1">Max Parallel</div>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-foreground">{agent.models.length}</div>
              <div className="text-xs text-muted-deep mt-1">Models</div>
            </div>
          </div>

          {/* Deployment Info */}
          <div className="bg-background rounded-xl p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Cpu size={14} />
              Deployment
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-muted-deep">Deployment Name</span>
                <span className="text-xs font-mono text-foreground">{agent.deployment_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-deep">Last Updated</span>
                <span className="text-xs font-mono text-foreground">{formatTime(agent.activity.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Models */}
          <div className="bg-background rounded-xl p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Zap size={14} className="text-secondary" />
              Available Models
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.models.map((model) => (
                <span
                  key={model}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-lavender/10 text-lavender border border-lavender/20"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>

          {/* Active Tasks */}
          <div className="bg-background rounded-xl p-4 border border-border">
            <h3 className="text-sm font-bold text-foreground mb-3">Active Tasks</h3>
            {taskCount === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-muted-deep/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity size={20} className="text-muted-deep" />
                </div>
                <p className="text-sm text-muted-deep">No active tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {agent.activity.active_task_ids.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card rounded-lg p-3 border border-border hover:border-border-strong transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted truncate max-w-[200px]">
                        {task.id}
                      </span>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                        task.status === 'running' && "bg-accent/20 text-accent border border-accent/30",
                        task.status === 'waiting' && "bg-secondary/20 text-secondary border border-secondary/30",
                        task.status === 'completed' && "bg-accent/20 text-accent border border-accent/30",
                        task.status === 'failed' && "bg-primary/20 text-primary border border-primary/30"
                      )}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-deep">
                      <Clock size={10} />
                      Started: {formatTime(task.started_on)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-deep hover:text-foreground bg-background border border-border hover:border-border-strong transition-all"
          >
            Close
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
            View Logs
          </button>
        </div>
      </div>
    </>
  );
}
