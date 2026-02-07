-- Add 'details' column to daily_logs for generic storage (JSONB is best for flexibility)
-- This fixes the "Could not find the 'details' column" error
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.daily_logs.details IS 'JSON storage for calculated health details (light, air, nutrient status) and manual estimate flags';

-- Also add observation_tags if missing (as array of text)
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS observation_tags text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.daily_logs.observation_tags IS 'Array of visual symptoms or manual observation tags (e.g. Leaf Yellowing)';
