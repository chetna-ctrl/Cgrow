-- Migration: Add intervention_actions to daily_logs
-- Purpose: Track user remediations for AI causality learning

ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS intervention_actions text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN daily_logs.intervention_actions IS 'List of actions taken by farmer to fix issues (e.g., ["Added pH Down", "Sprayed Neem"])';
