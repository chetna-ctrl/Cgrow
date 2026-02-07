-- 1. FIX DAILY LOGS TABLE (Ensure linking columns exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'batch_id') THEN
        ALTER TABLE public.daily_logs ADD COLUMN batch_id text; -- Store batch ID (can be string or number string)
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'target_id') THEN
        ALTER TABLE public.daily_logs ADD COLUMN target_id text; -- Store hydro system ID
    END IF;
END $$;

-- 2. FIX HARVEST RECORDS TABLE (Ensure source_id is flexible)
-- We cast source_id to text to accommodate both BigInt IDs (15) and String IDs ("B001")
DO $$
BEGIN
    -- If it's bigint, we might need to change it to text or keep it separate. 
    -- For safety, let's keep it flexible. 
    -- Assuming source_id exists. If not, add it.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'harvest_records' AND column_name = 'source_id') THEN
        ALTER TABLE public.harvest_records ADD COLUMN source_id text;
    ELSE
         -- If it exists but is integer, we might want to alter it to text to be safe
         ALTER TABLE public.harvest_records ALTER COLUMN source_id TYPE text;
    END IF;
END $$;

-- 3. PERMISSIONS (Just in case)
GRANT ALL ON public.daily_logs TO authenticated;
GRANT ALL ON public.harvest_records TO authenticated;
GRANT ALL ON public.batches TO authenticated;
GRANT ALL ON public.systems TO authenticated;
