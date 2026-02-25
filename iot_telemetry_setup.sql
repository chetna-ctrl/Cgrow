-- cGrow IoT Telemetry Infrastructure
-- This table stores high-frequency pings from ESP32 sensors.

CREATE TABLE IF NOT EXISTS public.telemetry (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    device_id text NOT NULL,
    system_type text, -- 'Microgreens' or 'Hydroponics'
    item_id uuid, -- batch_id or target_id
    temp numeric,
    humidity numeric,
    lux numeric,
    moisture numeric,
    -- PRO FEATURES (v2.1)
    water_level_cm numeric,     -- Ultrasonic Sensor
    pump_current_amps numeric,  -- ACS712 Sensor
    confidence_score int DEFAULT 100, -- Sensor Fusion Score
    created_at timestamptz DEFAULT now()
);

-- SYSTEM HEARTBEATS (Dead Man's Switch)
CREATE TABLE IF NOT EXISTS public.system_heartbeats (
    device_id text PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    status text, -- 'ONLINE', 'OFFLINE', 'MAINTENANCE'
    last_ping timestamptz DEFAULT now(),
    ip_address text,
    uptime_seconds bigint,
    firmware_version text
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_heartbeats ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own telemetry
DROP POLICY IF EXISTS "Users can view their own telemetry" ON public.telemetry;
CREATE POLICY "Users can view their own telemetry" 
ON public.telemetry FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own heartbeats" ON public.system_heartbeats;
CREATE POLICY "Users can view their own heartbeats" 
ON public.system_heartbeats FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own telemetry
DROP POLICY IF EXISTS "Users can insert their own telemetry" ON public.telemetry;
CREATE POLICY "Users can insert their own telemetry" 
ON public.telemetry FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own heartbeats" ON public.system_heartbeats;
CREATE POLICY "Users can upsert their own heartbeats" 
ON public.system_heartbeats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own heartbeats" ON public.system_heartbeats;
CREATE POLICY "Users can update their own heartbeats" 
ON public.system_heartbeats FOR UPDATE
USING (auth.uid() = user_id);

-- Enable Realtime for the telemetry table
-- Note: This requires the 'supabase_realtime' publication to exist.
DO $$
BEGIN
    -- Check if publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Check if telemetry is already in the publication
        IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND tablename = 'telemetry'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE telemetry;
        END IF;

        -- Check if system_heartbeats is already in the publication
        IF NOT EXISTS (
            SELECT 1
            FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime'
            AND tablename = 'system_heartbeats'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE system_heartbeats;
        END IF;
    END IF;
END $$;

-- Create an index for fast lookups of recent data
CREATE INDEX IF NOT EXISTS idx_telemetry_user_created ON public.telemetry(user_id, created_at DESC);
