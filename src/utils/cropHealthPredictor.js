/**
 * Crop Health Prediction Algorithm
 * Analyzes daily logs to predict crop health and provide recommendations
 */

export const predictCropHealth = (logs) => {
    if (!logs || logs.length === 0) {
        return {
            score: 0,
            status: 'No Data',
            trend: 'Unknown',
            breakdown: {},
            issues: ['No data available'],
            recommendations: ['Start logging daily measurements']
        };
    }

    // Calculate scores for each parameter
    const phScore = calculatePHScore(logs);
    const ecScore = calculateECScore(logs);
    const tempScore = calculateTempScore(logs);
    const stabilityScore = calculateStabilityScore(logs);

    // Total score (weighted average)
    const totalScore = Math.round(
        phScore.score * 0.3 +
        ecScore.score * 0.3 +
        tempScore.score * 0.2 +
        stabilityScore.score * 0.2
    );

    // Determine status
    const status = getHealthStatus(totalScore);

    // Calculate trend
    const trend = calculateTrend(logs);

    // Generate issues and recommendations
    const issues = [];
    const recommendations = [];

    if (phScore.score < 25) {
        issues.push(`pH ${phScore.avg > 6.5 ? 'too high' : 'too low'} (${phScore.avg.toFixed(1)})`);
        recommendations.push(phScore.avg > 6.5 ? 'Add pH Down solution (0.2L per 10L)' : 'Add pH Up solution (0.1L per 10L)');
    }

    if (ecScore.score < 25) {
        issues.push(`EC ${ecScore.avg > 2.5 ? 'too high' : 'too low'} (${ecScore.avg.toFixed(1)} mS)`);
        recommendations.push(ecScore.avg > 2.5 ? 'Dilute with fresh water' : 'Add nutrient solution');
    }

    if (tempScore.score < 15) {
        issues.push(`Temperature ${tempScore.avg > 28 ? 'too high' : 'too low'} (${tempScore.avg.toFixed(1)}°C)`);
        recommendations.push(tempScore.avg > 28 ? 'Increase ventilation/cooling' : 'Add heating');
    }

    if (stabilityScore.score < 10) {
        issues.push('High parameter fluctuations detected');
        recommendations.push('Monitor more frequently to maintain stability');
    }

    if (issues.length === 0) {
        issues.push('All parameters optimal');
        recommendations.push('Maintain current conditions');
    }

    return {
        score: totalScore,
        status,
        trend,
        breakdown: {
            ph: phScore,
            ec: ecScore,
            temp: tempScore,
            stability: stabilityScore
        },
        issues,
        recommendations,
        lastUpdated: logs[logs.length - 1]?.created_at || new Date().toISOString()
    };
};

// Calculate pH score (0-30 points)
const calculatePHScore = (logs) => {
    const phValues = logs.map(l => parseFloat(l.ph)).filter(v => !isNaN(v));
    if (phValues.length === 0) return { score: 0, status: 'No Data', avg: 0 };

    const avg = phValues.reduce((a, b) => a + b, 0) / phValues.length;

    let score = 0;
    if (avg >= 5.5 && avg <= 6.5) score = 30;
    else if (avg >= 5.0 && avg < 5.5 || avg > 6.5 && avg <= 7.0) score = 20;
    else if (avg >= 4.5 && avg < 5.0 || avg > 7.0 && avg <= 7.5) score = 10;

    return {
        score,
        status: score >= 25 ? 'Excellent' : score >= 15 ? 'Good' : 'Poor',
        avg
    };
};

// Calculate EC score (0-30 points)
const calculateECScore = (logs) => {
    const ecValues = logs.map(l => parseFloat(l.ec)).filter(v => !isNaN(v));
    if (ecValues.length === 0) return { score: 0, status: 'No Data', avg: 0 };

    const avg = ecValues.reduce((a, b) => a + b, 0) / ecValues.length;

    let score = 0;
    if (avg >= 1.2 && avg <= 2.5) score = 30;
    else if (avg >= 0.8 && avg < 1.2 || avg > 2.5 && avg <= 3.0) score = 20;
    else if (avg >= 0.5 && avg < 0.8 || avg > 3.0 && avg <= 3.5) score = 10;

    return {
        score,
        status: score >= 25 ? 'Excellent' : score >= 15 ? 'Good' : 'Poor',
        avg
    };
};

// Calculate Temperature score (0-20 points)
const calculateTempScore = (logs) => {
    const tempValues = logs.map(l => parseFloat(l.temp)).filter(v => !isNaN(v));
    if (tempValues.length === 0) return { score: 0, status: 'No Data', avg: 0 };

    const avg = tempValues.reduce((a, b) => a + b, 0) / tempValues.length;

    let score = 0;
    if (avg >= 18 && avg <= 28) score = 20;
    else if (avg >= 15 && avg < 18 || avg > 28 && avg <= 32) score = 10;
    else if (avg >= 12 && avg < 15 || avg > 32 && avg <= 35) score = 5;

    return {
        score,
        status: score >= 15 ? 'Excellent' : score >= 8 ? 'Good' : 'Poor',
        avg
    };
};

// Calculate Stability score (0-20 points)
const calculateStabilityScore = (logs) => {
    const phValues = logs.map(l => parseFloat(l.ph)).filter(v => !isNaN(v));
    const ecValues = logs.map(l => parseFloat(l.ec)).filter(v => !isNaN(v));

    if (phValues.length < 2 || ecValues.length < 2) {
        return { score: 10, status: 'Insufficient Data' };
    }

    // Calculate variance
    const phVariance = calculateVariance(phValues);
    const ecVariance = calculateVariance(ecValues);

    let score = 0;
    if (phVariance < 0.2 && ecVariance < 0.3) score = 20;
    else if (phVariance < 0.4 && ecVariance < 0.5) score = 10;
    else score = 5;

    return {
        score,
        status: score >= 15 ? 'Stable' : score >= 8 ? 'Fair' : 'Unstable'
    };
};

// Helper: Calculate variance
const calculateVariance = (values) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
};

// Determine health status from score
const getHealthStatus = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Healthy';
    if (score >= 50) return 'Warning';
    return 'Critical';
};

// Calculate trend (Improving/Stable/Declining)
const calculateTrend = (logs) => {
    if (logs.length < 3) return 'Stable';

    // Compare first half vs second half
    const mid = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, mid);
    const secondHalf = logs.slice(mid);

    const firstScore = predictCropHealth(firstHalf).score;
    const secondScore = predictCropHealth(secondHalf).score;

    if (secondScore > firstScore + 5) return 'Improving';
    if (secondScore < firstScore - 5) return 'Declining';
    return 'Stable';
};
