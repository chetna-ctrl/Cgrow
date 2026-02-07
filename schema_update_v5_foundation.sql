-- ============================================
-- AGRI-OS MIGRATION: FOUNDATION V2
-- Goal: Support Morning Patrol & Harvest Flows
-- ============================================

-- 1. Create HARVESTS Table
CREATE TABLE IF NOT EXISTS public.harvests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity_weight NUMERIC(10,2) NOT NULL DEFAULT 0, -- Store in grams or standard unit
    waste_weight NUMERIC(10,2) DEFAULT 0,
    revenue NUMERIC(10,2) DEFAULT 0,
    harvest_date TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for harvests
ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own harvests" ON public.harvests
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Indexes for harvests
CREATE INDEX IF NOT EXISTS idx_harvests_batch_id ON public.harvests(batch_id);
CREATE INDEX IF NOT EXISTS idx_harvests_user_id ON public.harvests(user_id);
CREATE INDEX IF NOT EXISTS idx_harvests_date ON public.harvests(harvest_date);


-- 2. Update BATCHES Table
-- Add lifecycle_stage if not exists
ALTER TABLE public.batches
ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'seeded';

-- Add expected yield for efficiency calcs
ALTER TABLE public.batches
ADD COLUMN IF NOT EXISTS expected_yield_weight NUMERIC(10,2);

-- Add yield unit preference (optional, good for display)
ALTER TABLE public.batches
ADD COLUMN IF NOT EXISTS yield_unit TEXT DEFAULT 'g'; 

-- Index for lifecycle
CREATE INDEX IF NOT EXISTS idx_batches_lifecycle ON public.batches(lifecycle_stage);


-- 3. Update DAILY_LOGS Table
-- Add action_type for quick categorization
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'observation'; -- values: water, nutrient, observation, pest

-- Add specific task tracking
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS task_completed boolean DEFAULT false;

-- Index for action type (for filtering "Watering History")
CREATE INDEX IF NOT EXISTS idx_logs_action_type ON public.daily_logs(action_type);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
