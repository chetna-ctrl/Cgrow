/**
 * Utility: getTrendBasedDefaults
 * Learns from user's historical data to suggest intelligent defaults
 * Phase 2: Intelligence Enhancement
 */

import { getCropParams, CROP_THRESHOLDS } from './agriUtils';

/**
 * Get crop optimal values (fallback for no history)
 */
export const getCropOptimalValues = (crop) => {
    const params = getCropParams(crop);
    const thresholds = CROP_THRESHOLDS[crop] || CROP_THRESHOLDS['Lettuce'];

    return {
        ph: (thresholds.ph[0] + thresholds.ph[1]) / 2,
        ec: (thresholds.ec[0] + thresholds.ec[1]) / 2,
        temp: (thresholds.temp[0] + thresholds.temp[1]) / 2,
        base_temp: params.base_temp
    };
};

/**
 * Get trend-based defaults from user's historical logs
 * Falls back to crop optimal values if insufficient data
 */
export const getTrendBasedDefaults = (recentLogs, crop) => {
    // Need at least 3 logs to establish a trend
    if (!recentLogs || recentLogs.length < 3) {
        return getCropOptimalValues(crop);
    }

    // Filter logs for the specific crop if possible
    const cropLogs = recentLogs.filter(log =>
        log.crop === crop || !log.crop // Include generic logs
    );

    const logsToAnalyze = cropLogs.length >= 3 ? cropLogs : recentLogs;
    const last7Days = logsToAnalyze.slice(0, 7);

    // Calculate averages
    const validPHLogs = last7Days.filter(log => log.ph && log.ph > 0);
    const validECLogs = last7Days.filter(log => log.ec && log.ec > 0);
    const validTempLogs = last7Days.filter(log => log.temp && log.temp > 0);

    const avgPH = validPHLogs.length > 0
        ? validPHLogs.reduce((sum, log) => sum + log.ph, 0) / validPHLogs.length
        : null;
    const avgEC = validECLogs.length > 0
        ? validECLogs.reduce((sum, log) => sum + log.ec, 0) / validECLogs.length
        : null;
    const avgTemp = validTempLogs.length > 0
        ? validTempLogs.reduce((sum, log) => sum + log.temp, 0) / validTempLogs.length
        : null;

    // Validate against crop thresholds
    const thresholds = CROP_THRESHOLDS[crop] || CROP_THRESHOLDS['Lettuce'];
    const optimal = getCropOptimalValues(crop);

    const isValidPH = avgPH && avgPH >= thresholds.ph[0] && avgPH <= thresholds.ph[1];
    const isValidEC = avgEC && avgEC >= thresholds.ec[0] && avgEC <= thresholds.ec[1];
    const isValidTemp = avgTemp && avgTemp >= thresholds.temp[0] && avgTemp <= thresholds.temp[1];

    return {
        ph: isValidPH ? parseFloat(avgPH.toFixed(1)) : optimal.ph,
        ec: isValidEC ? parseFloat(avgEC.toFixed(1)) : optimal.ec,
        temp: isValidTemp ? parseFloat(avgTemp.toFixed(1)) : optimal.temp,
        base_temp: optimal.base_temp,
        // Metadata for debugging
        _source: {
            ph: isValidPH ? 'learned' : 'default',
            ec: isValidEC ? 'learned' : 'default',
            temp: isValidTemp ? 'learned' : 'default',
            logsAnalyzed: last7Days.length
        }
    };
};

/**
 * Calculate estimated health drop based on data gap
 */
export const calculateHealthDecay = (daysMissed, lastKnownHealth = 100) => {
    // Base decay: 5% per day
    const baseDecay = daysMissed * 5;

    // Accelerating decay after 3 days (uncertainty compounds)
    const acceleratedDecay = daysMissed > 3 ? (daysMissed - 3) * 3 : 0;

    const totalDecay = baseDecay + acceleratedDecay;
    const newHealth = Math.max(lastKnownHealth - totalDecay, 0);

    return {
        newHealth: Math.round(newHealth),
        decayAmount: Math.round(totalDecay),
        uncertaintyLevel: daysMissed > 7 ? 'HIGH' : daysMissed > 3 ? 'MEDIUM' : 'LOW'
    };
};
