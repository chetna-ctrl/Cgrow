import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import SENSOR_ALERT_CONFIG from '../config/sensorAlertConfig';
import API_CONFIG from '../config/apiConfig';


/**
 * useSensorData.js
 * ─────────────────────────────────────────────────────────────
 * Realtime sensor data hook — Supabase se live data + WhatsApp alerts
 *
 * Jab bhi ESP32/sensor ek new reading bhejega aur value threshold se
 * neeche/upar jayegi, automatically WhatsApp pe alert jayega.
 * ─────────────────────────────────────────────────────────────
 */

// ─── Alert Thresholds ─────────────────────────────────────────
// sensorAlertConfig.js se aata hai — wahan edit karo
const ALERT_THRESHOLDS = {
    moisture: {
        ...SENSOR_ALERT_CONFIG.THRESHOLDS.moisture,
        label: 'Soil Moisture', unit: '%',
        advice: '› Pani dijiye turant\n› Drip system check karein\n› Tray drainage check karein',
        emoji: '💧'
    },
    temperature: {
        ...SENSOR_ALERT_CONFIG.THRESHOLDS.temperature,
        label: 'Temperature', unit: '°C',
        advice: '› Ventilation check karein\n› Shade net lagayein agar zyada ho\n› Heater check karein agar kum ho',
        emoji: '🌡️'
    },
    humidity: {
        ...SENSOR_ALERT_CONFIG.THRESHOLDS.humidity,
        label: 'Humidity', unit: '%',
        advice: '› Humidifier ya dehumidifier use karein\n› Air circulation badhayein\n› Misting schedule adjust karein',
        emoji: '💨'
    },
    ph: {
        ...SENSOR_ALERT_CONFIG.THRESHOLDS.ph,
        label: 'pH Level', unit: 'pH',
        advice: '› pH up/down solution use karein\n› Nutrient solution replace karein\n› 1 ghante mein dobara check karein',
        emoji: '⚗️'
    },
    ec: {
        ...SENSOR_ALERT_CONFIG.THRESHOLDS.ec,
        label: 'EC Level', unit: 'mS/cm',
        advice: '› Fresh water add karein\n› Nutrient solution dilute karein\n› Plant roots check karein',
        emoji: '⚡'
    }
};


// ─── Alert Cooldown (Spam control) ────────────────────────────
const ALERT_COOLDOWN_MS = SENSOR_ALERT_CONFIG.COOLDOWN_MINUTES * 60 * 1000;

const lastAlertTime = {};   // { "moisture_batchId": timestamp }

const shouldSendAlert = (key) => {
    const lastTime = lastAlertTime[key] || 0;
    if (Date.now() - lastTime > ALERT_COOLDOWN_MS) {
        lastAlertTime[key] = Date.now();
        return true;
    }
    return false;
};

// ─── WhatsApp Alert Sender ────────────────────────────────────
const sendWhatsAppSensorAlert = async (ownerPhone, metric, value, threshold, advice, emoji) => {
    if (!ownerPhone) {
        console.warn('📵 No owner phone configured for sensor alerts');
        return;
    }

    // Support single string, comma-separated string, or array
    let phoneList = [];
    if (Array.isArray(ownerPhone)) {
        phoneList = ownerPhone;
    } else if (typeof ownerPhone === 'string') {
        phoneList = ownerPhone.split(',').map(n => n.trim()).filter(n => n.length > 0);
    }

    if (phoneList.length === 0) return;

    const message =
        `${emoji} *cGrow — Sensor Alert!*\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n` +
        `*${metric}* critical range mein hai!\n\n` +
        `📊 *Reading:* ${value}\n` +
        `🎯 *Safe Range:* ${threshold}\n` +
        `🕐 *Time:* ${new Date().toLocaleTimeString('en-IN')}\n\n` +
        `*📋 Action Steps:*\n` +
        `${advice}\n\n` +
        `Dashboard: ${window.location.origin}\n` +
        `─────────────────────\n` +
        `_cGrow IoT Monitor 🌿_`;

    for (const rawPhone of phoneList) {
        const digits = String(rawPhone).replace(/\D/g, '');
        const number = digits.length === 10 ? `91${digits}` : digits;

        try {
            const res = await fetch(`${API_CONFIG.BOT_URL}${API_CONFIG.ENDPOINTS.SEND_MSG}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number, message })
            });
            const data = await res.json();
            if (data.success) {
                console.log(`✅ WhatsApp sensor alert sent to ${number}: ${metric} = ${value}`);
            }
        } catch (err) {
            console.warn(`WhatsApp Bot offline — alert not sent to ${number}:`, err.message);
        }
    }
};


// ─── Check Reading Against Thresholds ────────────────────────
const checkThresholds = async (reading, ownerPhone) => {
    const batchKey = reading.batch_id || reading.target_id || 'global';

    for (const [metricKey, config] of Object.entries(ALERT_THRESHOLDS)) {
        const value = reading[metricKey];
        if (value === undefined || value === null) continue;

        let breached = false;
        let thresholdText = '';

        if (config.low !== undefined && value < config.low) {
            breached = true;
            thresholdText = `> ${config.low}${config.unit} (abhi: ${value}${config.unit} — bahut kam)`;
        } else if (config.high !== undefined && value > config.high) {
            breached = true;
            thresholdText = `< ${config.high}${config.unit} (abhi: ${value}${config.unit} — bahut zyada)`;
        }

        if (breached) {
            const alertKey = `${metricKey}_${batchKey}`;
            if (shouldSendAlert(alertKey)) {
                console.log(`⚠️ Threshold breached: ${config.label} = ${value}`);
                await sendWhatsAppSensorAlert(
                    ownerPhone,
                    config.label,
                    `${value}${config.unit}`,
                    thresholdText,
                    config.advice,
                    config.emoji
                );
            }
        }
    }
};

// ─── Main Hook ────────────────────────────────────────────────
/**
 * @param {string} batchId - Optional batch ID to filter
 * @param {string} targetId - Optional target ID to filter
 * @param {string} ownerPhone - Aapka WhatsApp number (alerts ke liye)
 *                              Example: "9876543210"
 */
export const useSensorData = (batchId = null, targetId = null, ownerPhone = null) => {
    const [latestReading, setLatestReading] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const queryClient = useQueryClient();

    // Config se default phone — agar prop nahi diya toh config ka use hoga
    const resolvedPhone = ownerPhone || SENSOR_ALERT_CONFIG.OWNER_PHONE;
    const ownerPhoneRef = useRef(resolvedPhone);
    useEffect(() => { ownerPhoneRef.current = ownerPhone || SENSOR_ALERT_CONFIG.OWNER_PHONE; }, [ownerPhone]);


    useEffect(() => {
        const channel = supabase
            .channel('sensor-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'sensor_readings'
            }, async (payload) => {
                const newReading = payload.new;

                // Filter by batch/target if specified
                if (batchId && String(newReading.batch_id) !== String(batchId)) return;
                if (targetId && String(newReading.target_id) !== String(targetId)) return;

                // Update state
                setLatestReading(newReading);
                setIsLive(true);

                // Invalidate queries to refresh dashboard
                queryClient.invalidateQueries(['daily_logs']);
                queryClient.invalidateQueries(['sensor_readings']);

                console.log('📡 New sensor data received:', newReading);

                // 🚨 Check thresholds & send WhatsApp alert if needed
                await checkThresholds(newReading, ownerPhoneRef.current);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [batchId, targetId, queryClient]);

    return { latestReading, isLive };
};

/**
 * useHasIoTDevices
 * Check if user has any registered IoT devices
 */
export const useHasIoTDevices = () => {
    const [hasDevices, setHasDevices] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkDevices = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }

            const { data, error } = await supabase
                .from('iot_devices')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);

            if (!error && data && data.length > 0) setHasDevices(true);
            setLoading(false);
        };

        checkDevices();
    }, []);

    return { hasDevices, loading };
};
