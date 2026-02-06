CREATE OR REPLACE FUNCTION get_latest_snapshot()
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT state
        FROM system_snapshots
        ORDER BY timestamp DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;
