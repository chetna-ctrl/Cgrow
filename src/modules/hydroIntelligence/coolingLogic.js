/**
 * Cooling Efficiency Intelligence
 * Tracks how well the system is fighting ambient heat.
 * 
 * @module coolingLogic
 */

/**
 * Calculate Cooling Efficiency Index
 * @param {number} airTempC - Ambient Air Temp
 * @param {number} waterTempC - Reservoir Water Temp
 * @returns {Object} 
 */
export function calculateCoolingEfficiency(airTempC, waterTempC) {
    const delta = airTempC - waterTempC; // Positive means Water is cooler (Good)

    // Efficiency Levels
    // >10C delta = Excellent (Chiller Active)
    // 5-10C delta = Good (Evaporative Cooling / Fan)
    // <2C delta = Poor (Water is absorbing heat)
    // Negative = CRITICAL (Water is hotter than air - Heater stuck?)

    let status = 'POOR';
    let color = 'red';

    if (delta > 8) {
        status = 'EXCELLENT';
        color = 'emerald';
    } else if (delta > 4) {
        status = 'GOOD';
        color = 'blue';
    } else if (delta < 0) {
        status = 'CRITICAL_HEAT_SOAK';
        color = 'purple'; // Water is acting as a heat sink
    }

    return {
        delta: delta.toFixed(1),
        status,
        color,
        message: delta < 3 ? '⚠️ Cooling Inefficient. Check Chiller/Fan.' : '✅ Cooling System Active.'
    };
}
