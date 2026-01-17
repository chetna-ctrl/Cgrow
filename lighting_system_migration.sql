-- ============================================================
-- LIGHTING SYSTEM: Add Farmer-Friendly Light Tracking
-- ============================================================
-- 
-- Purpose: Store lighting information for automatic DLI calculation
-- Farmers select from dropdown (T5 LEDs, Grow Lights, Sunlight, etc.)
-- System automatically estimates PPFD and calculates DLI
-- ============================================================

-- Add lighting columns to batches table (Microgreens)
ALTER TABLE batches 
  ADD COLUMN IF NOT EXISTS lighting_source TEXT,
  ADD COLUMN IF NOT EXISTS light_hours_per_day NUMERIC(4,1) DEFAULT 14;

COMMENT ON COLUMN batches.lighting_source IS 'Type of lighting: LED_TUBES_WHITE, SUNLIGHT, CEILING_BULB, etc.';
COMMENT ON COLUMN batches.light_hours_per_day IS 'Hours of light per day (photoperiod). Default 14 hours for microgreens.';

-- Add lighting columns to systems table (Hydroponics)
ALTER TABLE systems 
  ADD COLUMN IF NOT EXISTS lighting_source TEXT,
  ADD COLUMN IF NOT EXISTS light_hours_per_day NUMERIC(4,1) DEFAULT 16;

COMMENT ON COLUMN systems.lighting_source IS 'Type of lighting: GROW_LIGHTS_FULL, GREENHOUSE, DIY_SHOP_LIGHTS, etc.';
COMMENT ON COLUMN systems.light_hours_per_day IS 'Hours of light per day (photoperiod). Default 16 hours for hydroponics.';

-- ============================================================
-- EXAMPLE USAGE
-- ============================================================

-- Farmer creates a microgreens batch with T5 LED tubes, 14 hours/day
-- INSERT INTO batches (crop, lighting_source, light_hours_per_day)
-- VALUES ('Lettuce', 'LED_TUBES_WHITE', 14);

-- System automatically calculates:
-- PPFD = 120 µmol/m²/s (from estimatePPFD function)
-- DLI = 120 * 14 * 0.0036 = 6.05 mol/m²/day (Below optimal 12-17)
-- Alert: "Light intensity too low. Consider adding more tubes or increasing hours."

-- ============================================================
-- VALIDATION CONSTRAINTS
-- ============================================================

-- Ensure light hours are realistic (0-24)
ALTER TABLE batches 
  ADD CONSTRAINT check_light_hours_batches 
  CHECK (light_hours_per_day IS NULL OR (light_hours_per_day >= 0 AND light_hours_per_day <= 24));

ALTER TABLE systems 
  ADD CONSTRAINT check_light_hours_systems 
  CHECK (light_hours_per_day IS NULL OR (light_hours_per_day >= 0 AND light_hours_per_day <= 24));

-- Ensure lighting source is valid
ALTER TABLE batches 
  ADD CONSTRAINT check_lighting_source_batches 
  CHECK (lighting_source IS NULL OR lighting_source IN (
    'LED_TUBES_WHITE', 'FLUORESCENT_SHOP', 'SUNLIGHT', 'CEILING_BULB', 
    'WINDOW', 'BALCONY', 'NONE', 'UNKNOWN'
  ));

ALTER TABLE systems 
  ADD CONSTRAINT check_lighting_source_systems 
  CHECK (lighting_source IS NULL OR lighting_source IN (
    'GROW_LIGHTS_FULL', 'GREENHOUSE', 'DIY_SHOP_LIGHTS', 'HPS_LIGHTS', 
    'SUNLIGHT', 'WINDOW', 'BALCONY', 'NONE', 'UNKNOWN'
  ));

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Lighting System Schema Added!';
  RAISE NOTICE '💡 Farmers can now select lighting from dropdown';
  RAISE NOTICE '📊 System will auto-calculate DLI';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Add lighting dropdown to Batch/System creation forms';
  RAISE NOTICE '2. Display estimated DLI in UI';
  RAISE NOTICE '3. Alert farmers if DLI is too low/high';
END $$;
