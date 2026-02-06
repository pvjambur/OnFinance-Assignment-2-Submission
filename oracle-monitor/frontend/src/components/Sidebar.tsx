import { Activity, LayoutDashboard, Server, Cpu, Database, Zap, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  connected?: boolean;
}

export function Sidebar({ connected = true }: SidebarProps) {
  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={18} />, label: 'Mission Control', href: '/' },
    { icon: <Cpu size={18} />, label: 'Agent Observatory', href: '/agents' },
    { icon: <Server size={18} />, label: 'Infrastructure', href: '/infra' },
    { icon: <Database size={18} />, label: 'Message Queues', href: '/queues' },
    { icon: <Zap size={18} />, label: 'LLM Nexus', href: '/llm' },
    { icon: <FileText size={18} />, label: 'Summary & Logs', href: '/summary' },
  ];

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-background border-r border-border flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-coral flex items-center justify-center">
            <Activity className="w-5 h-5 text-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            Oracle<span className="text-primary">Monitor</span>
          </h1>
        </div>
        <p className="text-[10px] text-muted-deep font-semibold tracking-widest uppercase">
          Multi-Agent Observatory
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 border",
                isActive
                  ? "bg-gradient-to-r from-primary/15 to-secondary/10 text-primary border-primary/20 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
                  : "text-muted border-transparent hover:bg-foreground/5 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-primary' : 'text-muted-deep'}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Connection Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 bg-foreground/[0.03] rounded-xl border border-border">
          <div className="relative">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connected ? "bg-accent" : "bg-primary animate-pulse"
            )} />
            {connected && (
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-accent animate-ping opacity-75" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">
              {connected ? 'System Online' : 'Reconnecting...'}
            </div>
            <div className="text-[10px] text-muted-deep">
              Realtime Connection
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
