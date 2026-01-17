-- ============================================================
-- AGRI-OS SCIENTIFIC INTELLIGENCE: AI-READY DATABASE SCHEMA
-- Phase 6: Add derived metrics columns for ML/AI analysis
-- ============================================================
-- 
-- Purpose: Store calculated scientific metrics alongside raw sensor data
-- Why: Raw data (temp, humidity) isn't enough for ML models.
--      Derived metrics capture the BIOLOGICAL MEANING of the data.
-- 
-- Example: Instead of "Humidity was 80%", we store "VPD was 0.3 kPa (Fungal Risk)"
--          This allows future AI to learn: "When VPD < 0.4 for > 6 hours, Tip Burn occurs in 72% of cases"
-- ============================================================

-- Add VPD (Vapor Pressure Deficit) column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS vpd_kpa NUMERIC(4,2);

COMMENT ON COLUMN daily_logs.vpd_kpa IS 'Calculated Vapor Pressure Deficit in kPa. Optimal range: 0.8-1.2 kPa for leafy greens.';

-- Add GDD (Growing Degree Days) column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS gdd_daily NUMERIC(5,2);

COMMENT ON COLUMN daily_logs.gdd_daily IS 'Growing Degree Days accumulated this day. Formula: ((Tmax + Tmin) / 2) - Tbase';

-- Add DLI (Daily Light Integral) column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS dli_mol_per_m2 NUMERIC(5,2);

COMMENT ON COLUMN daily_logs.dli_mol_per_m2 IS 'Daily Light Integral in mol/m²/day. Optimal: 12-17 for lettuce.';

-- Add Nutrient Depletion Pattern column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS depletion_pattern TEXT;

COMMENT ON COLUMN daily_logs.depletion_pattern IS 'Nutrient consumption pattern: TRANSPIRATION_DOMINANT, NUTRIENT_DOMINANT, BALANCED, or STAGNANT';

-- Add Alert Severity column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS alert_severity TEXT;

COMMENT ON COLUMN daily_logs.alert_severity IS 'Highest alert priority triggered: NONE, LOW, MEDIUM, HIGH, or CRITICAL';

-- Add Health Score column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS health_score INTEGER;

COMMENT ON COLUMN daily_logs.health_score IS 'Composite health score (0-100) based on VPD, pH, EC, temp, and alerts';

-- Add VPD Risk Factor column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS vpd_risk_factor TEXT;

COMMENT ON COLUMN daily_logs.vpd_risk_factor IS 'VPD risk level: LOW, MEDIUM, or HIGH';

-- Add Nutrient Warnings Count column
ALTER TABLE daily_logs 
  ADD COLUMN IF NOT EXISTS nutrient_warnings_count INTEGER DEFAULT 0;

COMMENT ON COLUMN daily_logs.nutrient_warnings_count IS 'Number of nutrient antagonism warnings detected';

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Index for VPD analysis queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_vpd_kpa 
  ON daily_logs(vpd_kpa) 
  WHERE vpd_kpa IS NOT NULL;

-- Index for GDD tracking queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_gdd_daily 
  ON daily_logs(gdd_daily) 
  WHERE gdd_daily IS NOT NULL;

-- Index for alert severity filtering
CREATE INDEX IF NOT EXISTS idx_daily_logs_alert_severity 
  ON daily_logs(alert_severity) 
  WHERE alert_severity IN ('HIGH', 'CRITICAL');

-- Index for health score monitoring
CREATE INDEX IF NOT EXISTS idx_daily_logs_health_score 
  ON daily_logs(health_score) 
  WHERE health_score < 80;

-- Composite index for ML queries (batch/system + date + metrics)
CREATE INDEX IF NOT EXISTS idx_daily_logs_ml_analysis 
  ON daily_logs(batch_id, created_at, vpd_kpa, gdd_daily, health_score) 
  WHERE batch_id IS NOT NULL;

-- ============================================================
-- VALIDATION CONSTRAINTS
-- ============================================================

-- Ensure VPD is within realistic range (0-5 kPa)
ALTER TABLE daily_logs 
  ADD CONSTRAINT check_vpd_range 
  CHECK (vpd_kpa IS NULL OR (vpd_kpa >= 0 AND vpd_kpa <= 5));

-- Ensure GDD is non-negative
ALTER TABLE daily_logs 
  ADD CONSTRAINT check_gdd_positive 
  CHECK (gdd_daily IS NULL OR gdd_daily >= 0);

-- Ensure health score is 0-100
ALTER TABLE daily_logs 
  ADD CONSTRAINT check_health_score_range 
  CHECK (health_score IS NULL OR (health_score >= 0 AND health_score <= 100));

-- Ensure alert severity is valid
ALTER TABLE daily_logs 
  ADD CONSTRAINT check_alert_severity_valid 
  CHECK (alert_severity IS NULL OR alert_severity IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));

-- Ensure depletion pattern is valid
ALTER TABLE daily_logs 
  ADD CONSTRAINT check_depletion_pattern_valid 
  CHECK (depletion_pattern IS NULL OR depletion_pattern IN ('TRANSPIRATION_DOMINANT', 'NUTRIENT_DOMINANT', 'BALANCED', 'STAGNANT'));

-- ============================================================
-- SAMPLE QUERIES FOR ML/AI ANALYSIS
-- ============================================================

-- Example 1: Find all instances where low VPD led to tip burn
-- SELECT batch_id, created_at, vpd_kpa, health_score, notes
-- FROM daily_logs
-- WHERE vpd_kpa < 0.4 
--   AND notes ILIKE '%tip burn%'
-- ORDER BY created_at DESC;

-- Example 2: Analyze GDD accumulation patterns for successful harvests
-- SELECT batch_id, SUM(gdd_daily) as total_gdd, COUNT(*) as days_to_harvest
-- FROM daily_logs
-- WHERE batch_id IN (SELECT id FROM batches WHERE status = 'Harvested' AND quality_grade = 'A')
-- GROUP BY batch_id;

-- Example 3: Correlation between VPD stress and health score
-- SELECT 
--   CASE 
--     WHEN vpd_kpa < 0.4 THEN 'Low VPD'
--     WHEN vpd_kpa > 1.6 THEN 'High VPD'
--     ELSE 'Optimal VPD'
--   END as vpd_category,
--   AVG(health_score) as avg_health_score,
--   COUNT(*) as sample_size
-- FROM daily_logs
-- WHERE vpd_kpa IS NOT NULL AND health_score IS NOT NULL
-- GROUP BY vpd_category;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Verify new columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'daily_logs'
  AND column_name IN ('vpd_kpa', 'gdd_daily', 'dli_mol_per_m2', 'depletion_pattern', 'alert_severity', 'health_score')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ AI-Ready Database Schema Migration Complete!';
  RAISE NOTICE '📊 Added 8 new derived metric columns to daily_logs';
  RAISE NOTICE '🔍 Created 5 performance indexes for ML queries';
  RAISE NOTICE '✓ Added validation constraints for data integrity';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Update Daily Tracker to save calculated metrics';
  RAISE NOTICE '2. Start collecting derived data for ML training';
  RAISE NOTICE '3. Build predictive models using historical patterns';
END $$;
