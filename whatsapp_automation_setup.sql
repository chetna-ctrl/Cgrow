-- WHATSAPP AUTOMATION SCHEMA

-- 1. Automation Chains Table
-- Tracks the status of a customer in a specific message sequence
CREATE TABLE IF NOT EXISTS public.automation_chains (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    customer_id uuid REFERENCES public.customers(id),
    chain_type text NOT NULL, -- 'HARVEST_ALERT', 'ORDER_FOLLOWUP'
    current_step integer DEFAULT 1,
    status text DEFAULT 'Active', -- 'Active', 'Completed', 'Paused'
    last_sent_at timestamptz DEFAULT now(),
    next_scheduled_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 2. Automation Logs
-- Record of every message sent
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    customer_id uuid REFERENCES public.customers(id),
    chain_id uuid REFERENCES public.automation_chains(id),
    message_content text,
    status text, -- 'Sent', 'Failed', 'Delivered'
    provider_response jsonb,
    created_at timestamptz DEFAULT now()
);

-- 3. Update Customers Table
-- Adding WhatsApp specific fields
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;

-- 4. Enable RLS
ALTER TABLE public.automation_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Users can manage their own chains" ON public.automation_chains;
CREATE POLICY "Users can manage their own chains" ON public.automation_chains
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own automation logs" ON public.automation_logs;
CREATE POLICY "Users can manage their own automation logs" ON public.automation_logs
USING (auth.uid() = user_id);

-- 6. Trigger Example (Conceptual)
-- This function would be called when a new order is inserted
-- to automatically start the 'ORDER_FOLLOWUP' chain.
/*
CREATE OR REPLACE FUNCTION start_order_automation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.automation_chains (user_id, customer_id, chain_type, next_scheduled_at)
    VALUES (NEW.user_id, NEW.customer_id, 'ORDER_FOLLOWUP', now() + interval '1 day');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION start_order_automation();
*/
