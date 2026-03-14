-- Migration script to add missing columns to the daily_logs table

-- 1. Essential Health & Analytics Metrics
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS alert_severity text DEFAULT 'NONE';
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS health_score numeric;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS dli_mol_per_m2 numeric;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS gdd_daily numeric;

-- 2. Environmental & Input Metrics
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS lighting_source text;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS light_hours_per_day numeric;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS vpd_kpa numeric;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS vpd_risk_factor text;

-- 3. System & Tracking specifics
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS system_type text;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS target_id uuid; -- Used by Hydroponics
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS batch_id uuid; -- Used by Microgreens
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS sync_id text;

-- 4. Intervention & Observation arrays
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS intervention_actions text[];
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS observation_tags text[];

-- 5. Additional Hydroponics specific telemetry
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS pump_status text;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS water_flow text;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS air_stones text;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS hydration_stress boolean;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS last_cycle_time numeric;

-- 6. Ensure JSONB column for flexible schema additions
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;
