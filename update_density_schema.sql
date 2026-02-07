-- Add seed_weight column to batches table for Density Auditor
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS seed_weight NUMERIC DEFAULT 0;

COMMENT ON COLUMN batches.seed_weight IS 'Weight of seeds used per tray in grams';
