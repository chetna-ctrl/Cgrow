-- ============================================
-- AGRI-OS MIGRATION: FINANCE V1
-- Goal: Enable Real Cost Tracking & Profit Calculation
-- ============================================

-- 1. Create COSTS Table
CREATE TABLE IF NOT EXISTS public.costs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL, -- e.g., 'Electricity', 'Seeds', 'Labor', 'Nutrients', 'Maintenance', 'Other'
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own costs
CREATE POLICY "Users can view own costs" ON public.costs
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own costs
CREATE POLICY "Users can insert own costs" ON public.costs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own costs
CREATE POLICY "Users can delete own costs" ON public.costs
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_costs_user_date ON public.costs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_costs_category ON public.costs(category);

-- ============================================
-- END MIGRATION
-- ============================================
