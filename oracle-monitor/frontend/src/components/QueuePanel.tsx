import { Radio, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Queue } from '@/types';

interface QueuePanelProps {
  queues: Queue[];
}

export function QueuePanel({ queues }: QueuePanelProps) {
  if (!queues?.length) return null;

  return (
    <div className="space-y-4">
      {queues.map((queue) => (
        <div key={queue.name} className="bg-card rounded-2xl p-5 border border-border hover:border-border-strong transition-colors">
          {/* Queue Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-lavender/10 rounded-lg border border-lavender/20">
                <Radio size={14} className="text-lavender" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">{queue.name}</h4>
                <p className="text-[10px] text-muted-deep mt-0.5">Message Bus</p>
              </div>
            </div>

            {/* Task Count Badge */}
            <div className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-bold border",
              queue.tasks.length > 5 
                ? "bg-primary/20 text-primary border-primary/30 animate-pulse" 
                : queue.tasks.length > 0
                ? "bg-secondary/20 text-secondary border-secondary/30"
                : "bg-foreground/5 text-muted-deep border-border"
            )}>
              {queue.tasks.length} pending
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar">
            {queue.tasks.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Radio size={20} className="text-muted-deep" />
                </div>
                <p className="text-xs text-muted-deep">Queue is empty</p>
              </div>
            ) : (
              queue.tasks.slice(0, 8).map((task) => (
                <div
                  key={task.id}
                  className="group bg-background/50 hover:bg-background border border-foreground/5 hover:border-foreground/10 rounded-xl p-3.5 transition-all duration-200"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-mono text-muted-deep group-hover:text-muted">
                      {task.id.slice(0, 16)}...
                    </span>

                    {/* Priority Badge */}
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border",
                      task.priority.level === 'critical' && "bg-primary/20 text-primary border-primary/30",
                      task.priority.level === 'high' && "bg-secondary/20 text-secondary border-secondary/30",
                      task.priority.level === 'normal' && "bg-accent/10 text-accent border-accent/20",
                      task.priority.level === 'low' && "bg-foreground/5 text-muted border-border"
                    )}>
                      {task.priority.level}
                    </span>
                  </div>

                  {/* Task Prompt */}
                  <p className="text-xs text-foreground leading-relaxed mb-2 line-clamp-2">
                    {task.prompt || 'System Task'}
                  </p>

                  {/* Task Footer */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-deep">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {task.priority.waiting_since_mins || 0}m ago
                    </span>
                    {task.priority.waiting_since_mins && task.priority.waiting_since_mins > 10 && (
                      <span className="flex items-center gap-1 text-primary">
                        <AlertTriangle size={10} />
                        Long wait
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Show More (if > 8 tasks) */}
          {queue.tasks.length > 8 && (
            <button className="w-full mt-3 py-2 text-xs font-semibold text-muted hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-lg transition-colors">
              + {queue.tasks.length - 8} more tasks
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
