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
    created_at timestamptz DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own telemetry
CREATE POLICY "Users can view their own telemetry" 
ON public.telemetry FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own telemetry
CREATE POLICY "Users can insert their own telemetry" 
ON public.telemetry FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for the telemetry table
-- Note: This requires the 'supabase_realtime' publication to exist.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE telemetry;
    END IF;
END $$;

-- Create an index for fast lookups of recent data
CREATE INDEX IF NOT EXISTS idx_telemetry_user_created ON public.telemetry(user_id, created_at DESC);
