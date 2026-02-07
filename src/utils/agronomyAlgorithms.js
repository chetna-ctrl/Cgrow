// ========================================
// AGRONOMY ALGORITHMS - DECISION LOGIC
// ========================================

import { SOIL_TYPES, GROWING_MEDIA, CLIMATE_ZONES, NUTRIENT_DEFICIENCIES } from '../data/agronomyDatabase';
import { CROP_LIBRARY } from '../data/hydroponicCrops';

// Legacy CROPS mapping for backward compatibility if needed, 
// but we prefer CROP_LIBRARY for Hydroponics.
const CROPS = CROP_LIBRARY;


/**
 * ALGORITHM 1: Crop Recommendation Engine
 * Based on: Soil Type, Season, Climate Zone
 */
export const recommendCrop = (soilType, season, climateZone) => {
    const recommendations = [];

    Object.entries(CROPS).forEach(([key, crop]) => {
        let score = 0;

        // Check soil compatibility
        if (crop.soilTypes.includes(soilType)) score += 40;

        // Check season compatibility
        if (crop.season.includes(season)) score += 30;

        // Check climate compatibility
        if (crop.climate.includes(climateZone)) score += 30;

        if (score >= 70) {
            recommendations.push({
                crop: crop.name,
                score,
                reason: `Suitable for ${soilType} soil in ${season} season`
            });
        }
    });

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.length > 0
        ? recommendations[0].crop
        : "Consult local agronomist";
};

/**
 * ALGORITHM 2: Nutrient Requirement Calculator
 * Based on: Crop Type, Growth Stage, Soil NPK Levels
 */
export const calculateNutrientNeeds = (cropType, currentNPK, growthStage) => {
    const crop = CROPS[cropType];
    if (!crop) return { error: "Crop not found" };

    const { N, P, K } = crop.nutrients;
    const recommendations = [];

    // Nitrogen Check
    if (currentNPK.n < N.value * 0.7) {
        recommendations.push({
            nutrient: "Nitrogen (N)",
            status: "Deficient",
            current: currentNPK.n,
            required: N.value,
            deficit: N.value - currentNPK.n,
            action: `Add ${Math.round((N.value - currentNPK.n) * 2.17)} kg Urea per hectare`,
            urgency: "High"
        });
    }

    // Phosphorus Check
    if (currentNPK.p < P.value * 0.7) {
        recommendations.push({
            nutrient: "Phosphorus (P)",
            status: "Deficient",
            current: currentNPK.p,
            required: P.value,
            deficit: P.value - currentNPK.p,
            action: `Add ${Math.round((P.value - currentNPK.p) * 2.5)} kg DAP per hectare`,
            urgency: "Medium"
        });
    }

    // Potassium Check
    if (currentNPK.k < K.value * 0.7) {
        recommendations.push({
            nutrient: "Potassium (K)",
            status: "Deficient",
            current: currentNPK.k,
            required: K.value,
            deficit: K.value - currentNPK.k,
            action: `Add ${Math.round((K.value - currentNPK.k) * 1.67)} kg MOP per hectare`,
            urgency: "Medium"
        });
    }

    if (recommendations.length === 0) {
        return {
            status: "Optimal",
            message: "Nutrient levels are within acceptable range"
        };
    }

    return recommendations;
};

/**
 * ALGORITHM 3: pH Correction Calculator
 */
export const calculatePHCorrection = (currentPH, targetPH, soilType) => {
    const diff = targetPH - currentPH;

    if (Math.abs(diff) < 0.3) {
        return {
            status: "Optimal",
            message: "pH is within acceptable range",
            action: "No correction needed"
        };
    }

    if (diff > 0) {
        // Need to increase pH (soil is acidic)
        const limeNeeded = Math.abs(diff) * 500; // kg/hectare (rough estimate)
        return {
            status: "Acidic",
            current: currentPH,
            target: targetPH,
            action: `Add ${Math.round(limeNeeded)} kg Agricultural Lime per hectare`,
            method: "Broadcast and incorporate into top 15cm soil",
            timing: "Apply 2-3 months before sowing",
            urgency: diff > 1.0 ? "High" : "Medium"
        };
    } else {
        // Need to decrease pH (soil is alkaline)
        const sulfurNeeded = Math.abs(diff) * 200; // kg/hectare
        return {
            status: "Alkaline",
            current: currentPH,
            target: targetPH,
            action: `Add ${Math.round(sulfurNeeded)} kg Elemental Sulfur per hectare`,
            method: "Mix with organic matter and incorporate",
            timing: "Apply 3-4 months before sowing (slow acting)",
            urgency: diff < -1.0 ? "High" : "Medium"
        };
    }
};

/**
 * ALGORITHM 4: Irrigation Schedule Calculator
 * Based on: Crop Water Need, Soil Type, Climate, Growth Stage
 */
export const calculateIrrigationSchedule = (cropType, soilType, temperature, humidity) => {
    const crop = CROPS[cropType];
    const soil = SOIL_TYPES[soilType];

    if (!crop || !soil) return { error: "Invalid inputs" };

    // Base water need (liters per plant per day)
    let baseWater = 0;
    if (crop.waterNeed === "Very High") baseWater = 5;
    else if (crop.waterNeed === "High") baseWater = 3;
    else if (crop.waterNeed === "Medium-High") baseWater = 2.5;
    else if (crop.waterNeed === "Medium") baseWater = 2;
    else baseWater = 1;

    // Adjust for temperature
    if (temperature > 35) baseWater *= 1.5;
    else if (temperature > 30) baseWater *= 1.2;
    else if (temperature < 20) baseWater *= 0.8;

    // Adjust for humidity
    if (humidity < 40) baseWater *= 1.3;
    else if (humidity > 70) baseWater *= 0.8;

    // Adjust for soil type
    if (soil.waterRetention === "Poor") baseWater *= 1.4;
    else if (soil.waterRetention === "Excellent") baseWater *= 0.7;

    // Calculate frequency
    let frequency;
    if (soil.waterRetention === "Poor") frequency = "Daily";
    else if (soil.waterRetention === "Good") frequency = "Every 2-3 days";
    else frequency = "Every 4-5 days";

    return {
        waterPerPlant: Math.round(baseWater * 10) / 10,
        frequency,
        method: soil.drainage === "Poor" ? "Drip irrigation recommended" : "Drip or Sprinkler",
        timing: "Early morning (6-8 AM) or evening (5-7 PM)",
        warning: temperature > 35 ? "High heat stress - increase frequency" : null
    };
};

/**
 * ALGORITHM 5: Growing Media Selector
 * Based on: Farming Type, Crop, Budget
 */
export const selectGrowingMedia = (farmingType, cropType, budget = "medium") => {
    if (farmingType === "hydroponics") {
        if (budget === "low") {
            return {
                primary: "Cocopeat",
                mix: "100% Cocopeat (pre-washed)",
                cost: "₹15-20/kg",
                reason: "Affordable, reusable, good for beginners"
            };
        } else {
            return {
                primary: "LECA + Cocopeat",
                mix: "70% LECA + 30% Cocopeat",
                cost: "₹35-45/kg",
                reason: "Best aeration and drainage for advanced systems"
            };
        }
    } else if (farmingType === "microgreens") {
        return {
            primary: "Cocopeat",
            mix: "70% Cocopeat + 30% Perlite",
            cost: "₹18-25/kg",
            reason: "Perfect water retention for fast-growing greens"
        };
    } else if (farmingType === "potted") {
        return {
            primary: "Soil Mix",
            mix: "40% Garden Soil + 40% Cocopeat + 20% Vermicompost",
            cost: "₹10-15/kg",
            reason: "Balanced nutrition and drainage for containers"
        };
    } else {
        return {
            primary: "Field Soil",
            mix: "Native soil + 20% Organic Matter",
            cost: "₹5-10/kg (compost)",
            reason: "Use existing soil, improve with compost"
        };
    }
};

/**
 * ALGORITHM 6: Disease Risk Predictor
 * Based on: Temperature, Humidity, Rainfall
 */
export const predictDiseaseRisk = (temperature, humidity, rainfall) => {
    const risks = [];

    // Fungal diseases (high humidity + moderate temp)
    if (humidity > 70 && temperature >= 20 && temperature <= 30) {
        risks.push({
            disease: "Fungal Infections (Blight, Mildew)",
            risk: "High",
            symptoms: "White/gray powder on leaves, dark spots",
            prevention: "Apply fungicide (Mancozeb), improve air circulation",
            urgency: "Immediate"
        });
    }

    // Bacterial diseases (high temp + high humidity)
    if (temperature > 30 && humidity > 80) {
        risks.push({
            disease: "Bacterial Wilt",
            risk: "Medium",
            symptoms: "Sudden wilting, yellowing",
            prevention: "Avoid overhead watering, use drip irrigation",
            urgency: "Monitor closely"
        });
    }

    // Pest activity (warm + dry)
    if (temperature > 28 && humidity < 50) {
        risks.push({
            disease: "Aphids & Whiteflies",
            risk: "Medium",
            symptoms: "Sticky leaves, curling, yellowing",
            prevention: "Neem oil spray, yellow sticky traps",
            urgency: "Preventive action"
        });
    }

    if (risks.length === 0) {
        return {
            status: "Low Risk",
            message: "Current conditions are favorable",
            action: "Continue regular monitoring"
        };
    }

    return risks;
};

/**
 * ALGORITHM 7: Harvest Readiness Checker
 * Based on: Days since planting, Visual indicators
 */
export const checkHarvestReadiness = (cropType, daysSincePlanting, visualIndicators = {}) => {
    const crop = CROPS[cropType];
    if (!crop) return { error: "Crop not found" };

    const maturityPercentage = (daysSincePlanting / crop.growthDays) * 100;

    if (maturityPercentage >= 100) {
        return {
            status: "Ready to Harvest",
            daysOverdue: daysSincePlanting - crop.growthDays,
            action: "Harvest immediately to prevent quality loss",
            urgency: "High"
        };
    } else if (maturityPercentage >= 90) {
        return {
            status: "Almost Ready",
            daysRemaining: crop.growthDays - daysSincePlanting,
            action: "Monitor daily, prepare for harvest",
            urgency: "Medium"
        };
    } else {
        return {
            status: "Growing",
            daysRemaining: crop.growthDays - daysSincePlanting,
            maturityPercentage: Math.round(maturityPercentage),
            action: "Continue regular care",
            urgency: "Low"
        };
    }
};

/**
 * ALGORITHM 8: Yield Predictor
 * Based on: NPK levels, pH, EC, Temperature, Crop Type
 */
export const predictYield = (cropType, currentNPK, ph, ec, temperature) => {
    const crop = CROPS[cropType];
    if (!crop) return { error: "Crop not found" };

    let yieldFactor = 100; // Start at 100% potential

    // pH impact
    const phDiff = Math.abs(ph - crop.phRange.ideal);
    if (phDiff > 1.0) yieldFactor -= 30;
    else if (phDiff > 0.5) yieldFactor -= 15;

    // EC impact
    const ecDiff = Math.abs(ec - crop.ecRange.ideal);
    if (ecDiff > 1.0) yieldFactor -= 25;
    else if (ecDiff > 0.5) yieldFactor -= 10;

    // Temperature impact
    const tempDiff = Math.abs(temperature - crop.tempRange.ideal);
    if (tempDiff > 10) yieldFactor -= 35;
    else if (tempDiff > 5) yieldFactor -= 20;

    // NPK impact
    const nDeficit = Math.max(0, (crop.nutrients.N.value - currentNPK.n) / crop.nutrients.N.value);
    const pDeficit = Math.max(0, (crop.nutrients.P.value - currentNPK.p) / crop.nutrients.P.value);
    const kDeficit = Math.max(0, (crop.nutrients.K.value - currentNPK.k) / crop.nutrients.K.value);

    yieldFactor -= (nDeficit * 25 + pDeficit * 15 + kDeficit * 15);

    // Ensure minimum 20%
    yieldFactor = Math.max(20, yieldFactor);

    return {
        predictedYield: Math.round(yieldFactor),
        rating: yieldFactor >= 80 ? "Excellent" : yieldFactor >= 60 ? "Good" : yieldFactor >= 40 ? "Fair" : "Poor",
        limitingFactors: [
            phDiff > 0.5 ? "pH not optimal" : null,
            ecDiff > 0.5 ? "EC not optimal" : null,
            tempDiff > 5 ? "Temperature stress" : null,
            nDeficit > 0.2 ? "Nitrogen deficiency" : null
        ].filter(Boolean)
    };
};

/**
 * ALGORITHM 9: Thermal Stress Detector (NEW)
 * Based on: Specific Crop Thresholds
 */
export const detectThermalStress = (cropId, currentTemp) => {
    const crop = CROP_LIBRARY[cropId?.toLowerCase()];
    if (!crop || !currentTemp) return null;

    const { min, max, optimal } = crop.temp;

    // Cold Stress
    if (currentTemp < min) {
        return {
            status: "Cold Stress ❄️",
            risk: "High",
            symptoms: crop.type === 'Herb' ? "Leaves turning purple/red (Phosphorus lockout)" : "Stunted growth, nutrient lockout",
            action: "Install water heater or move to warmer area."
        };
    }

    // Heat Stress
    if (currentTemp > max) {
        // Specific advice based on crop
        let riskMsg = "Slow growth, root rot risk";
        let actionMsg = "Add chillers, ice bottles, or increase shading";

        if (crop.name.includes('Lettuce') || crop.name.includes('Spinach')) {
            riskMsg = "BOLTING RISK! (Bitter taste & Flowers)";
            actionMsg = "CRITICAL: Lower temp immediately to prevent bolting.";
        } else if (crop.name.includes('Tomato')) {
            riskMsg = "Blossom Drop (Flowers falling off)";
        }

        return {
            status: "Heat Stress 🔥",
            risk: "High",
            symptoms: riskMsg,
            action: actionMsg
        };
    }

    // Optimal
    return {
        status: "Optimal ✅",
        risk: "None",
        symptoms: "Ideal range for photosynthesis",
        action: "Maintain current conditions"
    };
};

export default {
    recommendCrop,
    calculateNutrientNeeds,
    calculatePHCorrection,
    calculateIrrigationSchedule,
    selectGrowingMedia,
    predictDiseaseRisk,
    checkHarvestReadiness,
    predictYield,
    detectThermalStress
};
