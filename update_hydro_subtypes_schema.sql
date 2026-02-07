-- Migration: Hydroponics Sub-Type Intelligence
-- This script updates the schema to support specialized telemetry for NFT, DWC, and Ebb & Flow systems.

-- 1. Update daily_logs table with new telemetry columns
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS pump_status TEXT,
ADD COLUMN IF NOT EXISTS water_flow TEXT,
ADD COLUMN IF NOT EXISTS air_stones TEXT,
ADD COLUMN IF NOT EXISTS hydration_stress BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_cycle_time NUMERIC;

-- Add comments for clarity
COMMENT ON COLUMN public.daily_logs.pump_status IS 'NFT Pump Status (ON/OFF)';
COMMENT ON COLUMN public.daily_logs.water_flow IS 'NFT Water Flow Status (Normal/Blocked/Slow)';
COMMENT ON COLUMN public.daily_logs.air_stones IS 'DWC Air Stone status (Bubbling/Weak/Not Bubbling)';
COMMENT ON COLUMN public.daily_logs.hydration_stress IS 'Ebb & Flow hydration stress flag (True if media is dry)';
COMMENT ON COLUMN public.daily_logs.last_cycle_time IS 'Hours since last flood cycle for Ebb & Flow';

-- 2. Ensure systems table has system_type column (if not already present)
-- This column is used to distinguish between NFT, DWC, etc.
ALTER TABLE public.systems 
ADD COLUMN IF NOT EXISTS system_type TEXT DEFAULT 'NFT';

COMMENT ON COLUMN public.systems.system_type IS 'The sub-type of the hydroponic system (NFT, DWC, Ebb & Flow, etc.)';

-- 3. Grant permissions
GRANT ALL ON public.daily_logs TO authenticated;
GRANT ALL ON public.systems TO authenticated;
