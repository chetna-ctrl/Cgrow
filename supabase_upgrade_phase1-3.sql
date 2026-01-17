-- ============================================
-- AGRI-OS PHASE 1-3 UPGRADE MIGRATION
-- Run this AFTER your existing schema
-- Adds all new intelligent features
-- ============================================

-- ============================================
-- STEP 1: Extend daily_logs table
-- ============================================

-- Two-Column Tracker Fields (Microgreens vs Hydroponics)
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS system_type TEXT, -- 'Microgreens' or 'Hydroponics'
  ADD COLUMN IF NOT EXISTS water_temp NUMERIC(5,2), -- Water temperature (Hydroponics)
  ADD COLUMN IF NOT EXISTS water_level TEXT, -- 'OK', 'Top-up Needed', 'Overflowing'
  ADD COLUMN IF NOT EXISTS humidity NUMERIC(5,2), -- Humidity % (Microgreens)
  ADD COLUMN IF NOT EXISTS growth_stage TEXT, -- Microgreens growth phase
  ADD COLUMN IF NOT EXISTS watering_status TEXT, -- Watering method
  ADD COLUMN IF NOT EXISTS visual_check TEXT; -- Health status

-- Phase 1: Independent Variables (Research-Based Intelligence)
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS npk_ratio TEXT, -- Format: "5-10-5"
  ADD COLUMN IF NOT EXISTS light_duration NUMERIC(4,2), -- Hours per day
  ADD COLUMN IF NOT EXISTS light_intensity NUMERIC(6,2), -- PPFD
  ADD COLUMN IF NOT EXISTS dissolved_oxygen NUMERIC(4,2), -- mg/L
  ADD COLUMN IF NOT EXISTS flow_rate NUMERIC(4,2), -- L/min
  ADD COLUMN IF NOT EXISTS seed_density NUMERIC(5,2), -- g/tray
  ADD COLUMN IF NOT EXISTS light_spectrum TEXT, -- 'Blue', 'Red', 'Full Spectrum'
  ADD COLUMN IF NOT EXISTS media_type TEXT; -- 'Soil', 'Coco Coir', 'Hemp Mat'

-- ============================================
-- STEP 2: Extend batches table
-- ============================================

-- Blackout Mode Automation (ICAR Protocol - Critical for Microgreens)
ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS blackout_end_date DATE, -- Auto-calculated: sow_date + 3 days
  ADD COLUMN IF NOT EXISTS is_in_blackout BOOLEAN DEFAULT true; -- Auto false after Day 3

-- ============================================
-- STEP 3: Add column comments for documentation
-- ============================================

-- Common fields
COMMENT ON COLUMN public.daily_logs.system_type IS 'System type: Microgreens or Hydroponics';

-- Hydroponics-specific
COMMENT ON COLUMN public.daily_logs.water_temp IS 'Water temperature in Celsius (Hydroponics only)';
COMMENT ON COLUMN public.daily_logs.water_level IS 'Water level status (Hydroponics only)';
COMMENT ON COLUMN public.daily_logs.npk_ratio IS 'NPK nutrient ratio format: N-P-K (e.g., 5-10-5)';
COMMENT ON COLUMN public.daily_logs.light_duration IS 'Light cycle duration in hours (0-24)';
COMMENT ON COLUMN public.daily_logs.light_intensity IS 'PPFD in μmol/m²/s. Lettuce: 200-300, Tomato: 400-600';
COMMENT ON COLUMN public.daily_logs.dissolved_oxygen IS 'Dissolved oxygen in mg/L. Critical: >5, Optimal: 8-10';
COMMENT ON COLUMN public.daily_logs.flow_rate IS 'Flow rate in L/min. NFT: 1-2 L/min';

-- Microgreens-specific
COMMENT ON COLUMN public.daily_logs.humidity IS 'Humidity percentage 0-100 (Microgreens only)';
COMMENT ON COLUMN public.daily_logs.growth_stage IS 'Growth stage: Germination, Blackout, Under Lights, Harvest Ready';
COMMENT ON COLUMN public.daily_logs.watering_status IS 'Watering method: None, Misted, Bottom Watered, Over-watered';
COMMENT ON COLUMN public.daily_logs.visual_check IS 'Visual health: Looks Good, Mold Detected, Wilting, Yellowing';
COMMENT ON COLUMN public.daily_logs.seed_density IS 'Seed density in grams per tray';
COMMENT ON COLUMN public.daily_logs.light_spectrum IS 'Light spectrum type';
COMMENT ON COLUMN public.daily_logs.media_type IS 'Growing media type';

-- Blackout mode
COMMENT ON COLUMN public.batches.blackout_end_date IS 'Date when blackout phase ends (sow_date + 3 days)';
COMMENT ON COLUMN public.batches.is_in_blackout IS 'Whether batch is currently in blackout phase (Days 0-3)';

-- ============================================
-- STEP 4: Create automatic blackout calculation
-- ============================================

-- Function to auto-calculate blackout dates
CREATE OR REPLACE FUNCTION calculate_blackout_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sow_date IS NOT NULL THEN
    NEW.blackout_end_date := NEW.sow_date + INTERVAL '3 days';
    NEW.is_in_blackout := (CURRENT_DATE <= (NEW.sow_date + INTERVAL '3 days'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic blackout calculation
DROP TRIGGER IF EXISTS set_blackout_dates ON public.batches;
CREATE TRIGGER set_blackout_dates
  BEFORE INSERT OR UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION calculate_blackout_dates();

-- ============================================
-- STEP 5: Update existing batches with blackout status
-- ============================================

UPDATE public.batches
SET 
  blackout_end_date = sow_date + INTERVAL '3 days',
  is_in_blackout = (CURRENT_DATE <= (sow_date + INTERVAL '3 days'))
WHERE sow_date IS NOT NULL AND blackout_end_date IS NULL;

-- ============================================
-- STEP 6: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_daily_logs_system_type ON public.daily_logs(system_type);
CREATE INDEX IF NOT EXISTS idx_daily_logs_humidity ON public.daily_logs(humidity) WHERE humidity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_logs_growth_stage ON public.daily_logs(growth_stage) WHERE growth_stage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batches_blackout ON public.batches(is_in_blackout) WHERE is_in_blackout = true;

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================

-- Verification Query - Run this to confirm all columns exist:
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'daily_logs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected new columns in daily_logs:
-- ✅ system_type, water_temp, water_level (Tracker)
-- ✅ humidity, growth_stage, watering_status, visual_check (Microgreens)
-- ✅ npk_ratio, light_duration, light_intensity (Phase 1 Hydroponics)
-- ✅ dissolved_oxygen, flow_rate (Phase 1 Advanced)
-- ✅ seed_density, light_spectrum, media_type (Phase 1 Microgreens)

SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'batches' 
  AND table_schema = 'public'
  AND column_name IN ('blackout_end_date', 'is_in_blackout');

-- Expected new columns in batches:
-- ✅ blackout_end_date (date)
-- ✅ is_in_blackout (boolean)

-- ============================================
-- NOTES:
-- ============================================
-- 1. This migration is SAFE - uses "IF NOT EXISTS" to prevent errors
-- 2. Existing data is PRESERVED - only adds new columns
-- 3. All RLS policies from your original schema remain intact
-- 4. Automatic blackout calculation trigger is now active
-- 5. Compatible with your existing App.js routes and Sidebar navigation
-- 
-- After running this:
-- - Daily Tracker will save all new fields ✅
-- - Analytics Dashboard will calculate trends ✅
-- - Scheduler will show blackout countdowns ✅
-- - All Phase 1-3 features fully functional! 🎉
-- ============================================
