/**
 * Smoothing & Signal Processing Engine
 * Filters noise from low-cost analog sensors (Arduino/ESP32).
 * 
 * @module smoothingUtils
 */

/**
 * Calculate Median to reject outliers/noise spikes.
 * @param {Array<number>} readings - Array of 5-10 recent readings
 * @returns {number} Median value
 */
export function calculateMedian(readings) {
    if (!readings || readings.length === 0) return 0;
    const sorted = [...readings].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Detect Sensor Drift & Assign Confidence Score
 * @param {number} currentVal 
 * @param {number} historicalAvg 
 * @param {string} sensorType - 'ph' | 'ec'
 * @returns {Object} { score: 0-100, isDrifting: boolean }
 */
export function validateSensorConfidence(currentVal, historicalAvg, sensorType) {
    let score = 100;
    const diff = Math.abs(currentVal - historicalAvg);

    // pH Physical Limits: pH cannot jump 1.0 in 10 mins without acid injection
    if (sensorType === 'ph') {
        if (diff > 1.5) score = 20; // Impossible jump -> Likely Electrical Noise
        else if (diff > 0.5) score = 60; // Suspicious
    }

    // EC Limits
    if (sensorType === 'ec') {
        if (diff > 1.0) score = 30; // Huge salinity spike -> Probe dry?
    }

    return {
        score,
        isDrifting: score < 50
    };
}
