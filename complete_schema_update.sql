-- ============================================
-- COMPREHENSIVE SCHEMA UPDATE FOR AGRI-OS
-- COMPREHENSIVE SCHEMA UPDATE FOR AGRI-OS
-- Based on complete codebase analysis
-- Run this to ensure all tables/columns exist
-- ============================================

-- ============================================
-- PART 1: BATCHES TABLE UPDATES
-- ============================================

-- Add missing qty column (number of trays)
ALTER TABLE public.batches
  ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 1;

COMMENT ON COLUMN public.batches.qty IS 'Number of trays in this batch';

-- ============================================
-- PART 2: SYSTEMS TABLE VERIFICATION
-- ============================================

-- Ensure systems table exists with all required columns
-- (Should already exist from supabase_setup.sql, but verify)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'systems') THEN
        RAISE EXCEPTION 'systems table does not exist! Run supabase_setup.sql first';
    END IF;
END $$;

-- ============================================
-- PART 3: DAILY_LOGS TABLE - ENSURE ALL COLUMNS
-- ============================================

-- Core tracking columns (should exist from supabase_upgrade_phase1-3.sql)
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS system_type TEXT,
  ADD COLUMN IF NOT EXISTS water_temp NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS water_level TEXT, -- TEXT for "Top-up Needed", "OK", etc.
  ADD COLUMN IF NOT EXISTS humidity NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS growth_stage TEXT,
  ADD COLUMN IF NOT EXISTS watering_status TEXT,
  ADD COLUMN IF NOT EXISTS visual_check TEXT;

-- Phase 1 Intelligence columns
ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS npk_ratio TEXT,
  ADD COLUMN IF NOT EXISTS light_duration NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS light_intensity NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS dissolved_oxygen NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS flow_rate NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS seed_density NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS light_spectrum TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT;

-- ============================================
-- PART 4: DATA TYPE FIXES
-- ============================================

-- Ensure water_level is TEXT (not numeric)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_logs' 
        AND column_name = 'water_level'
        AND data_type != 'text'
    ) THEN
        ALTER TABLE public.daily_logs 
        ALTER COLUMN water_level TYPE TEXT;
    END IF;
END $$;

-- ============================================
-- PART 5: INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_daily_logs_system_type ON public.daily_logs(system_type);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_system_id ON public.daily_logs(system_id);

CREATE INDEX IF NOT EXISTS idx_batches_user_id ON public.batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);

CREATE INDEX IF NOT EXISTS idx_systems_user_id ON public.systems(user_id);
CREATE INDEX IF NOT EXISTS idx_systems_status ON public.systems(status);

-- ============================================
-- PART 6: ROW LEVEL SECURITY (RLS) VERIFICATION
-- ============================================

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for batches (users can only see their own)
DROP POLICY IF EXISTS "Users can view own batches" ON public.batches;
CREATE POLICY "Users can view own batches" ON public.batches
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own batches" ON public.batches;
CREATE POLICY "Users can insert own batches" ON public.batches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own batches" ON public.batches;
CREATE POLICY "Users can update own batches" ON public.batches
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own batches" ON public.batches;
CREATE POLICY "Users can delete own batches" ON public.batches
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for systems
DROP POLICY IF EXISTS "Users can view own systems" ON public.systems;
CREATE POLICY "Users can view own systems" ON public.systems
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own systems" ON public.systems;
CREATE POLICY "Users can insert own systems" ON public.systems
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own systems" ON public.systems;
CREATE POLICY "Users can update own systems" ON public.systems
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own systems" ON public.systems;
CREATE POLICY "Users can delete own systems" ON public.systems
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for daily_logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.daily_logs;
CREATE POLICY "Users can view own logs" ON public.daily_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON public.daily_logs;
CREATE POLICY "Users can insert own logs" ON public.daily_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 7: VERIFICATION QUERIES
-- ============================================

-- Check all critical columns exist
SELECT 
    'batches.qty' as column_check,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='batches' AND column_name='qty') as exists
UNION ALL
SELECT 
    'daily_logs.system_type',
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='system_type')
UNION ALL
SELECT 
    'daily_logs.water_level (TEXT)',
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='water_level' AND data_type='text')
UNION ALL
SELECT 
    'daily_logs.humidity',
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='daily_logs' AND column_name='humidity')
UNION ALL
SELECT 
    'systems table exists',
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='systems');

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================

-- Expected results from verification:
-- All should return 'true'
-- If any return 'false', check error messages above
