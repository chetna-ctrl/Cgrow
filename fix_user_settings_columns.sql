-- FIX FOR MISSING WHATSAPP COLUMNS IN USER_SETTINGS
-- Run this in your Supabase SQL Editor

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS whatsapp_alert_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_auto_reply BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_auto_reply_msg TEXT DEFAULT 'Dhanyawad! Aapka message mil gaya. Hum jald hi reply karenge. 🌱 - cGrow Team',
ADD COLUMN IF NOT EXISTS whatsapp_ai_sales BOOLEAN DEFAULT true;

-- Ensure RLS is updated (if not already)
-- Actually user_settings already has RLS, so adding columns is enough.
