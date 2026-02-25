/**
 * Trend Analysis Engine
 * Detects direction and velocity of sensor changes over time.
 * Crucial for predicting "Drift" (e.g., pH slowly dropping = Root Rot).
 * 
 * @module TrendAnalysisEngine
 */

/**
 * Analyze trends from recent logs.
 * @param {Array} logs - Array of log objects (must be sorted newest first)
 * @param {string} metric - 'ph', 'ec', 'temp', 'humidity'
 * @returns {Object} { direction: 'STABLE'|'RISING'|'FALLING', velocity: number, isDrifting: boolean }
 */
export function analyzeTrend(logs, metric) {
    if (!logs || logs.length < 3) return { direction: 'STABLE', velocity: 0, isDrifting: false };

    // Get last 3 valid readings
    const validLogs = logs.filter(l => l[metric] != null).slice(0, 3);
    if (validLogs.length < 2) return { direction: 'STABLE', velocity: 0, isDrifting: false };

    const current = parseFloat(validLogs[0][metric]);
    const prev = parseFloat(validLogs[1][metric]);

    // Calculate Velocity (Change per entry - usually per day)
    const velocity = parseFloat((current - prev).toFixed(2));
    const absVelocity = Math.abs(velocity);

    // Thresholds for "Drift" vs "Noise"
    const thresholds = {
        ph: 0.2,   // 0.2 pH shift is significant
        ec: 0.1,   // 0.1 EC shift
        temp: 2.0, // 2C shift
        humidity: 5 // 5% shift
    };

    const threshold = thresholds[metric] || 0.1;

    let direction = 'STABLE';
    if (velocity > threshold) direction = 'RISING';
    if (velocity < -threshold) direction = 'FALLING';

    return {
        direction,
        velocity, // Positive = Rising, Negative = Falling
        isDrifting: absVelocity >= threshold
    };
}

/**
 * Get visual Arrow indicator for trend
 * @param {Object} trendResult 
 */
export function getTrendIcon(trendResult) {
    if (trendResult.direction === 'RISING') return '↗️';
    if (trendResult.direction === 'FALLING') return '↘️';
    return '➡️';
}

/**
 * Calculate Health Decay (Stress Memory)
 * Estimates how "tired" the plants are based on recent history.
 * @param {Array} logs 
 */
export function calculateHealthDecay(logs) {
    if (!logs || logs.length === 0) return 0;

    let stressDays = 0;
    // Check last 7 logs
    logs.slice(0, 7).forEach(log => {
        // Did health drop below 70?
        if (log.health_score && log.health_score < 70) {
            stressDays++;
        }
    });

    return stressDays * 2; // 2% decay per stress day
}
