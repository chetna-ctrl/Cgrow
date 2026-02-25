# 🧠 Agri-OS: The Agronomy Logic Core & Algorithms
*Comprehensive documentation of the scientific formulas, heuristic engines, and decision logic powering cGrow.*

---

## 1. 🏥 The Health Meter Engine (`calculateFarmHealth`)

The **Health Meter** is the heart of the dashboard. It does not just average numbers; it simulates a "Medical Checkup" for the farm. It starts at a score of **100** and deducts points based on verified risks.

### **The Formula (Simplified):**
$$ Score = 100 - (\text{Light Penalt y}) - (\text{VPD Penalty}) - (\text{Nutrient Penalty}) - (\text{Temp Penalty}) $$

### **Code Logic (`src/utils/agriUtils.js`):**

```javascript
export function calculateFarmHealth(logs, batchAge, sourceType, cropName) {
    let score = 100;
    const reasons = [];

    // 1. LIGHTING CHECK (Weighted: 30%)
    const lightStatus = checkLightingCompliance(logs, batchAge, sourceType);
    if (lightStatus === 'DANGER') score -= 30; // Critical failure (e.g., Light during Blackout)
    else if (lightStatus === 'WARN') score -= 10;

    // 2. VPD / AIR CHECK (Weighted: 30%)
    const vpdRes = calculateVPD(logs.temp, logs.humidity);
    if (vpdRes.status.includes('DANGER')) score -= 30; // Stomata closed / Fungal risk
    else if (vpdRes.status.includes('CAUTION')) score -= 10;

    // 3. NUTRIENT CHECK (Weighted: 40%)
    // pH & EC Logic
    if (logs.ph > 6.5) score -= 40; // High pH locks out Iron/Zinc
    if (logs.ec > 2.5) score -= 40; // Salt stress

    // System Specific Checks
    if (logs.systemSubType === 'NFT' && logs.pump_status === 'OFF') {
        score -= 60; // CRITICAL: Roots dry out in <2 hours in NFT
    }
    
    // CAP SCORE: If any critical danger exists, max score is 70
    if (reasons.some(r => r.includes('CRITICAL') || r.includes('DANGER'))) {
        score = Math.min(score, 70);
    }

    return { score, reasons };
}
```

---

## 2. 💧 Hydroponics & Biophysics Algorithms

### **A. Vapor Pressure Deficit (VPD) Engine**
VPD is the unified metric for "Air Comfort". It determines if plants can transpire (sweat) effectively.

*   **Formula:** $VPD = SVP \times (1 - \frac{RH}{100})$
*   **SVP (Saturation Vapor Pressure):** Calculated using the **Tetens Formula**:
    $$ 0.61078 \times e^{\frac{17.27 \times T}{T + 237.3}} $$

**Logic (`calculateVPD`):**
*   **< 0.4 kPa (Danger):** Air too humid. Transpiration stops. **Tip Burn Risk.**
*   **0.8 - 1.2 kPa (Optimal):** "The Goldilocks Zone". Peak photosynthesis.
*   **> 1.6 kPa (Danger):** Air too dry. Stomata close to save water. Growth stops.

### **B. The "Nutrient Doctor" (Antagonism Engine)**
We check for **Ionic Antagonism** (Mulder's Chart). Simply adding nutrients isn't enough; they must be balanced.

**Logic (`analyzeNutrientHealth`):**
1.  **K-Ca Lockout:** If Potassium > 300ppm, it blocks Calcium. *Symptom: Tip Burn.*
2.  **pH Lockout:**
    *   pH > 6.5: Iron (Fe) precipitates (turns to rust solid). Roots can't drink it. *Symptom: Yellow leaves.*
    *   pH < 5.5: Manganese (Mn) becomes toxic.
3.  **Root Rot Risk:** If Water Temp > 25°C **AND** DO < 6mg/L. *Diagnosis: Deadly Crossover.*

---

## 3. 📈 Predictive Agronomy (GDD & Harvest)

### **A. Growing Degree Days (GDD)**
We don't guess harvest dates by calendar days. We use **Thermal Time**.

*   **Formula:** $GDD = \frac{T_{max} + T_{min}}{2} - T_{base}$
*   **$T_{base}$:** 4°C for Cool crops (Lettuce), 10°C for Warm crops (Basil).

**Dynamic Code (`calculateDailyGDD`):**
```javascript
export const calculateDailyGDD = (tMax, tMin, cropName) => {
    // 1. Get Crop Base Temp (Bio-parameter)
    const { base_temp } = getCropParams(cropName); 
    
    // 2. Calculate Thermal Units
    const avgTemp = (tMax + tMin) / 2;
    let gdd = avgTemp - base_temp;
    
    return Math.max(0, gdd); // Negative GDD usually treated as 0
};
```

### **B. Yield Prediction**
Predicts grams per plant based on deviations from ideal conditions.

**Logic (`predictYield`):**
*   Start at **100% Potential**.
*   **-15%** for every 0.5 deviation in pH.
*   **-35%** for high temperature stress (>10°C deviation).
*   **-25%** for Nitrogen deficiency.

---

## 4. 🌱 Smart Advice Engine (Heuristic)

This engine acts as a "Digital Agronomist," giving daily tasks based on batch age.

**Logic (`getDailyTaskAdvice`):**
*   **Blackout Phase (Days 0-3):**
    *   *Action:* "Cover with humidity dome + weight."
    *   *Alert:* If light detected -> "CRITICAL: Stop light!"
*   **Pre-Harvest (Harvest - 1 Day):**
    *   *Action:* "Stop Water." (Using 'Dry Back' technique to increase shelf life/flavor).
*   **The "Burp" Check:**
    *   If Light > 4 hours AND Fans = OFF -> "Open vents for CO2 replenishment."

---

## 5. 🚜 Operational Algorithms (`agronomyAlgorithms.js`)

### **A. Irrigation Scheduler**
Calculates water needs based on physics, not just a timer.

*   **Logic:**
    *   Base: Crop water need (e.g., Lettuce = High).
    *   **x 1.5** if Temp > 35°C.
    *   **x 1.4** if Soil Retention = Poor.
    *   *Result:* "Frequency: Every 2 Days | Method: Drip"

### **B. Disease Risk Predictor**
Predicts outbreaks before symptoms appear using environmental patterns.

*   **Fungal (Blight/Mildew):** High Humidity (>70%) + Moderate Temp (20-30°C).
*   **Bacterial Wilt:** High Temp (>30°C) + High Humidity.
*   **Pests (Mites):** High Temp + Low Humidity (Dry).

---

## 6. 📊 Database Schema for AI (`daily_logs`)

To make this logic trainable for future ML models, we derive these metrics during saving:

1.  `vpd_kpa`: Pre-calculated air pressure deficit.
2.  `gdd_daily`: Thermal time units added that day.
3.  `health_score`: The daily 0-100 checkup score.
4.  `stress_hours`: Hours spent outside optimal zones.

*This documentation covers the active logic verified in `v1.5-MOBILE-STABLE`.*
