import { supabase } from '@/lib/supabase';
import type { SystemSnapshot, LogEntry } from '@/types';

export const api = {
    /**
     * Fetch the most recent system snapshot
     */
    async getLatestSnapshot(): Promise<SystemSnapshot | null> {
        const { data, error } = await supabase
            .from('system_snapshots')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching snapshot:', error);
            return null;
        }

        return data.state as SystemSnapshot;
    },

    /**
     * Subscribe to real-time updates for system snapshots
     */
    subscribeToSnapshots(callback: (snapshot: SystemSnapshot) => void) {
        return supabase
            .channel('system-snapshots-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'system_snapshots' },
                (payload) => {
                    if (payload.new && (payload.new as any).state) {
                        callback((payload.new as any).state as SystemSnapshot);
                    }
                }
            )
            .subscribe();
    },

    /**
     * Fetch recent logs
     */
    async getLogs(limit = 100): Promise<LogEntry[]> {
        const { data, error } = await supabase
            .from('agent_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching logs:', error);
            return [];
        }

        return (data as any[]).map(log => ({
            ...log,
            taskId: log.task_id
        })) as LogEntry[];
    },

    /**
     * Send a query to the AI Oracle Chatbot
     */
    async queryChatbot(message: string): Promise<{ reply: string, context_used: boolean } | null> {
        try {
            const response = await fetch('http://localhost:8000/chat/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error querying chatbot:', error);
            return null;
        }
    },

    /**
     * Initiate a new task via the backend API
     */
    async createTask(description: string, priority: string = "medium"): Promise<{ status: string, task_id: string } | null> {
        try {
            const response = await fetch('http://localhost:8000/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: `task-${Math.random().toString(36).substr(2, 9)}`,
                    description,
                    priority
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating task:', error);
            return null;
        }
    }
};
