import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types';

interface AlertsTickerProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
}

export function AlertsTicker({ alerts, onAcknowledge }: AlertsTickerProps) {
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  if (unacknowledgedAlerts.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-3 text-muted">
          <Info size={16} />
          <span className="text-sm">No active alerts</span>
        </div>
      </div>
    );
  }

  const getAlertStyles = (level: Alert['level']) => {
    switch (level) {
      case 'error':
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          icon: <AlertCircle size={14} className="text-primary" />,
          text: 'text-primary',
        };
      case 'warning':
        return {
          bg: 'bg-secondary/10',
          border: 'border-secondary/30',
          icon: <AlertTriangle size={14} className="text-secondary" />,
          text: 'text-secondary',
        };
      default:
        return {
          bg: 'bg-accent/10',
          border: 'border-accent/30',
          icon: <Info size={14} className="text-accent" />,
          text: 'text-accent',
        };
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-secondary" />
          <h3 className="text-sm font-bold text-foreground">Recent Alerts</h3>
        </div>
        <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
          {unacknowledgedAlerts.length} Active
        </span>
      </div>

      <div className="divide-y divide-border max-h-48 overflow-y-auto custom-scrollbar">
        {unacknowledgedAlerts.map((alert) => {
          const styles = getAlertStyles(alert.level);
          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 flex items-start gap-3 transition-colors hover:bg-foreground/[0.02]",
                styles.bg
              )}
            >
              <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                  {alert.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-deep">{formatTime(alert.timestamp)}</span>
                  <span className="text-[10px] text-muted-deep">•</span>
                  <span className="text-[10px] text-muted-deep">{alert.source}</span>
                </div>
              </div>
              {onAcknowledge && (
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-foreground/10 transition-colors"
                  title="Acknowledge"
                >
                  <X size={12} className="text-muted-deep hover:text-foreground" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
