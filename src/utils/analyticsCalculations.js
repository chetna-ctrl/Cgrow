/**
 * Analytics Calculations for Dependent Variables
 * Scientific basis: Agronomic research on growth patterns and disease modeling
 */

/**
 * Calculate Growth Rate (cm/day)
 * @param {Array} measurements - [{date, height_cm}]
 * @returns {number} Average growth rate in cm/day
 */
export const calculateGrowthRate = (measurements) => {
    if (!measurements || measurements.length < 2) return 0;

    // Sort by date
    const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));

    let totalRate = 0;
    let count = 0;

    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        const heightDiff = curr.height_cm - prev.height_cm;
        const daysDiff = Math.max(1, Math.floor((new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24)));

        if (daysDiff > 0 && heightDiff > 0) {
            totalRate += heightDiff / daysDiff;
            count++;
        }
    }

    return count > 0 ? totalRate / count : 0;
};

/**
 * Calculate Disease Risk Score (0-100)
 * Based on temperature, humidity, and ventilation
 * Scientific basis: Fungal disease models (Fusarium, Pythium)
 * 
 * @param {number} humidity - Percentage (0-100)
 * @param {number} temperature - Celsius
 * @param {number} ventilation - Hours per day (0-24)
 * @returns {Object} {score, level, recommendations}
 */
export const calculateDiseaseRisk = (humidity, temperature, ventilation = 2) => {
    let score = 0;

    // Humidity factor (most critical)
    if (humidity > 80) score += 50;
    else if (humidity > 70) score += 35;
    else if (humidity > 60) score += 20;
    else if (humidity < 40) score += 10; // Too dry also stresses plants

    // Temperature factor
    if (temperature > 28) score += 25; // Hot + humid = disease heaven
    else if (temperature < 15) score += 15; // Cold stress

    // Ventilation factor (reduces risk)
    if (ventilation < 1) score += 15; // No airflow
    else if (ventilation > 4) score -= 10; // Good airflow reduces risk

    // Cap at 0-100
    score = Math.max(0, Math.min(100, score));

    let level = 'Low';
    let recommendations = [];

    if (score < 30) {
        level = 'Low';
        recommendations.push('✅ Conditions are good. Maintain current practices.');
    } else if (score < 60) {
        level = 'Medium';
        recommendations.push('⚠️ Monitor closely. Consider increasing ventilation.');
        if (humidity > 65) recommendations.push('Reduce humidity to <60%.');
    } else {
        level = 'High';
        recommendations.push('🔴 HIGH RISK! Take action immediately.');
        if (humidity > 70) recommendations.push('Critical: Reduce humidity to <60%.');
        if (temperature > 26) recommendations.push('Cool down grow area to <25°C.');
        recommendations.push('Increase ventilation to 4+ hours/day.');
        recommendations.push('Inspect for early signs of mold/rot.');
    }

    return {
        score: Math.round(score),
        level,
        recommendations,
        factors: {
            humidity: humidity > 65 ? 'High Risk' : 'OK',
            temperature: (temperature < 15 || temperature > 28) ? 'Stress' : 'OK',
            ventilation: ventilation < 2 ? 'Poor' : 'OK'
        }
    };
};

/**
 * Calculate Root Health Score (0-100)
 * Based on dissolved oxygen, water temperature, and EC
 * 
 * @param {number} dissolvedOxygen - mg/L
 * @param {number} waterTemp - Celsius
 * @param {number} ec - mS/cm
 * @returns {Object} {score, status, color, recommendations}
 */
export const calculateRootHealthScore = (dissolvedOxygen, waterTemp, ec) => {
    let score = 100;
    const issues = [];

    // Dissolved Oxygen (most critical)
    if (dissolvedOxygen < 5) {
        score -= 40;
        issues.push('Critical: DO < 5 mg/L - roots suffocating');
    } else if (dissolvedOxygen < 6) {
        score -= 20;
        issues.push('Low DO - add airstones or chill water');
    } else if (dissolvedOxygen >= 8) {
        // Optimal
    } else {
        score -= 10;
    }

    // Water Temperature
    if (waterTemp > 26) {
        score -= 30;
        issues.push('Water temp > 26°C - root rot risk');
    } else if (waterTemp > 24) {
        score -= 15;
        issues.push('Water temp slightly high');
    } else if (waterTemp < 18) {
        score -= 15;
        issues.push('Water temp too cold - slow growth');
    }

    // EC (nutrient burn on roots)
    if (ec > 2.5) {
        score -= 20;
        issues.push('EC too high - nutrient burn risk');
    } else if (ec < 0.8) {
        score -= 10;
        issues.push('EC low - roots not getting enough nutrients');
    }

    score = Math.max(0, Math.min(100, score));

    let status, color;
    if (score >= 80) {
        status = 'Healthy';
        color = 'green';
    } else if (score >= 60) {
        status = 'Fair';
        color = 'amber';
    } else {
        status = 'Poor';
        color = 'red';
    }

    return {
        score: Math.round(score),
        status,
        color,
        issues,
        recommendations: issues.length > 0 ? issues : ['✅ Roots are healthy!']
    };
};

/**
 * Calculate Leaf Size Predictor (cm²)
 * Based on nitrogen availability and light intensity
 * 
 * @param {string} npkRatio - Format "N-P-K"
 * @param {number} lightPPFD - μmol/m²/s
 * @param {number} daysGrowing - Days since planting
 * @returns {number} Estimated leaf area in cm²
 */
export const predictLeafSize = (npkRatio, lightPPFD, daysGrowing) => {
    // Parse N value
    const nitrogen = npkRatio ? parseInt(npkRatio.split('-')[0]) : 5;

    // Base growth: 2 cm²/day for leafy greens
    let baseGrowth = 2 * daysGrowing;

    // Nitrogen factor (higher N = bigger leaves)
    const nFactor = nitrogen >= 10 ? 1.3 : nitrogen >= 5 ? 1.0 : 0.7;

    // Light factor (more light = more photosynthesis)
    const lightFactor = lightPPFD >= 300 ? 1.2 : lightPPFD >= 200 ? 1.0 : 0.8;

    return Math.round(baseGrowth * nFactor * lightFactor);
};

/**
 * Calculate Germination Rate Predictor (%)
 * Based on seed quality, moisture, and temperature
 * 
 * @param {number} temperature - Celsius
 * @param {number} moisture - Percentage (0-100)
 * @param {string} seedAge - 'fresh', 'good', 'old'
 * @returns {Object} {rate, rating}
 */
export const predictGerminationRate = (temperature, moisture, seedAge = 'good') => {
    let rate = 85; // Base rate

    // Temperature factor
    if (temperature >= 20 && temperature <= 25) {
        rate += 10; // Optimal
    } else if (temperature < 15 || temperature > 30) {
        rate -= 30;
    } else {
        rate -= 10;
    }

    // Moisture factor
    if (moisture >= 50 && moisture <= 70) {
        rate += 5; // Optimal
    } else if (moisture < 30 || moisture > 80) {
        rate -= 20;
    }

    // Seed age factor
    if (seedAge === 'fresh') rate += 10;
    else if (seedAge === 'old') rate -= 20;

    rate = Math.max(30, Math.min(98, rate));

    let rating;
    if (rate >= 85) rating = 'Excellent';
    else if (rate >= 70) rating = 'Good';
    else if (rate >= 50) rating = 'Fair';
    else rating = 'Poor';

    return {
        rate: Math.round(rate),
        rating
    };
};

/**
 * Trend Analysis for Stability
 * Calculates stability score and variance
 * 
 * @param {Array<number>} values - Historical values
 * @param {number} targetMin - Minimum optimal value
 * @param {number} targetMax - Maximum optimal value
 * @returns {Object} {stability, variance, inRange}
 */
export const analyzeTrend = (values, targetMin, targetMax) => {
    if (!values || values.length < 3) {
        return { stability: 0, variance: 0, inRange: 0, trend: 'Insufficient data' };
    }

    // Calculate variance
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;

    // Count values in range
    const inRange = values.filter(v => v >= targetMin && v <= targetMax).length;
    const percentInRange = (inRange / values.length) * 100;

    // Stability score (0-100)
    // Low variance + high % in range = high stability
    const varianceFactor = Math.max(0, 100 - (variance * 10));
    const stability = (varianceFactor * 0.4) + (percentInRange * 0.6);

    // Trend direction
    const recent = values.slice(-3);
    const trend = recent[2] > recent[0] ? 'Rising' : recent[2] < recent[0] ? 'Falling' : 'Stable';

    return {
        stability: Math.round(stability),
        variance: variance.toFixed(2),
        inRange: Math.round(percentInRange),
        trend,
        mean: mean.toFixed(2)
    };
};
