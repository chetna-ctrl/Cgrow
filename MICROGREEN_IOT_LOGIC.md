# 📡 Microgreens IoT Integration Logic

This document details the **Hardware-Software Bridge** used in Agri-OS. It explains how physical sensors talk to the React Dashboard and how the "Digital Twin" logic works.

---

## 1. 🏗️ IoT Architecture Overview
The system uses a **Hybrid Cloud Architecture** to ensure data safety even if WiFi fails.

*   **Hardware:** ESP32 Microcontroller (Wi-Fi Enabled).
*   **Database:** Supabase (PostgreSQL) - `daily_logs` table.
*   **Frontend:** React Dashboard (Fetches latest data).
*   **Protocol:** HTTPS (REST API) or MQTT (Future).

### **Data Flow Pipeline**
1.  **Sensor Read:** ESP32 reads `Temp / Humidity / Soil Moisture`.
2.  **Data Push:** ESP32 sends a JSON payload to Supabase via API.
3.  **Frontend Sync:** `fetchLatestIoTData()` in React queries Supabase.
4.  **Auto-Fill:** The "Daily Tracker" form automatically populates with the latest reading (<60 mins old).

---

## 2. 🔌 Sensor Logic & Pin Mapping
We use specific sensors chosen for the **Microgreens Environment** (High Humidity / Low Soil Depth).

### **A. Air Monitoring (DHT22 / AM2302)**
*   **Why?** Unlike DHT11 (±2°C), DHT22 is accurate to ±0.5°C, critical for calculating **VPD**.
*   **Logic:**
    *   Reads `Temp` & `Humidity` every 5 minutes.
    *   **Alert:** If `Hum > 80%` -> Trigger "Mold Warning".

### **B. Soil Moisture (Capacitive v1.2)**
*   **Why?** Resistive sensors corrode in 2 weeks. Capacitive sensors last years.
*   **Calibration Logic (in Firmware):**
    *   `Value = 4095` (Air/Dry) -> **0%**
    *   `Value = 1800` (Water) -> **100%**
    *   **Threshold:** `< 40%` triggers "Water Me" logic.

### **C. Relays (4-Channel Module)**
Used to control AC appliances based on logic signals.
*   **Relay 1:** Grow Lights (16h ON / 8h OFF).
*   **Relay 2:** Circulation Fan (ON if Humidity > 70%).
*   **Relay 3:** Humidifier / Mister.

---

## 3. 💻 Frontend Integration Logic
How the React App interprets the raw hardware data.

### **A. "Auto-Fill" Engine (`DailyTrackerPage.js`)**
The system prevents manual data entry errors by fetching sensor data automatically.
*   **Function:** `fetchLatestIoTData(targetId)`
*   **Logic:**
    1.  Query `daily_logs` filtering by `batch_id`.
    2.  Check timestamp: `(Now - LogTime) < 60 minutes`.
    3.  **If Fresh:** Auto-fill `Humidity` & `Temp` fields in the Form.
    4.  **UI Feedback:** Show "📡 Auto-filled from Sensor" badge.

### **B. "Hardware Hub" Simulation (`MicrogreensPage.js`)**
*   **Purpose:** To give users immediate feedback and manual control overrides.
*   **Power Calculation Logic:**
    *   Fan: `8 Watts`
    *   Lights: `15 Watts`
    *   Mister: `3 Watts`
    *   Idle ESP32: `2 Watts`
    *   **Total:** Sum of Active Devices.

---

## 4. 🤖 Automation Rules (The "Brain")
Rules programmed into the ESP32 firmware (or Backend Edge Functions).

| Condition | Action | Reason |
| :--- | :--- | :--- |
| **Time = 06:00** | `Light ON` | Start "Day Cycle" (Photoperiod). |
| **Time = 22:00** | `Light OFF` | Start "Night Cycle" (Respiration). |
| **Humidity > 75%** | `Fan ON` | Preventing Fungal Spores (Mold). |
| **Soil < 30%** | `Mister ON` | Emergency Re-hydration (Wilting prevention). |

---

## 5. 🛡️ Failsafes
*   **Offline Mode:** If WiFi drops, ESP32 continues the "Schedule" (Lights ON/OFF) using its internal RTC (Real Time Clock).
*   **Sensor Fault:** If `Temp` reads `NaN` or `0`, the system alerts "Sensor Error" and disables the Fan to prevent infinite running.
