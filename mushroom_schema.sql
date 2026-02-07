-- AGRI-OS MUSHROOM BACKEND SCHEMA
-- Copy and run this in your Supabase SQL Editor

-- 1. CREATE MUSHROOM BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.mushroom_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    mushroom_type text NOT NULL,
    bag_count integer NOT NULL DEFAULT 1,
    start_date date DEFAULT CURRENT_DATE,
    status text DEFAULT 'Active',
    current_stage text DEFAULT 'Spawn Run',
    yield_est_kg numeric(5,2),
    cost_est_inr numeric(8,2),
    created_at timestamptz DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.mushroom_batches ENABLE ROW LEVEL SECURITY;

-- 3. CREATE RLS POLICIES
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mushroom_batches' AND policyname = 'Users can manage their own mushroom batches'
    ) THEN
        CREATE POLICY "Users can manage their own mushroom batches" 
        ON public.mushroom_batches 
        FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. GRANT PERMISSIONS
GRANT ALL ON public.mushroom_batches TO authenticated;
GRANT ALL ON public.mushroom_batches TO service_role;

-- 5. LINK TO HARVEST RECORDS (Optional enhancement)
-- Already handled by harvest_records table's source_type='mushroom'
