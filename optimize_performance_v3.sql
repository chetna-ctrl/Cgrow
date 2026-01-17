-- ============================================
-- AGRI-OS PERFORMANCE OPTIMIZATION (v3.0)
-- Run this in Supabase SQL Editor to speed up dashboards
-- ============================================

-- 1. INDEXES FOR ANALYTICS (Speed up Date Filtering)
-- Why: The Analytics page filters logs by 'log_date' heavily.
CREATE INDEX IF NOT EXISTS idx_daily_logs_date 
ON public.daily_logs(log_date DESC);

-- 2. INDEXES FOR DASHBOARD (Speed up "Active" counts)
-- Why: Dashboard queries "status != 'Harvested'" constantly.
CREATE INDEX IF NOT EXISTS idx_microgreens_status 
ON public.microgreens_batches(status) 
WHERE status != 'Harvested';

CREATE INDEX IF NOT EXISTS idx_hydroponics_status 
ON public.hydroponics_systems(status) 
WHERE status != 'Harvested';

-- 3. INDEXES FOR REVENUE (Speed up Financial Aggregations)
-- Why: Finance Engine sums revenue by crop type.
CREATE INDEX IF NOT EXISTS idx_harvests_crop 
ON public.harvest_records(crop);

CREATE INDEX IF NOT EXISTS idx_harvests_date 
ON public.harvest_records(harvest_date DESC);

-- 4. HYDROPONICS CROP LINKAGE
-- Ensure 'crop' column exists for active system forecasting
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='hydroponics_systems' AND column_name='crop') THEN
    ALTER TABLE public.hydroponics_systems ADD COLUMN crop TEXT DEFAULT 'Lettuce';
  END IF;
END $$;

-- 5. MAINTENANCE (Optional: Update Statistics)
ANALYZE public.daily_logs;
ANALYZE public.microgreens_batches;
ANALYZE public.hydroponics_systems;

-- ============================================
-- OPTIMIZATION COMPLETE
-- ============================================
