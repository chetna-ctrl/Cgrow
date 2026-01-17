-- ============================================
-- AGRI-OS SCHEMA FIX - Add Missing Columns
-- Run this to fix qty and water_level issues
-- ============================================

-- 1. Add 'qty' (quantity of trays) column to batches table
ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 1;

COMMENT ON COLUMN public.batches.qty IS 'Number of trays in this batch';

-- 2. Verify water_level is TEXT (should already be, but make sure)
-- If it's numeric, this will convert it
DO $$ 
BEGIN
    -- Check if water_level exists and is not TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_logs' 
        AND column_name = 'water_level'
        AND data_type != 'text'
    ) THEN
        -- Convert to TEXT if it's not
        ALTER TABLE public.daily_logs 
        ALTER COLUMN water_level TYPE TEXT;
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check batches table has qty column
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'batches' 
  AND column_name = 'qty';

-- Check water_level is TEXT type
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'daily_logs' 
  AND column_name = 'water_level';

-- Expected results:
-- qty: integer, default: 1
-- water_level: text
