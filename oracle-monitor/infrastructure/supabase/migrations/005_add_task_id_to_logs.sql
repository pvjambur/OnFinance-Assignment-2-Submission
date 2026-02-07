-- Add task_id column to agent_logs if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_logs' AND column_name = 'task_id'
    ) THEN
        ALTER TABLE agent_logs ADD COLUMN task_id TEXT;
    END IF;
END $$;
