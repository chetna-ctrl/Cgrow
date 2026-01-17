-- ============================================================
-- AGRI-OS HEALTH ENGINE UPDATE (v5.0)
-- Adds calculated metrics columns to daily_logs table
-- Required for Master Health Engine & Analytics
-- ============================================================

DO $$ 
BEGIN
    -- 1. VPD (Vapor Pressure Deficit)
    -- Stored to track historical plant stress
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_logs' AND column_name = 'vpd_kpa'
    ) THEN
        ALTER TABLE daily_logs ADD COLUMN vpd_kpa NUMERIC(4,2);
        RAISE NOTICE '✅ Added column: vpd_kpa';
    ELSE
        RAISE NOTICE '⏭️  Column already exists: vpd_kpa';
    END IF;

    -- 2. DLI (Daily Light Integral)
    -- Stored to track cumulative light over time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_logs' AND column_name = 'dli_mol_per_m2'
    ) THEN
        ALTER TABLE daily_logs ADD COLUMN dli_mol_per_m2 NUMERIC(5,2);
        RAISE NOTICE '✅ Added column: dli_mol_per_m2';
    ELSE
        RAISE NOTICE '⏭️  Column already exists: dli_mol_per_m2';
    END IF;

END $$;

-- Add comments for documentation
COMMENT ON COLUMN daily_logs.vpd_kpa IS 
    'Vapor Pressure Deficit in kPa. Main driver of transpiration. Optimum: 0.8-1.2 kPa.';

COMMENT ON COLUMN daily_logs.dli_mol_per_m2 IS 
    'Daily Light Integral in mol/m²/day. Total photons received. Optimum: 12-17 (Leafy Greens).';

-- Create index for health analysis
CREATE INDEX IF NOT EXISTS idx_daily_logs_vpd ON daily_logs(vpd_kpa);

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
DECLARE
    col_count INT;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'daily_logs'
    AND column_name IN ('vpd_kpa', 'dli_mol_per_m2');
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '✅ HEALTH ENGINE DATABASE UPDATE COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '📊 New Columns: %/2', col_count;
    RAISE NOTICE '';
    RAISE NOTICE '   • vpd_kpa (NUMERIC) - Plant Stress';
    RAISE NOTICE '   • dli_mol_per_m2 (NUMERIC) - Light Accumulation';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;
