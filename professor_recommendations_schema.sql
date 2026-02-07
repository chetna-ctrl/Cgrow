-- ============================================================
-- PROFESSOR'S RECOMMENDATION: ELECTRICITY COST TRACKING
-- ============================================================
-- This migration adds columns to track electricity costs and power consumption
-- for better ROI (Return on Investment) analysis
-- Based on: Professor's Market Viability Analysis

-- Step 1: Add electricity tracking columns to daily_logs
ALTER TABLE daily_logs 
ADD COLUMN IF NOT EXISTS electricity_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS power_consumption_kwh NUMERIC(10,2) DEFAULT 0;

-- Step 2: Add user setting for electricity rate (cost per kWh)
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS cost_per_kwh NUMERIC(5,2) DEFAULT 8.0; -- Default ₹8/unit (Indian average)

-- Step 3: Add comment for documentation
COMMENT ON COLUMN daily_logs.electricity_cost IS 'Daily electricity cost in INR based on power consumption and user rate';
COMMENT ON COLUMN daily_logs.power_consumption_kwh IS 'Total power consumption in kilowatt-hours (kWh) for lights and fans';
COMMENT ON COLUMN user_settings.cost_per_kwh IS 'User-specific electricity rate in INR per kWh unit';

-- Step 4: Create index for faster cost queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_electricity_cost 
ON daily_logs(user_id, electricity_cost) 
WHERE electricity_cost > 0;

-- ============================================================
-- BIOFILTER TRACKING (Optional Enhancement)
-- ============================================================
-- Add columns to track biofilter performance metrics
-- Based on: Active Botanical Biofiltration research

ALTER TABLE daily_logs
ADD COLUMN IF NOT EXISTS fan_speed_mode VARCHAR(20) DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS air_quality_impact JSONB;

COMMENT ON COLUMN daily_logs.fan_speed_mode IS 'Fan speed setting: HIGH, MEDIUM, LOW, OFF - affects biofilter CADR';
COMMENT ON COLUMN daily_logs.air_quality_impact IS 'Calculated air quality metrics: CADR, VOC removal efficiency, etc.';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify the migration was successful

-- Check if columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'daily_logs' 
AND column_name IN ('electricity_cost', 'power_consumption_kwh', 'fan_speed_mode', 'air_quality_impact');

SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name = 'cost_per_kwh';

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'daily_logs' 
AND indexname = 'idx_daily_logs_electricity_cost';
