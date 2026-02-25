// SUPABASE EDGE FUNCTION: whatsapp-processor (Reference)
// This function would typically run on a schedule (Cron) to process due messages.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WHATSAPP_API_URL = 'https://api.whatsapp.com/v1/messages'
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')

Deno.serve(async (req) => {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch all 'Active' chains where 'next_scheduled_at' is now or in the past
    const { data: dueChains, error: fetchError } = await supabase
        .from('automation_chains')
        .select('*, customers(whatsapp_number, name)')
        .eq('status', 'Active')
        .lte('next_scheduled_at', new Date().toISOString())

    if (fetchError) return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })

    const results = []

    for (const chain of dueChains) {
        // 2. Determine Message Content based on Chain Type and Step
        const message = getMessageContent(chain.chain_type, chain.current_step, chain.customers.name)

        // 3. Send WhatsApp Message (Hypothetical API call)
        try {
            /* 
            const response = await fetch(WHATSAPP_API_URL, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: chain.customers.whatsapp_number,
                text: message
              })
            })
            */

            // 4. Update Chain and Log
            const nextStep = chain.current_step + 1
            const isCompleted = nextStep > 3 // Assuming 3-step chains

            await supabase.from('automation_chains').update({
                current_step: nextStep,
                last_sent_at: new Date().toISOString(),
                next_scheduled_at: isCompleted ? null : calculateNextTime(chain.chain_type, nextStep),
                status: isCompleted ? 'Completed' : 'Active'
            }).eq('id', chain.id)

            await supabase.from('automation_logs').insert({
                user_id: chain.user_id,
                customer_id: chain.customer_id,
                chain_id: chain.id,
                message_content: message,
                status: 'Sent'
            })

            results.push({ id: chain.id, status: 'Success' })
        } catch (e) {
            results.push({ id: chain.id, status: 'Failed', error: e.message })
        }
    }

    return new Response(JSON.stringify({ processed: results.length, details: results }), { headers: { 'Content-Type': 'application/json' } })
})

function getMessageContent(type, step, name) {
    const messages = {
        'HARVEST_ALERT': [
            `Hi ${name}! Fresh harvest of Radish Microgreens is ready today. Order now!`,
            `Hi ${name}, just checking in! Did you see today's harvest? Limited stock left.`,
            `Special Offer for ${name}! Use code FRESH20 for 20% off your harvest order today!`
        ],
        'ORDER_FOLLOWUP': [
            `Thanks for your order, ${name}! We hope you enjoy your microgreens.`,
            `Hi ${name}, how were the microgreens? We'd love your feedback!`
        ]
    }
    return messages[type]?.[step - 1] || 'Hello from cGrow!'
}

function calculateNextTime(type, nextStep) {
    const delay = nextStep === 2 ? 86400000 : 86400000 * 2; // 24h then 48h
    return new Date(Date.now() + delay).toISOString();
}
