# 🧠 Microgreens Logic & Algorithms: The "Brain" of Agri-OS

This document is the **Full Technical Specification** of every logic, threshold, and algorithm used in the Microgreens Module. It explains exactly how the system "thinks", how it "talks" to you, and how it protects your crops.

---

## 1. 💧 Smart Watering & Moisture Logic
**Goal:** Prevent Root Rot (Over-watering) and Wilting (Under-watering).

### **A. "Tracker Indication" (Dynamic Advice)**
The system tells you *how* to water the moment you select a batch in the **Daily Tracker**.
*   **Source:** `getDailyTaskAdvice(batch)`
*   **Where you see it:** Blue "Task Guide" card in the Logging Form.

| Crop Age | Indication (UI) | Technique | Why? |
| :--- | :--- | :--- | :--- |
| **Day 0 - 3** | 🚿 **"Spray / Misting"** | Top-down fine mist. | Seeds have no roots. They need surface water to germinate. Heavy pouring drowns them. |
| **Day 4+** | 📥 **"Bottom Watering"** | Depends on Tray Type (see below). | Roots have touched bottom. Water the *roots*, not the leaves. Wet leaves = Mold. |

### **C. Practical Watering Methods (Tray Type)**
The dashboard now adjusts advice based on your tray setup (`USER_SETTINGS.TRAY_TYPE`).

| Tray Type | Method | Instruction | Why? |
| :--- | :--- | :--- | :--- |
| **Double Tray** | Reservoir Method | Pour 300-500ml in bottom tray. | Standard method. Consistent moisture. |
| **Single Tray** | **Tub Method (Dip & Lift)** | Dip tray in water tub for 15-20 min. Lift when heavy. | **Crucial:** Prevents top-watering which causes mold. Mimics bottom watering. |

### **B. Soil Moisture Sensor Thresholds**
*   **Sensor:** Capacitive Soil Moisture v1.2 (Analog)
*   **Logic:**
    *   **< 40%:** `DRY` -> **Action:** "Water Immediately" (Risk of Wilting).
    *   **40% - 70%:** `OPTIMAL` -> **Action:** "Perfect Zone" (Roots breathing well).
    *   **> 80%:** `WET` -> **Action:** "STOP Watering" (Risk of Root Rot / Pythium).

### **B.2 "Feeling" Based Moisture (No Sensor)**
If you don't have a sensor, the system asks **"How heavy is the tray?"**
*   **Light** 🪶 -> Needs Water (30% Moisture).
*   **Normal/Heavy** ⚖️ -> Perfect (60% Moisture).
*   **Soggy/Very Heavy** 💧 -> **STOP WATERING** (90% Moisture).

---

## 2. 🤖 The Heuristic Engine (Human-to-Data)
Since beginners describe things in words, not numbers, the system translates them into scientific data using `MANUAL_PATTERNS`.

### **A. "Nutrient Strength" Translation**
*   **User Says:** *"Low"* -> **System Reads:** `EC: 0.8 mS/cm` (Seedling Mix).
*   **User Says:** *"Medium"* -> **System Reads:** `EC: 1.5 mS/cm` (Optimal Growth).
*   **User Says:** *"High"* -> **System Reads:** `EC: 2.2 mS/cm` (Fruiting/Burn Risk).

### **B. "Air Quality" Translation**
*   **User Says:** *"Dry / Crisp"* -> **System Reads:** `Humidity: 40%` (High Transpiration).
*   **User Says:** *"Muggy / Sticky"* -> **System Reads:** `Humidity: 85%` (Mold Danger Zone).

### **C. "Water Temp" Translation**
*   **User Says:** *"Cold"* -> **System Reads:** `Temp: 18°C` (Too cold for some).
*   **User Says:** *"Warm"* -> **System Reads:** `Temp: 28°C` (Pythium Risk).

---

## 3. 🚨 Smart Alert & Prevention System
The "Digital Doctor" scans for dangerous combinations of variables.

### **A. "Mold Risk" Algorithm**
Mold loves warm, wet, stagnant air.
*   **Trigger Condition:**
    *   `Humidity > 70%` **AND** `Airflow (Fan) == OFF`
*   **System Action:**
    *   1. Flashing **RED Alert** on dashboard.
    *   2. Recommendation: *"Turn on Fans IMMEDIATELY to lower humidity."*

### **A.2 "Watering Lockout" (Prevention Mode)**
If the air is already too wet, adding water is dangerous.
*   **Trigger:** `Humidity > 75%` **OR** `Tray Weight == HEAVY`.
*   **System Action:**
    *   **"⛔ SKIP WATERING"** (Blue Card turns Red/Stop).
    *   **Reason:** "Humidity is high. Transpiration has stopped. Roots cannot drink."

### **B. "Metabolic Lockout" (Nutrient Blockage)**
Plants stop eating if conditions are wrong, even if food is present.
*   **Trigger Condition:**
    *   `pH > 6.5` (Too Alkaline) **OR** `pH < 5.5` (Too Acidic).
*   **Scientific Consequence:**
    *   **Iron (Fe) Lockout:** Leaves turn yellow (Chlorosis).
    *   **Calcium (Ca) Lockout:** Tips of leaves burn (Tip Burn).

### **C. "Blackout Violation" (Light Stress)**
*   **Trigger:** If `Day < 3` (Blackout Phase) **AND** `Light_Hours > 0`.
*   **Alert:** *"🚨 CRITICAL: Seeds need TOTAL DARKNESS. You exposed them to light!"*
*   **Consequence:** Stunted roots, "Leggy" (tall/weak) stems.

---

## 4. 🚦 Operations & Workflow Alerts
The system manages not just biology, but the **Human Workflow** to prevent errors.

### **A. "Flip Day" Alert (Crucial Step)**
*   **Logic:** `getMicrogreensAction(batchAge)`
*   **Trigger:** Exactly at **Day 4**.
*   **Priority:** `CRITICAL`
*   **Alert:** *"Remove Weights & Flip Tray"*
*   **Why?** If you leave weights too long (Day 5+), the stems will crush and rot. If you remove too early (Day 2), roots won't be strong enough. **Day 4 is the mathematically optimal Flip Day.**

### **B. "Gap Detected" (Log Catch-up)**
*   **Logic:** `useMicrogreens.js` scans log history.
*   **Trigger:** If `Last_Log_Date` is not `Today`.
*   **Alert:** *"Gap Detected: Catch-up Mode"* + Flashing Red Badge.
*   **Action:** System auto-fetches Historical Weather from `weatherService` to "backfill" missing GDD data.

---

## 5. 🌡️ Biophysical Thresholds (Crop Specific)
Different seeds have different DNA. The system pulls these limits from `agriUtils.js`.

| Crop | Ideal pH | Ideal EC (Strength) | Ideal Temp | Sensitivity |
| :--- | :--- | :--- | :--- | :--- |
| **Radish** | 5.5 - 6.5 | 1.2 - 1.8 mS | 18-24°C | Low (Easy) |
| **Sunflower** | 6.0 - 7.5 | 1.2 - 1.8 mS | 20-24°C | **High (Fungus Risk)** |
| **Peas** | 6.0 - 7.0 | 1.2 - 1.8 mS | 15-20°C | Low (Cold Lover) |
| **Amaranth** | 6.0 - 7.5 | 1.5 - 2.5 mS | 20-28°C | **High (Needs Heat)** |

---

## 6. 📉 Health Score Math (`ActiveCropHealth`)
The **"Crop Health"** score (0-100%) is calculated using aggressive penalties.

### **The Formula:**
`Score = 100 - (pH_Penalty) - (EC_Penalty) - (Temp_Penalty)`

*   **Penalty Logic:** `Penalty = Deviation * Weight_Factor`
    *   **pH Factor:** `Deviation * 20` (Very Strict! 1.0 pH off = -20 points).
    *   **EC Factor:** `Deviation * 15` (Strict).
    *   **Temp Factor:** `Deviation * 3` (Forgiving).

---

## 7. 🚜 Harvest Prediction Engine (GDD)
We do not use "Calendar Days" because plants don't own calendars. They grow by **Heat Energy**.

### **The GDD Algorithm (Growing Degree Days)**
*   **Formula:** `Daily_GDD = ((Max_Temp + Min_Temp) / 2) - Base_Temp`
*   **Base Temp:**
    *   **4°C** for Cool Crops (Radish, Peas, Broccoli).
    *   **10°C** for Warm Crops (Amaranth, Sunflower).

### **Example (Amaranth - Warm Crop):**
*   **Scenario (20°C avg):**
    *   *Wrong (Old Fix):* `(20 - 4) = 16 GDD` (Too Fast).
    *   *Correct (New Logic):* `(20 - 10) = 10 GDD` (Accurate).
    *   **Result:** System correctly predicts slower growth in mild weather.

**System Output:** The Dashboard calculates this *every day* to give you the precise "Ready to Harvest" date.

### **Harvest Prep (Dry Harvest)**
1 day prior to the predicted harvest date, the system triggers **"Dry Mode"**.
*   **Advice:** "🛑 STOP WATERING (Dry Harvest Prep)"
*   **Why?** Wet microgreens rot in the package. Dry plants stay fresh for 10+ days.
