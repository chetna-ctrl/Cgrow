import { supabase } from '../lib/supabaseClient';
import { sendCloudMessage } from './twilioService';
import { predictConsumption } from '../utils/mlIntelligence';

/**
 * Automation Service (Autopilot Engine)
 * Handles background processing for scheduled chains and predictive notifications.
 */

export const processDueChains = async (chains, customers, orders) => {
    const now = new Date();
    const dueChains = chains.filter(chain =>
        chain.status === 'Active' &&
        chain.next_scheduled_at &&
        new Date(chain.next_scheduled_at) <= now
    );

    if (dueChains.length === 0) return { processed: 0 };

    let processedCount = 0;
    for (const chain of dueChains) {
        const customer = chain.customers;
        if (!customer) continue;

        const nextStep = (chain.current_step || 0) + 1;
        if (nextStep > 3) {
            // End of chain
            await supabase.from('automation_chains').update({ status: 'Completed' }).eq('id', chain.id);
            continue;
        }

        // Logic for auto-advancing (Step 1 is usually manual, but Step 2+ can be auto)
        // In this "Autopilot" mode, we allow Step 2 and 3 to fire automatically.
        if (nextStep >= 2) {
            const res = await sendCloudMessage(customer, {
                date: now.toLocaleDateString('en-IN'),
                time: 'Scheduled Autopilot'
            }, 'SEQUENCE_STEP');

            if (res.success) {
                // Update chain to next step
                const nextSchedule = new Date();
                nextSchedule.setHours(nextSchedule.getHours() + 24); // Schedule for +24h

                await supabase.from('automation_chains').update({
                    current_step: nextStep,
                    last_action_at: now.toISOString(),
                    next_scheduled_at: nextStep < 3 ? nextSchedule.toISOString() : null,
                    status: nextStep === 3 ? 'Completed' : 'Active'
                }).eq('id', chain.id);

                processedCount++;
            }
        }
    }

    return { processed: processedCount };
};

export const runPredictiveAutoRefill = async (customers, orders) => {
    const now = new Date();
    let refillCount = 0;

    for (const customer of customers) {
        if (!customer.marketing_consent) continue;

        const prediction = predictConsumption(customer, orders);

        // If refill is urgent and no recent auto-refill logs
        if (prediction.isRefillUrgent) {
            // Check logs for recent automated refills (Spam control: 48h)
            const { data: logs } = await supabase
                .from('automation_logs')
                .select('created_at')
                .eq('customer_id', customer.id)
                .eq('trigger_type', 'AUTO_REFILL')
                .gte('created_at', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString());

            if (!logs || logs.length === 0) {
                const res = await sendCloudMessage(customer, {
                    date: now.toLocaleDateString('en-IN'),
                    time: 'AI Auto-Refill'
                }, 'AUTO_REFILL');

                if (res.success) {
                    refillCount++;
                }
            }
        }
    }

    return { refills: refillCount };
};
