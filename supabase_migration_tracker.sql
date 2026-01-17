-- ============================================
-- DAILY TRACKER TWO-COLUMN MIGRATION
-- Run this AFTER the initial supabase_setup.sql
-- Adds new fields for Microgreens & Hydroponics tracking
-- ============================================

-- 1. Add Hydroponics-specific fields
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS water_temp NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS water_level TEXT;

-- 2. Add Microgreens-specific fields
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS humidity NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS growth_stage TEXT,
  ADD COLUMN IF NOT EXISTS watering_status TEXT,
  ADD COLUMN IF NOT EXISTS visual_check TEXT;

-- 3. Update existing system_type values to use proper case
UPDATE public.daily_logs
SET system_type = CASE
  WHEN LOWER(system_type) = 'microgreens' THEN 'Microgreens'
  WHEN LOWER(system_type) = 'hydroponics' THEN 'Hydroponics'
  ELSE system_type
END
WHERE system_type IS NOT NULL;

-- 4. Add comments to new columns for documentation
COMMENT ON COLUMN public.daily_logs.water_temp IS 'Water temperature in Celsius (Hydroponics only)';
COMMENT ON COLUMN public.daily_logs.water_level IS 'Water level status: OK, Top-up Needed, Overflowing (Hydroponics only)';
COMMENT ON COLUMN public.daily_logs.humidity IS 'Humidity percentage 0-100 (Microgreens only)';
COMMENT ON COLUMN public.daily_logs.growth_stage IS 'Growth stage: Germination, Blackout, Under Lights, Harvest Ready (Microgreens only)';
COMMENT ON COLUMN public.daily_logs.watering_status IS 'Watering method: None, Misted, Bottom Watered, Over-watered (Microgreens only)';
COMMENT ON COLUMN public.daily_logs.visual_check IS 'Visual health: Looks Good, Mold Detected, Wilting, Yellowing (Microgreens only)';

-- 5. Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_daily_logs_humidity ON public.daily_logs(humidity) WHERE humidity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_logs_growth_stage ON public.daily_logs(growth_stage) WHERE growth_stage IS NOT NULL;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Verify migration:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'daily_logs' ORDER BY ordinal_position;
-- ============================================
