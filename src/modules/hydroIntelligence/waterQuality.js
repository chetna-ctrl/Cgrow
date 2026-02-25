/**
 * Hydro Water Quality & Bio-Chemistry Engine
 * Analysis logic for Dissolved Oxygen, Algae risks, and Ionic Balance.
 * 
 * @module waterQuality
 */

/**
 * 1. Oxygen Solubility Index
 * Returns max possible DO at current temperature (Henry's Law approximation).
 * 
 * @param {number} tempC 
 * @returns {number} ppm or mg/L
 */
export function calculateOxygenSolubility(tempC) {
    // Polynomial approximation for freshwater at 1 atm
    return parseFloat((14.652 - 0.41022 * tempC + 0.007991 * Math.pow(tempC, 2) - 0.000077774 * Math.pow(tempC, 3)).toFixed(2));
}

/**
 * 2. Nutrient "Dead Zone" Detector
 * Compares Inflow vs Outflow EC to find stagnant channels.
 * 
 * @param {number} inflowEC 
 * @param {number} outflowEC 
 * @returns {Object|null}
 */
export function detectDeadZones(inflowEC, outflowEC) {
    if (!inflowEC || !outflowEC) return null;

    const diff = Math.abs(inflowEC - outflowEC);

    // If Outflow EC is significantly LOWER, plants are eating faster than replenishment (Flow too slow)
    // If Outflow EC is HIGHER, water is evaporating or salts accumulating (Stagnation)

    if (diff > 0.3) {
        const isDepletion = outflowEC < inflowEC;
        return {
            status: 'DEAD_ZONE',
            severity: isDepletion ? 'MEDIUM' : 'HIGH',
            message: isDepletion
                ? 'Nutrient Depletion: Flow too slow, plants consuming all nutrients before end of channel.'
                : 'Saline Stagnation: Evaporation concentration detected. Increase flow.',
            diff: diff.toFixed(2)
        };
    }
    return null;
}

/**
 * 3. Algae & Bio-film Risk Meter
 * Predicts biological growth potential based on environment.
 * 
 * @param {number} lightLux - Light hitting the water surface (should be 0)
 * @param {number} humidity 
 * @param {number} waterTemp 
 * @returns {Object} { riskScore: 0-100, level: 'LOW'|'MED'|'HIGH' }
 */
export function calculateAlgaeRisk(lightLux, humidity, waterTemp) {
    let riskScore = 0;

    // FACTOR A: Light (The Fuel)
    // Algae needs very little light, even 500 lux is ample
    if (lightLux > 100) riskScore += 50;
    else if (lightLux > 0) riskScore += 20;

    // FACTOR B: Temperature (The Catalyst)
    // 20-30C is algae heaven
    if (waterTemp > 20 && waterTemp < 30) riskScore += 30;
    else if (waterTemp >= 30) riskScore += 40; // Bloom conditions

    // FACTOR C: Humidity (Spreading)
    if (humidity > 70) riskScore += 10;

    let level = 'LOW';
    if (riskScore > 70) level = 'HIGH';
    else if (riskScore > 40) level = 'MEDIUM';

    return {
        riskScore,
        level,
        advice: level === 'HIGH' ? 'Ensure reservoir is LIGHT-TIGHT. Cover all gaps.' : 'Monitor conditions.'
    };
}

/**
 * 4. Batch-wise pH Drift Analysis
 * Detects the "Death Drop" signature of Root Rot.
 * 
 * @param {Array<number>} phHistory - Last 5 days of pH readings (oldest to newest)
 * @returns {Object|null}
 */
export function detectPHDrift(phHistory) {
    if (!phHistory || phHistory.length < 3) return null;

    // Check for rapid drop trend
    // Healthy drop: Slow acid consumption (Nitrogen uptake)
    // Rot drop: Dying roots release organic acids -> Rapid pH crash

    const latest = phHistory[phHistory.length - 1];
    const prev = phHistory[phHistory.length - 2];

    const dropRate = prev - latest; // Positive if dropping

    if (dropRate > 0.5) {
        return {
            type: 'ROOT_ROT_SIGNATURE',
            severity: 'CRITICAL',
            message: `Rapid pH Drop detected (-${dropRate.toFixed(1)}/day). Check roots for brown slime/smell immediately.`
        };
    }

    return null;
}

/**
 * 5. Automatic Solution Refresh Reminder
 * Track salt accumulation.
 * 
 * @param {number} currentTDS 
 * @param {number} startTDS 
 * @returns {Object}
 */
export function checkWaterChangeNeeded(currentTDS, startTDS) {
    // If TDS has doubled from the starter solution, it's mostly "junk salts" (Sodium/Chloride)
    // that plants didn't eat.

    const ratio = currentTDS / (startTDS || 500); // Default start 500 if unknown

    if (ratio >= 2.0) {
        return {
            action: 'FULL_WATER_CHANGE',
            reason: 'Total Dissolved Solids doubled. Ionic balance likely compromised.'
        };
    }
    return { action: 'TOP_UP', reason: 'Ionic balance acceptable.' };
}
