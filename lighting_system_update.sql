-- ============================================================
-- AGRI-OS LIGHTING SYSTEM UPDATE (v4.1)
-- Adds lighting tracking columns to daily_logs table
-- Safe to run on existing database
-- ============================================================

-- Add lighting columns to daily_logs (if they don't exist)
DO $$ 
BEGIN
    -- Add lighting_source column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_logs' AND column_name = 'lighting_source'
    ) THEN
        ALTER TABLE daily_logs ADD COLUMN lighting_source TEXT;
        RAISE NOTICE '✅ Added column: lighting_source';
    ELSE
        RAISE NOTICE '⏭️  Column already exists: lighting_source';
    END IF;

    -- Add light_hours_per_day column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_logs' AND column_name = 'light_hours_per_day'
    ) THEN
        ALTER TABLE daily_logs ADD COLUMN light_hours_per_day NUMERIC(4,1);
        RAISE NOTICE '✅ Added column: light_hours_per_day';
    ELSE
        RAISE NOTICE '⏭️  Column already exists: light_hours_per_day';
    END IF;
END $$;

-- Add comments to explain the columns
COMMENT ON COLUMN daily_logs.lighting_source IS 
    'Type of lighting used. Values: LED_TUBES_WHITE, GROW_LIGHTS_FULL, SUNLIGHT, etc. Used for DLI calculation.';

COMMENT ON COLUMN daily_logs.light_hours_per_day IS 
    'Number of hours lights were on this day. Used with lighting_source to calculate DLI (Daily Light Integral).';

-- Create index for lighting analysis queries
CREATE INDEX IF NOT EXISTS idx_daily_logs_lighting_source 
    ON daily_logs(lighting_source) 
    WHERE lighting_source IS NOT NULL;

-- ============================================================
-- VERIFICATION: Check if columns were added
-- ============================================================

DO $$
DECLARE
    col_count INT;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'daily_logs'
    AND column_name IN ('lighting_source', 'light_hours_per_day');
    
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '✅ LIGHTING SYSTEM UPDATE COMPLETE';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Columns Added/Verified: %/2', col_count;
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Column Details:';
    RAISE NOTICE '   • lighting_source (TEXT) - Light type identifier';
    RAISE NOTICE '   • light_hours_per_day (NUMERIC) - Hours of light';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Usage:';
    RAISE NOTICE '   DLI = estimatePPFD(lighting_source) × light_hours × 0.0036';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

-- Update table statistics
ANALYZE daily_logs;
