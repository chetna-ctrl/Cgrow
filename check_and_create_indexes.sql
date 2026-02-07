-- Check existing indexes on daily_logs table
-- Run this in Supabase SQL Editor to see what's already optimized

SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename = 'daily_logs'
ORDER BY 
    indexname;

-- Check existing indexes on systems table
SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename = 'systems'
ORDER BY 
    indexname;

-- Check existing indexes on batches table
SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename = 'batches'
ORDER BY 
    indexname;

-- Check existing indexes on harvest_records table
SELECT 
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename = 'harvest_records'
ORDER BY 
    indexname;

-- If any of these indexes are missing, create them:

-- Only create if they don't exist (use IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_system ON daily_logs(user_id, system_type);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_created ON daily_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_user_system_date ON daily_logs(user_id, system_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_systems_user_status ON systems(user_id, status);
CREATE INDEX IF NOT EXISTS idx_batches_user_status ON batches(user_id, status);
CREATE INDEX IF NOT EXISTS idx_harvest_records_user_date ON harvest_records(user_id, harvest_date DESC);
