/**
 * SUPABASE EDGE FUNCTION: twilio-whatsapp
 * 
 * Secure processing of Twilio WhatsApp messages.
 * This file should be deployed to Supabase:
 * 'supabase functions deploy twilio-whatsapp'
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const FROM_NUMBER = 'whatsapp:+14155238886'; // Your Twilio Sandbox or Prod Number

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log(`Checking secrets: SID: ${ACCOUNT_SID ? 'OK' : 'MISSING'}, Token: ${AUTH_TOKEN ? 'OK' : 'MISSING'}`);
        if (!AUTH_TOKEN) throw new Error("TWILIO_AUTH_TOKEN is not set in Supabase Secrets");

        const { to, variables, body } = await req.json();

        console.log(`Sending message to: ${to}`);

        if (!to) throw new Error("Recipient 'to' is required");

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;

        const params = new URLSearchParams();
        params.append('To', to);
        params.append('From', FROM_NUMBER);

        // If a body is provided, use it (best for Sandbox/Individual messages)
        if (body) {
            params.append('Body', body);
        } else {
            // Otherwise use Content API Template
            params.append('ContentSid', 'HXb5b62575e6e4ff6129ad7c8efe1f983e');
            params.append('ContentVariables', JSON.stringify(variables || {}));
            params.append('Body', 'Your Microgreens Update from cGrow Labs'); // Fallback
        }

        const response = await fetch(twilioUrl, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Twilio API Error:', result);
            return new Response(JSON.stringify({ error: result.message, details: result }), {
                status: response.status,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ success: true, sid: result.sid }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error('Function Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    }
})
