CREATE TABLE IF NOT EXISTS system_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE system_snapshots IS 'Stores time-series snapshots of the entire multi-agent system state';
