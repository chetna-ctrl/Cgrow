// src/utils/agronomyLogic.js
// Advanced agronomy calculations and gamification logic

/**
 * Calculates Vapor Pressure Deficit (VPD) in kPa
 * The "Secret Sauce" for professional growth.
 * 
 * Scientific Formula: VPD = SVP - AVP
 * Where SVP = 0.61078 * e^((17.27 * T) / (T + 237.3))
 * 
 * Target Ranges:
 * - Vegetative: 0.8 - 1.2 kPa
 * - Flowering: 1.2 - 1.6 kPa
 * 
 * @param {number} tempC - Temperature in Celsius
 * @param {number} humidity - Relative Humidity (0-100)
 * @returns {number|null} VPD in kPa, or null if inputs invalid
 */
export const calculateVPD = (tempC, humidity) => {
    if (tempC === null || tempC === undefined || humidity === null || humidity === undefined) {
        return null;
    }

    const temp = parseFloat(tempC);
    const rh = parseFloat(humidity);

    if (isNaN(temp) || isNaN(rh)) return null;

    // 1. Calculate Saturation Vapor Pressure (SVP) using Tetens formula
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));

    // 2. Calculate Actual Vapor Pressure (AVP)
    const avp = svp * (rh / 100);

    // 3. VPD = SVP - AVP
    const vpd = svp - avp;

    return parseFloat(vpd.toFixed(2));
};

/**
 * Get VPD status with color coding and recommendations
 * @param {number} vpd - VPD value in kPa
 * @returns {Object} Status object with color, label, and recommendation
 */
export const getVpdStatus = (vpd) => {
    if (!vpd && vpd !== 0) {
        return {
            color: 'slate',
            label: 'Unknown',
            recommendation: 'Enter temperature and humidity to calculate VPD',
            icon: '❓'
        };
    }

    if (vpd < 0.4) {
        return {
            color: 'blue',
            label: 'Too Humid',
            recommendation: '⚠️ Risk of mold! Increase airflow and reduce humidity.',
            icon: '💧'
        };
    }

    if (vpd >= 0.4 && vpd < 0.8) {
        return {
            color: 'cyan',
            label: 'Low (Seedlings)',
            recommendation: 'Good for seedlings/clones. Increase temp or lower humidity for veg.',
            icon: '🌱'
        };
    }

    if (vpd >= 0.8 && vpd <= 1.2) {
        return {
            color: 'green',
            label: 'Perfect (Veg)',
            recommendation: '✅ Optimal range for vegetative growth! Keep it here.',
            icon: '🌿'
        };
    }

    if (vpd > 1.2 && vpd <= 1.6) {
        return {
            color: 'yellow',
            label: 'Good (Flowering)',
            recommendation: 'Optimal for flowering/fruiting. Too high for leafy greens.',
            icon: '🌸'
        };
    }

    if (vpd > 1.6) {
        return {
            color: 'red',
            label: 'Too Dry',
            recommendation: '⚠️ Plants are stressed! Mist plants or increase humidity.',
            icon: '🔥'
        };
    }

    return { color: 'gray', label: 'Unknown', recommendation: '', icon: '❓' };
};

/**
 * Calculates the "Current Streak" of consecutive days with logs
 * @param {Array} logs - Array of log objects with created_at field
 * @returns {number} Number of consecutive days
 */
export const calculateStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;

    // Sort logs by date (newest first)
    const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    // Get unique dates (normalize to date strings)
    const uniqueDates = [...new Set(
        sortedLogs.map(log => {
            const d = new Date(log.created_at);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    )].map(dateStr => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m, d);
    }).sort((a, b) => b - a); // Newest first

    if (uniqueDates.length === 0) return 0;

    // Check if last log was today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogDate = uniqueDates[0];
    lastLogDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastLogDate) / (1000 * 60 * 60 * 24));

    // If last log was more than 1 day ago, streak is broken
    if (diffDays > 1) return 0;

    // Count consecutive days
    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = uniqueDates[i];
        const prev = uniqueDates[i + 1];

        const dayDiff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
            streak++;
        } else {
            break; // Streak broken
        }
    }

    return streak;
};

/**
 * Get streak badge/status based on streak count
 * @param {number} streak - Number of consecutive days
 * @returns {Object} Badge info with emoji, label, and color
 */
export const getStreakBadge = (streak) => {
    if (streak === 0) {
        return { emoji: '💤', label: 'Start Today!', color: 'slate', message: 'Log today to start your streak' };
    }
    if (streak === 1) {
        return { emoji: '🌱', label: 'Day 1', color: 'green', message: 'Great start! Come back tomorrow' };
    }
    if (streak >= 2 && streak <= 6) {
        return { emoji: '🔥', label: `${streak} Day Streak`, color: 'orange', message: 'Keep it going!' };
    }
    if (streak === 7) {
        return { emoji: '⭐', label: 'Week Warrior!', color: 'yellow', message: '1 full week! Amazing!' };
    }
    if (streak >= 8 && streak <= 29) {
        return { emoji: '🔥', label: `${streak} Day Streak`, color: 'orange', message: `Only ${30 - streak} days to Month Master!` };
    }
    if (streak >= 30) {
        return { emoji: '🏆', label: 'Month Master!', color: 'purple', message: `${streak} days - You're a pro!` };
    }
    return { emoji: '🌿', label: `${streak} Days`, color: 'green', message: 'Keep going!' };
};

/**
 * Calculate optimal conditions based on crop type
 * @param {string} cropType - Type of crop
 * @returns {Object} Optimal ranges for pH, EC, temp, humidity, VPD
 */
export const getOptimalConditions = (cropType) => {
    const conditions = {
        'Lettuce': { phMin: 5.5, phMax: 6.5, ecMin: 1.0, ecMax: 1.8, tempMin: 18, tempMax: 24, humMin: 50, humMax: 70, vpdMin: 0.8, vpdMax: 1.2 },
        'Tomato': { phMin: 5.8, phMax: 6.8, ecMin: 2.0, ecMax: 3.5, tempMin: 20, tempMax: 28, humMin: 60, humMax: 80, vpdMin: 1.0, vpdMax: 1.5 },
        'Basil': { phMin: 5.5, phMax: 6.5, ecMin: 1.0, ecMax: 1.6, tempMin: 20, tempMax: 26, humMin: 50, humMax: 60, vpdMin: 0.8, vpdMax: 1.2 },
        'Spinach': { phMin: 6.0, phMax: 7.0, ecMin: 1.8, ecMax: 2.3, tempMin: 15, tempMax: 22, humMin: 50, humMax: 70, vpdMin: 0.8, vpdMax: 1.0 },
        'Microgreens': { phMin: 5.5, phMax: 6.5, ecMin: 1.0, ecMax: 1.5, tempMin: 18, tempMax: 24, humMin: 50, humMax: 70, vpdMin: 0.6, vpdMax: 1.0 },
        'default': { phMin: 5.5, phMax: 6.5, ecMin: 1.0, ecMax: 2.0, tempMin: 18, tempMax: 26, humMin: 50, humMax: 70, vpdMin: 0.8, vpdMax: 1.2 }
    };

    return conditions[cropType] || conditions['default'];
};
