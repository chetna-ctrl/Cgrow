import { supabase } from '../lib/supabaseClient';
import API_CONFIG from '../config/apiConfig';

/**
 * whatsappService.js
 * ─────────────────────────────────────────────────────────────
 * cGrow WhatsApp Message System — Systematic Chain Design
 *
 * Architecture:
 *   Dashboard → sendCloudMessage() → POST localhost:3001/send-msg → WhatsApp Bot → Your Phone
 * ─────────────────────────────────────────────────────────────
 */

const WA_BOT_URL = API_CONFIG.BOT_URL;

// ─── MESSAGE TEMPLATES ────────────────────────────────────────
/**
 * Yahan se saare messages control hote hain.
 * Ek jagah se sab templates edit karo.
 */
const MessageTemplates = {

    // ── Chain Step 1: Pehla Alert ──────────────────────────────
    STEP_1_HARVEST: (name, date, time) =>
        `🌱 *cGrow — Harvest Alert | Step 1/3*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Namaste *${name}*! 🙏\n\n` +
        `Aapka fresh microgreens harvest *ready* hai!\n\n` +
        `📅 *Date:* ${date}\n` +
        `⏰ *Time:* ${time}\n` +
        `📦 *Status:* Ready for Pickup / Delivery\n\n` +
        `*✅ Important Tips:*\n` +
        `› Order aaj hi karein — stock limited hai\n` +
        `› Aaj order = kal fresh delivery\n` +
        `› Nutrients 48h baad gradually kam hote hain\n\n` +
        `Reply karein ya call karein booking ke liye! 📞\n` +
        `─────────────────────\n` +
        `_cGrow Agri-OS 🌿 — Automated Alert_`,

    // ── Chain Step 2: Follow-up (+24h) ───────────────────────
    STEP_2_FOLLOWUP: (name) =>
        `🔔 *cGrow — Follow-up Reminder | Step 2/3*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Hi *${name}*! Aapka order abhi pending hai.\n\n` +
        `🌿 Fresh stock *abhi bhi available* hai\n` +
        `💚 Aaj last chance hai is batch ke liye\n\n` +
        `*🔬 Kyun aaj hi order karein?*\n` +
        `› Fresh microgreens = Maximum nutrients\n` +
        `› 48 ghante mein Vitamin C 15% tak girti hai\n` +
        `› Next batch mein +7 din ka wait\n\n` +
        `Ek reply karein — hum arrange kar denge! 🚀\n` +
        `─────────────────────\n` +
        `_cGrow Agri-OS 🌿 — Automated Reminder_`,

    // ── Chain Step 3: Final Offer (+48h) ─────────────────────
    STEP_3_OFFER: (name) =>
        `🎁 *cGrow — Special Offer | Step 3/3*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Hi *${name}*! Sirf aapke liye ek offer! 🎉\n\n` +
        `🏷️ *Code:* FRESH20 → *20% OFF* is order pe\n` +
        `⚡ Sirf *aaj midnight* tak valid\n` +
        `📦 Next batch: +7 din baad\n\n` +
        `*Yeh aapka last chance hai is batch ke liye.*\n\n` +
        `Reply "ORDER" karein aur hum confirm kar denge!\n` +
        `─────────────────────\n` +
        `_cGrow Agri-OS 🌿 — Final Offer_`,

    // ── Auto-Refill Alert ─────────────────────────────────────
    AUTO_REFILL: (name, date) =>
        `♻️ *cGrow — Refill Alert*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Hi *${name}*! AI ne predict kiya hai:\n\n` +
        `📊 *Aapka stock khatam hone wala hai!*\n` +
        `📅 Predicted reorder date: *${date}*\n\n` +
        `*📋 Smart Refill Guide:*\n` +
        `› Step 1: Apna current consumption check karein\n` +
        `› Step 2: 7 din pehle order karein\n` +
        `› Step 3: Hum fresh batch ready rakhenge\n\n` +
        `Reply karein to place your order! 🛒\n` +
        `─────────────────────\n` +
        `_cGrow Agri-OS 🌿 — AI Powered Alert_`,

    // ── Broadcast Alert ───────────────────────────────────────
    HARVEST_BROADCAST: (name, date) =>
        `📢 *cGrow — Fresh Harvest Ready!*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `Namaste *${name}*! 🌱\n\n` +
        `Aaj ka fresh harvest *ready hai!*\n` +
        `📅 *Date:* ${date}\n\n` +
        `*🌿 Available Varieties:*\n` +
        `› Radish Microgreens\n` +
        `› Broccoli Microgreens\n` +
        `› Sunflower Shoots\n\n` +
        `*⚡ Limited stock — Pehle aao pehle pao!*\n\n` +
        `Order ke liye reply karein! 📩\n` +
        `─────────────────────\n` +
        `_cGrow Agri-OS 🌿_`,

    // ── Sensor Alert (IoT / ESP32) ────────────────────────────
    SENSOR_ALERT: (metric, value, threshold, advice) =>
        `⚠️ *cGrow — Sensor Alert*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `*${metric}* abnormal range mein hai!\n\n` +
        `📊 *Current:* ${value}\n` +
        `🎯 *Optimal:* ${threshold}\n\n` +
        `*📋 Action Steps:*\n` +
        `${advice}\n\n` +
        `Dashboard pe check karein: ${window.location.origin}\n` +
        `─────────────────────\n` +
        `_cGrow IoT Monitor 🌿_`,

    // ── Custom / Fallback ─────────────────────────────────────
    CUSTOM: (name, body) =>
        `🌱 *cGrow Alert*\n\n` +
        `Hi *${name}*!\n${body}\n\n` +
        `─────────────────────\n` +
        `_cGrow Agri-OS 🌿_`,
};

// ─── Helper: Select Template ──────────────────────────────────
const buildMessage = (customer, contentVars, triggerType) => {
    const name = customer.name || 'Valued Customer';
    const date = contentVars.date || new Date().toLocaleDateString('en-IN');
    const time = contentVars.time || 'Immediate';
    const step = contentVars.step || 1;

    if (contentVars.customBody) return MessageTemplates.CUSTOM(name, contentVars.customBody);

    switch (triggerType) {
        case 'SEQUENCE_STEP':
        case 'MANUAL':
            if (step === 2) return MessageTemplates.STEP_2_FOLLOWUP(name);
            if (step === 3) return MessageTemplates.STEP_3_OFFER(name);
            return MessageTemplates.STEP_1_HARVEST(name, date, time);

        case 'AUTO_REFILL':
            return MessageTemplates.AUTO_REFILL(name, date);

        case 'HARVEST_BROADCAST':
            return MessageTemplates.HARVEST_BROADCAST(name, date);

        case 'SENSOR_ALERT':
            return MessageTemplates.SENSOR_ALERT(
                contentVars.metric || 'Sensor',
                contentVars.value || 'N/A',
                contentVars.threshold || 'Normal Range',
                contentVars.advice || '› Dashboard pe check karein\n› Turant action lein'
            );

        default:
            return MessageTemplates.STEP_1_HARVEST(name, date, time);
    }
};

// ─── Helper: Format Phone ─────────────────────────────────────
const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '91' + digits;
    return digits;
};

// ─── Main Export: sendCloudMessage ────────────────────────────
/**
 * sendCloudMessage
 * Customer ko WhatsApp message bhejta hai via local bot server.
 */
export const sendCloudMessage = async (customer, contentVars = {}, triggerType = 'MANUAL') => {
    try {
        const rawPhone = customer.whatsapp_number || customer.phone;
        if (!rawPhone) throw new Error('Customer ke paas koi number nahi hai.');

        const number = formatPhone(rawPhone);
        const message = buildMessage(customer, contentVars, triggerType);

        const response = await fetch(`${WA_BOT_URL}${API_CONFIG.ENDPOINTS.SEND_MSG}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, message })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            console.warn('WhatsApp Bot error:', result.error);
            return { success: false, fallback: true, error: result.error };
        }

        // Log to Supabase
        await supabase.from('automation_logs').insert({
            customer_id: customer.id,
            message_content: message,
            status: 'Delivered',
            trigger_type: triggerType,
            provider_response: result
        });

        return { success: true, response: result };

    } catch (err) {
        console.warn('WhatsApp Bot offline ya error:', err.message);
        return { success: false, fallback: true, error: err.message };
    }
};

/**
 * sendSensorAlert — ESP32 / IoT alerts ke liye shorthand
 * Python sensor code se directly call kar sakte ho
 */
export const sendSensorAlert = async (phoneNumber, metric, value, threshold, advice) => {
    const fakeCustomer = { id: null, name: 'Operator', whatsapp_number: phoneNumber };
    return sendCloudMessage(fakeCustomer, { metric, value, threshold, advice }, 'SENSOR_ALERT');
};

/**
 * openWhatsAppFallback
 * Bot offline hone par manual WhatsApp Web/App kholta hai.
 */
export const openWhatsAppFallback = (phone, text) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile ? 'https://wa.me/' : 'https://web.whatsapp.com/send';
    const cleanPhone = phone.replace(/[^\d]/g, '');
    window.open(`${baseUrl}${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
};
