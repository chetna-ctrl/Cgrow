-- ============================================
-- FIX DAILY LOGS SCHEMA (v4.0)
-- Adds missing columns expected by the Frontend
-- ============================================

-- 1. Add Batch and Target ID columns
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS batch_id TEXT,
  ADD COLUMN IF NOT EXISTS target_id TEXT;

-- 2. Add Watering System (to match JS property)
ALTER TABLE public.daily_logs 
  ADD COLUMN IF NOT EXISTS watering_system TEXT;

-- 3. Make system_id optional (as it might be a Microgreens batch now)
ALTER TABLE public.daily_logs 
  ALTER COLUMN system_id DROP NOT NULL;

-- 4. Create indexes for the new ID columns
CREATE INDEX IF NOT EXISTS idx_daily_logs_batch_id ON public.daily_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_target_id ON public.daily_logs(target_id);

-- 5. RELOAD SCHEMA CACHE (Internal note: This happens automatically in Supabase usually)
COMMENT ON TABLE public.daily_logs IS 'Tracks daily metrics for both Microgreens and Hydroponics';

-- ============================================
-- SQL FIX COMPLETE
-- ============================================
