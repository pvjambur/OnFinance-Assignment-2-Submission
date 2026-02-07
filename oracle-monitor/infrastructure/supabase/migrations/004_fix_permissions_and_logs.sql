-- Create agent_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT NOT NULL,
    task_id TEXT
);

-- Enable RLS on both tables to be safe (idempotent)
ALTER TABLE system_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (so frontend can fetch data)
BEGIN;
  DROP POLICY IF EXISTS "Allow public read access" ON system_snapshots;
  CREATE POLICY "Allow public read access" ON system_snapshots FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Allow public read access" ON agent_logs;
  CREATE POLICY "Allow public read access" ON agent_logs FOR SELECT USING (true);
COMMIT;

-- Create policies for service role (backend/collector) to insert/update
-- Service role key bypasses RLS, but explicit policies prevent anon inserts
BEGIN;
  DROP POLICY IF EXISTS "Allow service role insert" ON system_snapshots;
  CREATE POLICY "Allow service role insert" ON system_snapshots FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow service role insert" ON agent_logs;
  CREATE POLICY "Allow service role insert" ON agent_logs FOR INSERT WITH CHECK (true);
COMMIT;
