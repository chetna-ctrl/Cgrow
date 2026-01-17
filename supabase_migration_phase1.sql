-- ============================================
-- PHASE 1: INTELLIGENT FEATURES MIGRATION
-- Adds Independent Variables for Research-Based Intelligence
-- ============================================

-- 1. Add Hydroponics Independent Variables
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS npk_ratio TEXT, -- Format: "N-P-K" e.g., "5-10-5"
  ADD COLUMN IF NOT EXISTS light_duration NUMERIC(4,2), -- Hours per day (0-24)
  ADD COLUMN IF NOT EXISTS light_intensity NUMERIC(6,2), -- PPFD (μmol/m²/s)
  ADD COLUMN IF NOT EXISTS dissolved_oxygen NUMERIC(4,2), -- mg/L
  ADD COLUMN IF NOT EXISTS flow_rate NUMERIC(4,2); -- Liters per minute

-- 2. Add Microgreens Independent Variables
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS seed_density NUMERIC(5,2), -- Grams per tray
  ADD COLUMN IF NOT EXISTS light_spectrum TEXT, -- 'Blue', 'Red', 'Full Spectrum'
  ADD COLUMN IF NOT EXISTS media_type TEXT; -- 'Soil', 'Coco Coir', 'Hemp Mat'

-- 3. Add Batches table enhancements for blackout mode
ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS blackout_end_date DATE, -- Auto-calculated: sow_date + 3 days
  ADD COLUMN IF NOT EXISTS is_in_blackout BOOLEAN DEFAULT true; -- Auto false after Day 3

-- 4. Add comments for documentation
COMMENT ON COLUMN public.daily_logs.npk_ratio IS 'NPK nutrient ratio format: N-P-K (e.g., 5-10-5)';
COMMENT ON COLUMN public.daily_logs.light_duration IS 'Light cycle duration in hours (0-24). Leafy greens: 16-18h, Fruiting: 12h';
COMMENT ON COLUMN public.daily_logs.light_intensity IS 'PPFD in μmol/m²/s. Lettuce: 200-300, Tomato: 400-600';
COMMENT ON COLUMN public.daily_logs.dissolved_oxygen IS 'Dissolved oxygen in mg/L. Critical: >5, Optimal: 8-10';
COMMENT ON COLUMN public.daily_logs.flow_rate IS 'Flow rate in L/min. NFT: 1-2 L/min';
COMMENT ON COLUMN public.daily_logs.seed_density IS 'Seed density in grams per tray. Radish: 20-25g, Sunflower: 35-40g';
COMMENT ON COLUMN public.batches.blackout_end_date IS 'Date when blackout phase ends (sow_date + 3 days)';
COMMENT ON COLUMN public.batches.is_in_blackout IS 'Whether batch is currently in blackout phase (Days 0-3)';

-- 5. Create function to auto-calculate blackout dates
CREATE OR REPLACE FUNCTION calculate_blackout_dates()
RETURNS TRIGGER AS $$
BEGIN
  NEW.blackout_end_date := NEW.sow_date + INTERVAL '3 days';
  NEW.is_in_blackout := (CURRENT_DATE <= NEW.blackout_end_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic blackout calculation
DROP TRIGGER IF EXISTS set_blackout_dates ON public.batches;
CREATE TRIGGER set_blackout_dates
  BEFORE INSERT OR UPDATE ON public.batches
  FOR EACH ROW
  EXECUTE FUNCTION calculate_blackout_dates();

-- 7. Update existing batches to calculate blackout status
UPDATE public.batches
SET 
  blackout_end_date = sow_date + INTERVAL '3 days',
  is_in_blackout = (CURRENT_DATE <= (sow_date + INTERVAL '3 days'))
WHERE blackout_end_date IS NULL;

-- ============================================
-- PHASE 1 MIGRATION COMPLETE!
-- ============================================
-- Verify with:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'daily_logs' AND column_name LIKE '%light%';
-- ============================================
