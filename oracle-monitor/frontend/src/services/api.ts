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

        return data as SystemSnapshot;
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
                    callback(payload.new as SystemSnapshot);
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

        return data as LogEntry[];
    }
};
