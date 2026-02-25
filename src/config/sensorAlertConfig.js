/**
 * sensorAlertConfig.js
 * ─────────────────────────────────────────────────────────────
 * 👈 SIRF YAHAN APNA NUMBER DAALO — baki sab automatic hai!
 *
 * Jab bhi koi sensor (moisture, temperature, pH) unsafe range
 * mein jayega — yahan diye number pe WhatsApp alert jayega.
 * ─────────────────────────────────────────────────────────────
 */

const SENSOR_ALERT_CONFIG = {

    // ── Aapka WhatsApp Number (Array of strings) ─────────────
    // Multiple numbers add kar sakte hain comma (,) se separate karke
    // Example: ['919876543210', '919876543211']
    OWNER_PHONE: ['9899095327', '7838898887'],   // ← YAHAN APNA(E) NUMBER(S) DAALO

    // ── Alert Limits — Inhe change kar sakte ho ─────────────
    THRESHOLDS: {
        moisture: { low: 20 },           // % se kam = alert
        temperature: { low: 15, high: 35 }, // °C range
        humidity: { low: 40, high: 85 }, // % range
        ph: { low: 5.5, high: 7.0 },
        ec: { high: 3.5 },         // mS/cm
    },

    // ── Cooldown: Ek sensor ke liye kitne minute mein ek hi alert
    COOLDOWN_MINUTES: 30,
};

export default SENSOR_ALERT_CONFIG;
