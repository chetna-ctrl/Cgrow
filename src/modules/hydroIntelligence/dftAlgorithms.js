/**
 * DFT (Deep Flow Technique) & Deep Water Culture Intelligence
 * Physical Physics Engines for High-Volume Hydroponic Systems
 * 
 * @module dftAlgorithms
 */

/**
 * 1. Power Failure "Buffer Time" Predictor
 * Calculates how long plants can survive without active circulation/aeration.
 * 
 * @param {number} volumeLiters - Total water volume in the system
 * @param {number} currentTempC - Current water temperature
 * @param {number} plantCount - Number of mature plants
 * @returns {Object} { minutes, status, critical_threshold_steps }
 */
export function calculatePowerFailureBuffer(volumeLiters, currentTempC, plantCount) {
    // BASELINE: Oxygen Saturation at Temp (mg/L)
    // 20C = 9.1, 25C = 8.2, 30C = 7.5
    const maxDO = 14.6 - (0.39 * currentTempC) + (0.0077 * Math.pow(currentTempC, 2)) - (0.00006 * Math.pow(currentTempC, 3));

    // DEMAND: Oxygen Consumption Rate (mg/hour per plant)
    // Metabolic rate doubles every 10C (Q10 effect)
    const baseConsumptionPerPlant = 20; // mg/hr at 20C (Approx independent of size, simplifying)
    const q10Factor = Math.pow(2, (currentTempC - 20) / 10);
    const totalConsumptionRate = plantCount * baseConsumptionPerPlant * q10Factor;

    // CRITICAL LIMIT: When roots suffocate (DO < 2mg/L)
    const criticalDO = 2.0;

    // Available Oxygen Buffer (mg)
    const availableOxygenMg = volumeLiters * (maxDO - criticalDO);

    // Time until Critical (Hours)
    const hoursToCritical = availableOxygenMg / totalConsumptionRate;
    const minutes = Math.max(0, Math.floor(hoursToCritical * 60));

    let status = 'SAFE';
    if (minutes < 60) status = 'CRITICAL';
    else if (minutes < 180) status = 'WARNING'; // < 3 Hours

    return {
        minutesBuffer: minutes,
        status,
        details: {
            currentDOEstimate: parseFloat(maxDO.toFixed(2)),
            consumptionRate: parseFloat(totalConsumptionRate.toFixed(2))
        }
    };
}

/**
 * 2. Temperature Stratification Alert
 * Detects if water is stagnant by comparing surface and bottom temperatures.
 * 
 * @param {number} surfaceTemp - Temp sensor at top
 * @param {number} bottomTemp - Temp sensor at bottom
 * @returns {Object} Alert object or null
 */
export function detectStratification(surfaceTemp, bottomTemp) {
    if (!surfaceTemp || !bottomTemp) return null;

    const delta = Math.abs(surfaceTemp - bottomTemp);

    if (delta > 2.0) {
        return {
            severity: 'HIGH',
            title: 'Thermal Stratification Detected',
            message: `Water is stagnant. Top is ${delta.toFixed(1)}°C warmer than bottom.`,
            action: 'Increase Pump Flow or Aeration to mix layers.'
        };
    }
    return null;
}

/**
 * 3. Unified DFT Risk Score
 * Composite risk index for the unique challenges of Deep Flow.
 * 
 * @param {number} waterLevelPercent - % of reservoir full
 * @param {number} flowRateLPH - Flow rate in Liters/Hour
 * @param {number} volumeLiters - Total system volume
 * @returns {Object} { score: 0-100, risks: [] }
 */
export function calculateDFTRisk(waterLevelPercent, flowRateLPH, volumeLiters) {
    let score = 100;
    const risks = [];

    // 1. Water Level Risk (DFT relies on depth)
    if (waterLevelPercent < 80) {
        score -= 20;
        risks.push({ type: 'LEVEL', msg: 'Water Level Low: Temp fluctuations likely.' });
    }

    // 2. Turnover Rate Risk
    // Rule: Total volume should circulate at least 4 times per hour
    const turnoverRate = flowRateLPH / volumeLiters;
    if (turnoverRate < 2) {
        score -= 30;
        risks.push({ type: 'FLOW', msg: `Low Flow: Turnover is only ${turnoverRate.toFixed(1)}x/hour. Target is 4x.` });
    }

    return { score, risks };
}
