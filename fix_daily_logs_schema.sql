-- FIX: Add missing columns to daily_logs for 1-Tap OK and AI Intelligence
-- Run this in the Supabase SQL Editor

DO $$ 
BEGIN 
    -- 1. Add health_score
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'health_score') THEN
        ALTER TABLE public.daily_logs ADD COLUMN health_score INTEGER;
    END IF;

    -- 2. Add ph (Top level)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'ph') THEN
        ALTER TABLE public.daily_logs ADD COLUMN ph NUMERIC(4,2);
    END IF;

    -- 3. Add ec (Top level)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'ec') THEN
        ALTER TABLE public.daily_logs ADD COLUMN ec NUMERIC(5,2);
    END IF;

    -- 4. Add temp (Top level)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'temp') THEN
        ALTER TABLE public.daily_logs ADD COLUMN temp NUMERIC(5,2);
    END IF;

    -- 5. Add humidity (Top level)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'humidity') THEN
        ALTER TABLE public.daily_logs ADD COLUMN humidity NUMERIC(5,2);
    END IF;

    -- 6. Add source_id (text version for robustness)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'source_id') THEN
        ALTER TABLE public.daily_logs ADD COLUMN source_id TEXT;
    END IF;

END $$;

COMMENT ON COLUMN public.daily_logs.health_score IS 'AI-calculated health score (0-100)';
COMMENT ON COLUMN public.daily_logs.ph IS 'Actual or predicted pH level';
COMMENT ON COLUMN public.daily_logs.ec IS 'Actual or predicted EC level';
