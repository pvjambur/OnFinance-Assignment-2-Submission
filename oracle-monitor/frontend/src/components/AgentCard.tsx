import { Activity, Cpu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isActive = agent.activity.active_task_ids.length > 0;
  const taskCount = agent.activity.active_task_ids.length;

  return (
    <div className="group relative cursor-pointer" data-agent-card={agent.name}>
      {/* Glow Effect (only when active) */}
      {isActive && (
        <div className="absolute -inset-0.5 bg-gradient-coral rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
      )}

      {/* Card */}
      <div className={cn(
        "relative bg-card rounded-2xl p-6 border transition-all duration-200",
        isActive ? "border-primary/30" : "border-border",
        "hover:border-border-strong"
      )}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
            <p className="text-xs text-muted-deep flex items-center gap-1.5">
              <Zap size={12} className="text-secondary" />
              {agent.models.join(', ')}
            </p>
          </div>

          {/* Status Badge */}
          <div className={cn(
            "p-2.5 rounded-xl border",
            isActive 
              ? "bg-accent/20 text-accent border-accent/30" 
              : "bg-foreground/5 text-muted-deep border-border"
          )}>
            <Activity size={16} className={isActive ? 'animate-pulse' : ''} />
          </div>
        </div>

        {/* Task Count */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl font-black tracking-tighter",
              isActive ? "text-primary" : "text-muted-deep"
            )}>
              {taskCount}
            </span>
            <span className="text-sm font-medium text-muted-deep">
              active {taskCount === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        {/* Task Tags */}
        <div className="flex flex-wrap gap-2 min-h-[2rem] mb-4">
          {agent.activity.active_task_ids.map((task) => (
            <span
              key={task.id}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border",
                task.status === 'running' && "bg-accent/20 text-accent border-accent/30",
                task.status === 'waiting' && "bg-secondary/20 text-secondary border-secondary/30",
                task.status === 'failed' && "bg-primary/20 text-primary border-primary/30",
                task.status === 'completed' && "bg-foreground/5 text-muted border-border"
              )}
            >
              {task.status}
            </span>
          ))}
          {taskCount === 0 && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide bg-foreground/5 text-muted-deep border border-border">
              Idle
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-deep flex items-center gap-1.5">
            <Cpu size={12} />
            {agent.deployment_name}
          </span>
          <span className="text-[10px] font-mono text-muted-deep/60">
            Max: {agent.max_parallel_invocations}
          </span>
        </div>
      </div>
    </div>
  );
}
