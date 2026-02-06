import { useState } from 'react';
import { Database, RefreshCw, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { QueuePanel } from '@/components/QueuePanel';
import { mockQueues } from '@/data/mockData';
import { cn } from '@/lib/utils';

const QueuesPage = () => {
  const [selectedQueue, setSelectedQueue] = useState(mockQueues[0]?.name || '');

  const selectedQueueData = mockQueues.find(q => q.name === selectedQueue);
  const totalTasks = mockQueues.reduce((sum, q) => sum + q.tasks.length, 0);
  const criticalTasks = mockQueues.flatMap(q => q.tasks).filter(t => t.priority.level === 'critical').length;

  const getQueueColor = (name: string) => {
    if (name.includes('dead-letter')) return 'bg-primary/10 border-primary/30 text-primary';
    if (name.includes('output')) return 'bg-accent/10 border-accent/30 text-accent';
    return 'bg-lavender/10 border-lavender/30 text-lavender';
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-secondary/10 rounded-lg border border-secondary/20">
            <Database size={20} className="text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Message Bus & Queues
            </h1>
            <p className="text-sm text-muted-deep">
              {totalTasks} total tasks • {criticalTasks} critical
            </p>
          </div>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Pane - Queue List */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Available Queues</h3>
            </div>

            <div className="divide-y divide-border">
              {mockQueues.map((queue) => (
                <button
                  key={queue.name}
                  onClick={() => setSelectedQueue(queue.name)}
                  className={cn(
                    "w-full p-4 text-left transition-all hover:bg-foreground/[0.02]",
                    selectedQueue === queue.name && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{queue.name}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold border",
                      queue.tasks.length > 5 ? "bg-primary/20 text-primary border-primary/30" :
                      queue.tasks.length > 0 ? "bg-secondary/20 text-secondary border-secondary/30" :
                      "bg-muted/10 text-muted border-muted/30"
                    )}>
                      {queue.tasks.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {queue.tasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border",
                          task.priority.level === 'critical' ? "bg-primary/10 text-primary border-primary/20" :
                          task.priority.level === 'high' ? "bg-secondary/10 text-secondary border-secondary/20" :
                          "bg-muted/10 text-muted border-muted/20"
                        )}
                      >
                        {task.priority.level}
                      </span>
                    ))}
                    {queue.tasks.length > 3 && (
                      <span className="text-[8px] text-muted-deep">
                        +{queue.tasks.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-xl text-sm font-medium text-secondary transition-colors">
              <RefreshCw size={14} />
              Retry Failed Tasks
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-xl text-sm font-medium text-primary transition-colors">
              <Trash2 size={14} />
              Purge Dead Letter Queue
            </button>
          </div>
        </div>

        {/* Right Pane - Queue Detail */}
        <div className="lg:col-span-2">
          {selectedQueueData && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border",
                    getQueueColor(selectedQueueData.name)
                  )}>
                    {selectedQueueData.name}
                  </span>
                  <span className="text-sm text-muted-deep">
                    {selectedQueueData.tasks.length} pending tasks
                  </span>
                </div>
              </div>
              <QueuePanel queues={[selectedQueueData]} />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default QueuesPage;
