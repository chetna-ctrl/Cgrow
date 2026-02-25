# 📡 Agri-OS: IoT Integration Algorithms & Sensor Suite
*Technical documentation of the Real-time Telemetry Engine and Hardware abstraction layer.*

---

## 1. ⚙️ The Integration Algorithm: "Hybrid Twin Engine"

Agri-OS uses a unique **Hybrid Twin** algorithm to handle data. It does not rely solely on sensors; it seamlessly switches between **Manual Logs**, **Live Telemetry**, and **Weather Estimates**.

### **The Decision Logical Flow:**

1.  **Incoming Data Stream:**
    *   **Priority 1 (Live IOT):** High-frequency MQTT/Supabase Realtime packets (ms latency).
    *   **Priority 2 (Manual):** User-submitted daily logs.
    *   **Priority 3 (Ghost):** If no data for >24h, generate from `OpenWeatherMap` API.

2.  **Validation Gate (`validateSensorData`):**
    Before any sensor data touches the dashboard, it passes through a physics-based filter to reject noise/glitches.

    ```javascript
    // src/utils/agriUtils.js
    export function validateSensorData(reading) {
        // 1. Check Physics Limits (e.g., pH cannot be 15)
        if (reading.ph < 0 || reading.ph > 14) return reject(reading);
        
        // 2. Check Operational Limits (Operational Warning)
        if (reading.temp > 50) flagWarning("High Temp Hazard");
        
        // 3. Noise Filter (Simple Moving Average not shown)
        return cleanData;
    }
    ```

3.  **The "DLI Hybrid" Algorithm (`calculateDLI`):**
    Calculates *Daily Light Integral* by fusing different sources.
    *   *If IOT Lux Sensor exists:* Convert `Lux` $\to$ `PPFD` $\to$ `DLI` (Precision Mode).
    *   *If Manual only:* Estimate based on "Light Hours" input x Bulb Wattage.

---

## 2. 🔌 Supported Sensors & Hardware Specs

The codebase is hard-coded to support specific industrial and hobbyist sensors. These are defined in `SENSOR_LIMITS`.

### **A. Primary Sensors (Environment)**

| Sensor Model | Metric | Code Variable | Logic/Alerts |
| :--- | :--- | :--- | :--- |
| **DHT22 / AM2302** | Air Temp & Humidity | `temp`, `humidity` | Used for **VPD Calculation**. High humidity triggers "Fungal Risk" alert. |
| **DS18B20** | Water Temperature | `waterTemp` | **Critical:** If $>25^\circ C$, triggers "Root Rot" alarm. |
| **BH1750** | Light Intensity (Lux) | `lux` | Used in `calculateDLI`. Converts Lux to PPFD using `0.0185` factor (Sunlight). |

### **B. Hydroponic Sensors (Water Quality)**

| Sensor Model | Metric | Code Variable | Logic/Alerts |
| :--- | :--- | :--- | :--- |
| **Analog pH Meter** | Acidity (pH) | `ph` | **Range:** 5.5 - 6.5. Deviations affect `HealthScore` (-40 points). |
| **TDS Meter (Analog)** | Conductivity (EC) | `ec` | Measures nutrient strength. High EC ($>2.5$) triggers "Salt Stress". |
| **Capacitive Soil** | Moisture % | `moisture` | For Microgreens. Used to detect "Dry Tray" events. |

---

## 3. 🧠 Smart Control Algorithms

### **A. The "Ghost Log" (Auto-Fill)**
If hardware goes offline, the system heals itself.
*   **Trigger:** No data for >24 hours.
*   **Action:** Fetches historic weather data for `DELHI_NCR`.
*   **Algorithm:** `generateGhostLogFromWeather` maps Extrapolated VPD to the batch history so charts don't break.

### **B. Trend Detection**
*   **Function:** `analyzeTrend(logs)`
*   **Math:** Uses **Linear Regression Slope**.
*   **Use Case:** Detects "pH Drift". If pH rises $>0.1$ per day (Slope > 0.1), it predicts "Lockout" before it happens.

---

## 4. 🔗 Database Integration (Supabase)

*   **Table:** `telemetry`
*   **Frequency:** Sensors ping every 15-60 seconds.
*   **Realtime:** Dashboard subscribes via `supabase.channel('telemetry')` for instant UI updates (The "Live" badge).

*Documentation based on `v1.5` codebase analysis.*
