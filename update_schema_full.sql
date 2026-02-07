-- AGRI-OS COMPREHENSIVE SCHEMA UPDATE
-- generated: 2026-01-19
-- purpose: Add columns for "Smart Assistant" features (VPD, GDD, Interventions, Alerts)

-- 1. INTERVENTIONS (Actions & Causality)
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS intervention_actions text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.daily_logs.intervention_actions IS 'List of actions taken by farmer (e.g. Added pH Down, Sprayed Neem)';


-- 2. BIOPHYSICS METRICS (Derived Intelligence)
-- VPD (Vapor Pressure Deficit) - The #1 predictor of fungal risk and tip burn
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS vpd_kpa numeric(4,2);

-- GDD (Growing Degree Days) - Used for Harvest Prediction
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS gdd_daily numeric(5,2);

-- DLI (Daily Light Integral) - Energy received by plant (Photosynthesis Potential)
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS dli_mol_per_m2 numeric(5,2);

-- Light Source & Hours (Needed to calculate DLI if sensor missing)
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS lighting_source text;

ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS light_hours_per_day numeric(4,2);


-- 3. HEALTH & ALERTS (System Status)
-- Health Score (0-100) - Calculated Composite Score
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS health_score integer;

-- Alert Severity ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS alert_severity text;

-- Count of active nutrient warnings
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS nutrient_warnings_count integer DEFAULT 0;

-- 4. MISSING IDENTIFIERS (Fixes for old schema)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'batch_id') THEN
        ALTER TABLE public.daily_logs ADD COLUMN batch_id text; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_logs' AND column_name = 'target_id') THEN
        ALTER TABLE public.daily_logs ADD COLUMN target_id text; 
    END IF;
END $$;


-- 5. SYNC & AUTOMATION (Ghost Logs)
ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS sync_source text DEFAULT 'MANUAL';

ALTER TABLE public.daily_logs 
ADD COLUMN IF NOT EXISTS is_ghost_log boolean DEFAULT false;

-- 6. REFRESH PERMISSIONS
GRANT ALL ON public.daily_logs TO authenticated;
