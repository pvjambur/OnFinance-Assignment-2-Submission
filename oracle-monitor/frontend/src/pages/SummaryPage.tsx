import { useState, useEffect } from 'react';
import { FileText, Activity, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { api } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { LogEntry, SystemSnapshot } from '@/types';
import { cn } from '@/lib/utils';

const SummaryPage = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const [logsData, snapshotData] = await Promise.all([
                api.getLogs(200),
                api.getLatestSnapshot()
            ]);

            setLogs(logsData);
            setSnapshot(snapshotData);
            setLoading(false);
        };

        fetchData();

        // Poll logs every 5 seconds (or use subscription if available for logs)
        const interval = setInterval(async () => {
            const newLogs = await api.getLogs(50);
            setLogs(prev => {
                // Simple merge to avoid duplicates (assuming id uniqueness)
                const existingIds = new Set(prev.map(l => l.id));
                const uniqueNew = newLogs.filter(l => !existingIds.has(l.id));
                return [...uniqueNew, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 200);
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const filteredLogs = logs.filter(log =>
        log.message.toLowerCase().includes(filter.toLowerCase()) ||
        log.source.toLowerCase().includes(filter.toLowerCase()) ||
        log.level.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </MainLayout>
        );
    }

    const agentCount = snapshot?.agents?.length || 0;
    const activeTaskCount = snapshot?.agents?.reduce((sum, a) => sum + a.activity.active_task_ids.length, 0) || 0;
    const errorCount = logs.filter(l => l.level === 'error').length;

    return (
        <MainLayout>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            System Summary & Logs
                        </h1>
                        <p className="text-sm text-muted-deep">
                            Comprehensive system audit trail
                        </p>
                    </div>
                </div>
            </div>

            {/* High Level Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <Activity className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
                            <p className="text-2xl font-bold">{agentCount} Agents Online</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Processing {activeTaskCount} active tasks across the cluster.
                    </p>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-full">
                            <FileText className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Total Logs</h3>
                            <p className="text-2xl font-bold">{logs.length} Buffered</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Showing last 200 log entries from all sources.
                    </p>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Recent Errors</h3>
                            <p className="text-2xl font-bold text-red-500">{errorCount}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        Critical issues detected in the last session.
                    </p>
                </div>
            </div>

            {/* Logs Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Live Logs</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Timestamp</TableHead>
                                <TableHead className="w-[100px]">Level</TableHead>
                                <TableHead className="w-[150px]">Source</TableHead>
                                <TableHead>Message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/50">
                                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(
                                            "uppercase text-[10px] font-bold border-0",
                                            log.level === 'error' ? "bg-red-500/10 text-red-500" :
                                                log.level === 'warning' ? "bg-yellow-500/10 text-yellow-500" :
                                                    log.level === 'info' ? "bg-blue-500/10 text-blue-500" :
                                                        "bg-gray-500/10 text-gray-500"
                                        )}>
                                            {log.level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">{log.source}</TableCell>
                                    <TableCell className="text-sm">{log.message}</TableCell>
                                </TableRow>
                            ))}
                            {filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </MainLayout>
    );
};

export default SummaryPage;
