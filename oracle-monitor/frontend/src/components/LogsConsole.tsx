import { Terminal, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LogEntry } from '@/types';

interface LogsConsoleProps {
  logs: LogEntry[];
  maxHeight?: string;
}

export function LogsConsole({ logs, maxHeight = 'max-h-96' }: LogsConsoleProps) {
  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-primary';
      case 'warning':
        return 'text-secondary';
      case 'info':
        return 'text-accent';
      case 'debug':
        return 'text-lavender';
      default:
        return 'text-muted';
    }
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'warning':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'info':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'debug':
        return 'bg-lavender/20 text-lavender border-lavender/30';
      default:
        return 'bg-muted/20 text-muted border-muted/30';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="bg-background rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-accent" />
          <h3 className="text-sm font-bold text-foreground">System Logs</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-foreground/5 transition-colors">
            <Filter size={14} className="text-muted-deep" />
          </button>
          <span className="text-[10px] text-muted-deep font-mono">
            {logs.length} entries
          </span>
        </div>
      </div>

      {/* Log Entries */}
      <div className={cn("overflow-y-auto custom-scrollbar font-mono text-xs", maxHeight)}>
        {logs.map((log) => (
          <div
            key={log.id}
            className="px-4 py-2 border-b border-border/50 hover:bg-foreground/[0.02] transition-colors flex items-start gap-3"
          >
            {/* Timestamp */}
            <span className="text-muted-deep whitespace-nowrap flex-shrink-0">
              {formatTimestamp(log.timestamp)}
            </span>

            {/* Level Badge */}
            <span
              className={cn(
                "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border flex-shrink-0 w-14 text-center",
                getLevelBadge(log.level)
              )}
            >
              {log.level}
            </span>

            {/* Source */}
            <span className="text-lavender flex-shrink-0 w-24 truncate">
              [{log.source}]
            </span>

            {/* Message */}
            <span className={cn("flex-1", getLevelColor(log.level))}>
              {log.message}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border bg-card flex items-center justify-between">
        <span className="text-[10px] text-muted-deep">Auto-refresh: 5s</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] text-accent">Live</span>
        </div>
      </div>
    </div>
  );
}
