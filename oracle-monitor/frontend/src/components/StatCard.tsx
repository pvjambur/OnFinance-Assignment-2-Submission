import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  alert?: boolean;
  color?: 'coral' | 'amber' | 'mint' | 'lavender';
}

export function StatCard({ label, value, icon, trend, alert, color = 'coral' }: StatCardProps) {
  const colorMap = {
    coral: { 
      bg: 'bg-gradient-card-coral',
      border: 'border-primary/20',
      text: 'text-primary',
      icon: 'text-primary/40'
    },
    amber: { 
      bg: 'bg-gradient-card-amber',
      border: 'border-secondary/20',
      text: 'text-secondary',
      icon: 'text-secondary/40'
    },
    mint: { 
      bg: 'bg-gradient-card-mint',
      border: 'border-accent/20',
      text: 'text-accent',
      icon: 'text-accent/40'
    },
    lavender: { 
      bg: 'bg-gradient-card-lavender',
      border: 'border-lavender/20',
      text: 'text-lavender',
      icon: 'text-lavender/40'
    },
  };

  const colors = colorMap[color];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm",
      colors.bg,
      "border",
      alert ? "border-primary/50" : colors.border,
      "hover:scale-[1.02] transition-transform duration-200"
    )}>
      {/* Background Icon */}
      <div className={cn("absolute -right-4 -top-4 opacity-20", colors.icon)}>
        {React.cloneElement(icon as React.ReactElement, { size: 80, strokeWidth: 1 })}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
          {label}
        </div>
        <div className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          {value}
        </div>
        
        {trend && (
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
            trend === 'up' && "bg-accent/20 text-accent border-accent/30",
            trend === 'stable' && "bg-muted/20 text-muted border-muted/30",
            trend === 'down' && "bg-primary/20 text-primary border-primary/30"
          )}>
            {trend === 'up' && '↗'}
            {trend === 'stable' && '→'}
            {trend === 'down' && '↘'}
            <span>{trend === 'up' ? 'Healthy' : trend === 'stable' ? 'Stable' : 'Declining'}</span>
          </div>
        )}

        {alert && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 animate-pulse">
            ⚠ Alert
          </div>
        )}
      </div>
    </div>
  );
}
