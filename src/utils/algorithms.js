// src/utils/algorithms.js

// 1. Weather Risk Engine
export const checkWeatherRisk = (rainMm) => {
    if (rainMm > 50) return { status: 'Critical', message: 'Heavy Rain Alert. Flood risk high.' };
    if (rainMm > 20) return { status: 'Warning', message: 'Moderate Rain. Monitor drainage.' };
    return { status: 'Safe', message: 'Rainfall within normal limits.' };
};

// 2. Disease Prediction Engine
export const checkDiseaseRisk = (temp, humidity) => {
    // High heat + high humidity = Fungal Risk
    if (humidity > 80 && temp > 28) {
        return { status: 'High', message: 'High Fungal Risk (Blight). Apply fungicide.' };
    }
    if (humidity > 70) {
        return { status: 'Medium', message: 'Moist conditions. Monitor leaves.' };
    }
    return { status: 'Low', message: 'Disease risk is low.' };
};

// 3. Smart Irrigation Engine
export const checkIrrigation = (moisturePercent, temp) => {
    if (moisturePercent < 30) return { action: 'Irrigate Now', color: 'red' };
    if (moisturePercent < 50 && temp > 30) return { action: 'Schedule Water', color: 'amber' };
    return { action: 'Moisture Good', color: 'green' };
};

// 4. Soil Health Calculator (0-100 Score)
export const calculateSoilHealth = (n, p, k, ph) => {
    // Simple heuristic scoring
    let score = 100;

    // Ideal ranges: N (40-80), P (20-60), K (100-300), pH (6.0-7.0)
    if (n < 40 || n > 80) score -= 15;
    if (p < 20 || p > 60) score -= 15;
    if (k < 100 || k > 300) score -= 15;
    if (ph < 6.0 || ph > 7.0) score -= 20;

    return Math.max(0, score);
};

// 5. Yield Prediction (Revenue Forecasting)
export const predictYield = (n, p, k, rain) => {
    // Base yield assumption (Quintals/Acre)
    let predictedYield = 25; // Base

    // Nutrition Bonus
    if (n > 50 && p > 30 && k > 150) predictedYield += 5;

    // Weather Penalty
    if (rain < 10) predictedYield -= 8; // Drought
    if (rain > 100) predictedYield -= 5; // Flood damage

    return Math.max(0, predictedYield);
};

// 6. Crop Recommendation Engine
export const recommendCrop = (soilType, season) => {
    const recommendations = {
        'Loamy': {
            'Kharif': 'Rice, Sugarcane, Cotton',
            'Rabi': 'Wheat, Mustard, Potato',
            'Zaid': 'Cucumber, Watermelon'
        },
        'Clay': {
            'Kharif': 'Rice, Soybean',
            'Rabi': 'Chickpea, Barley',
            'Zaid': 'Sunflowers'
        },
        'Sandy': {
            'Kharif': 'Maize, Millets',
            'Rabi': 'Barley',
            'Zaid': 'Melons'
        },
        'Black': {
            'Kharif': 'Cotton, Soybean',
            'Rabi': 'Wheat',
            'Zaid': 'Vegetables'
        }
    };

    return recommendations[soilType]?.[season] || 'Mixed Vegetables (Generic)';
};

// 7. Weather Intelligence Logic (from agriLogic)
export const analyzeWeatherImpact = (temp, humidity, cropType) => {
    if (temp > 35) return { status: 'Critical', message: 'Heat Stress Detected. Increase irrigation by 20%.' };
    if (temp < 10 && cropType !== 'Winter Wheat') return { status: 'Warning', message: 'Frost risk. Cover sensitive seedlings.' };
    if (humidity > 85) return { status: 'Warning', message: 'High Humidity. Risk of fungal disease. Monitor leaves.' };
    return { status: 'Optimal', message: 'Conditions are ideal for growth.' };
};

// 8. Soil & Fertilizer Recommendation Algorithm (from agriLogic)
export const getFertilizerRecommendation = (n, p, k, ph) => {
    let recommendations = [];

    // Nitrogen Logic
    if (n < 40) recommendations.push({ type: 'Nitrogen', action: 'Apply Urea (46-0-0) immediately.', urgency: 'High' });
    else if (n > 80) recommendations.push({ type: 'Nitrogen', action: 'Nitrogen high. Reduce fertilizer to prevent burn.', urgency: 'Medium' });

    // Phosphorus Logic
    if (p < 20) recommendations.push({ type: 'Phosphorus', action: 'Apply DAP (Di-ammonium Phosphate).', urgency: 'Medium' });

    // pH Logic
    if (ph < 6.0) recommendations.push({ type: 'pH Balance', action: 'Soil is Acidic. Apply Lime.', urgency: 'High' });
    else if (ph > 7.5) recommendations.push({ type: 'pH Balance', action: 'Soil is Alkaline. Apply Gypsum.', urgency: 'Medium' });

    if (recommendations.length === 0) recommendations.push({ type: 'General', action: 'Soil levels are optimal.', urgency: 'Low' });

    return recommendations;
};
