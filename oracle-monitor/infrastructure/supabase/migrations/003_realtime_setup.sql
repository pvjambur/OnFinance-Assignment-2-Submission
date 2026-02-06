-- Enable replication on the system_snapshots table for Supabase Realtime
-- This requires the supabase_realtime publication to exist (standard in Supabase)

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE system_snapshots;
    END IF;
END
$$;
