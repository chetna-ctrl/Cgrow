/**
 * AGRI-OS SCIENTIFIC INTELLIGENCE LAYER
 * Pure biophysics and agronomy logic - NO UI components
 * All formulas are deterministic and research-backed
 * 
 * @module agriUtils
 * @author Agri-OS Biophysics Team
 */

// ==========================================
// 0. CONSTANTS & CONFIGURATION
// ==========================================

export const LIGHTING_OPTIONS = {
    MICROGREENS: [
        { value: 'LED_TUBES_WHITE', label: 'T5/T8 LED Tubes (Standard White)' },
        { value: 'SUNLIGHT', label: 'Natural Sunlight (Window/Balcony)' },
        { value: 'GROW_LIGHTS_FULL', label: 'Professional Grow LEDs (Full Spectrum)' },
        { value: 'CEILING_BULB', label: 'Normal Ceiling Bulb (Low Intensity)' }
    ],
    HYDROPONICS: [
        { value: 'GROW_LIGHTS_FULL', label: 'Professional Grow LEDs (Full Spectrum)' },
        { value: 'SUNLIGHT', label: 'Natural Sunlight (Direct)' },
        { value: 'GREENHOUSE', label: 'Greenhouse (Filtered Sun)' },
        { value: 'DIY_SHOP_LIGHTS', label: 'DIY Shop Lights (High Output)' }
    ]
};

export const WEATHER_CONDITIONS = [
    { value: 'Sunny', label: '☀️ Sunny / Clear Sky' },
    { value: 'Cloudy', label: '☁️ Cloudy / Overcast' },
    { value: 'Rainy', label: '🌧️ Rainy / Dark' },
    { value: 'PartlyCloudy', label: '⛅ Partly Cloudy' }
];

// ==========================================
// 1. SCIENTIFIC CROP DATABASE
// ==========================================

const CROP_GROUPS = {
    // ❄️ COOL CROPS (Base Temp 4°C)
    // Winter crops in Delhi (Rabi Season). They like 10-25°C air temp.
    COOL: [
        'Lettuce',
        'Spinach', 'Palak',
        'Broccoli',
        'Radish', 'Mooli',
        'Peas',
        'Mustard', 'Sarson',
        'Fenugreek', 'Methi',
        'Coriander', 'Dhania',
        'Mint', 'Pudina',
        'Strawberry',
        'Kale', 'Swiss Chard', 'Arugula', 'Wheatgrass'
    ],

    // 🔥 WARM CROPS (Base Temp 10°C)
    // Summer/Monsoon crops (Kharif/Zaid). They need heat (>25°C) to thrive.
    WARM: [
        'Tomato',
        'Basil', 'Tulsi',
        'Cucumber',
        'Capsicum', 'Shimla Mirch', 'Pepper', 'Chilli',
        'Amaranth', 'Chaulai', // C4 Plant (Loves Heat)
        'Sunflower',
        'Eggplant', 'Brinjal',
        'Okra', 'Bhindi',
        'Rice'
    ]
};

// Helper: Finds if a crop is Warm or Cool
export const getCropParams = (cropName) => {
    const name = cropName ? cropName.trim() : '';

    // Check if it exists in WARM group
    if (CROP_GROUPS.WARM.some(c => name.includes(c))) {
        return { base_temp: 10, min_dli: 20, max_dli: 30, type: 'WARM' };
    }

    // Default to COOL (Safer for most leafy greens/microgreens)
    return { base_temp: 4, min_dli: 12, max_dli: 18, type: 'COOL' };
};

// ==========================================
// 0B. SMART ADVICE ENGINE (The Brain)
// ==========================================

/**
 * Get Daily Task Advice Based on Batch Age
 * Automatically suggests watering method and lighting phase
 * 
 * @param {Object} batch - Batch object with sowing_date
 * @returns {Object} { age, watering, lighting } with icons and tips
 */
export function getDailyTaskAdvice(batch, dailyLogLightHours = 0) {
    const sownProp = batch.sow_date || batch.sowing_date;
    if (!batch || !sownProp) return null;

    // Fix Date Calculation (Ignore Timezone hours)
    const sownDate = new Date(sownProp);
    sownDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today - sownDate;
    const age = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Dynamic Blackout: Radish/Microgreens usually 3 days
    // Using user's logic: Day 0-3 is Blackout
    const isBlackoutPhase = age <= 3;

    let watering = {};
    let lighting = {};
    let alerts = [];

    // Phase 1: Blackout
    if (isBlackoutPhase) {
        watering = { type: "Spray / Misting", tip: "Keep seeds moist, not soaking.", icon: "🚿" };
        lighting = { status: "BLACKOUT MODE", action: "Keep Covered (Darkness)", is_blackout: true };

        // Smart Alert: If user gave light during blackout
        if (dailyLogLightHours > 0) {
            alerts.push({ type: 'danger', msg: `🚨 ERROR: It's Day ${age} (Blackout). You gave ${dailyLogLightHours} hrs light. Plants need darkness!` });
        }
    }
    // Phase 2: Growth
    else {
        watering = { type: "Bottom Watering", tip: "Water from bottom tray.", icon: "📥" };
        lighting = { status: "LIGHT PHASE", action: "Ensure 12-16 hrs Light", is_blackout: false };

        // Smart Alert: If light is too low for growth
        if (dailyLogLightHours > 0 && dailyLogLightHours < 8) {
            alerts.push({ type: 'warning', msg: `⚠️ Low Light: Day ${age} needs 12+ hours. You only gave ${dailyLogLightHours} hours.` });
        }
    }

    return { age, watering, lighting, alerts };
}

/**
 * Estimate PPFD based on lighting type and weather
 * @param {string} lightType - Type of light source
 * @param {string} weatherCondition - Weather condition (for natural light)
 * @returns {number} PPFD value in μmol/m²/s
 */
export function estimatePPFD(lightType, weatherCondition = 'Sunny') {
    switch (lightType) {
        // MICROGREENS
        case 'LED_TUBES_WHITE': return 120;
        case 'CEILING_BULB': return 40;

        // HYDROPONICS
        case 'GROW_LIGHTS_FULL': return 300;
        case 'DIY_SHOP_LIGHTS': return 180;

        // NATURAL SUNLIGHT (Dynamic)
        case 'SUNLIGHT':
        case 'WINDOW':
        case 'BALCONY':
        case 'GREENHOUSE':
            if (weatherCondition === 'Sunny') return 900;
            if (weatherCondition === 'PartlyCloudy') return 500;
            if (weatherCondition === 'Cloudy') return 200;
            if (weatherCondition === 'Rainy') return 80;
            return 400; // Default average

        default: return 0;
    }
}

/**
 * Calculate Daily Light Integral (DLI)
 * @param {number} ppfd - PPFD value
 * @param {number} hours - Light hours per day
 * @returns {number} DLI in mol/m²/day
 */
export function calculateDLI(ppfd, hours) {
    // Formula: PPFD * Hours * 3600 / 1,000,000
    // Simplified: PPFD * Hours * 0.0036
    return parseFloat((ppfd * hours * 0.0036).toFixed(2));
}

// ============================================================
// 1. THE TRUE TRANSPIRATION ENGINE (VPD INTELLIGENCE)
// ============================================================

/**
 * Calculate Saturation Vapor Pressure using Arrhenius equation
 * Based on: Tetens formula (1930), validated by ASHRAE
 * 
 * @param {number} tempC - Air temperature in Celsius
 * @returns {number} SVP in kPa
 */
function calculateSVP(tempC) {
    // Tetens formula: SVP = 0.61078 * exp((17.27 * T) / (T + 237.3))
    return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Calculate Vapor Pressure Deficit (VPD)
 * VPD = SVP × (1 - RH/100)
 * 
 * Biological Context:
 * - VPD drives transpiration (water + nutrient transport)
 * - Low VPD (<0.4 kPa): Transpiration stalls → Calcium deficiency (Tip Burn)
 * - High VPD (>1.5 kPa): Stomata close → Photosynthesis stops
 * 
 * @param {number} airTempC - Air temperature in Celsius
 * @param {number} relativeHumidity - Relative humidity (0-100%)
 * @returns {Object} { vpd_kpa, status, risk_factor, recommendation }
 */
export function calculateVPD(airTempC, relativeHumidity) {
    const svp = calculateSVP(airTempC);
    const vpd = svp * (1 - relativeHumidity / 100);

    let status, risk_factor, recommendation;

    // Thresholds based on research (Table 2 from source document)
    if (vpd < 0.4) {
        status = 'DANGER: Fungal Risk';
        risk_factor = 'HIGH';
        recommendation = 'Increase ventilation or reduce humidity. Transpiration has stalled - Calcium transport blocked (Tip Burn risk).';
    } else if (vpd >= 0.4 && vpd < 0.8) {
        status = 'CAUTION: Low Transpiration';
        risk_factor = 'MEDIUM';
        recommendation = 'Slightly increase air movement. Nutrient transport is suboptimal.';
    } else if (vpd >= 0.8 && vpd <= 1.2) {
        status = 'OPTIMAL: Green Zone';
        risk_factor = 'LOW';
        recommendation = 'Maintain current conditions. Transpiration and photosynthesis are balanced.';
    } else if (vpd > 1.2 && vpd <= 1.6) {
        status = 'CAUTION: High Transpiration';
        risk_factor = 'MEDIUM';
        recommendation = 'Monitor closely. Plants may start closing stomata to conserve water.';
    } else {
        status = 'DANGER: Stomatal Closure';
        risk_factor = 'HIGH';
        recommendation = 'URGENT: Increase humidity or reduce temperature. Stomata are closing - photosynthesis is stopping.';
    }

    return {
        vpd_kpa: parseFloat(vpd.toFixed(2)),
        svp_kpa: parseFloat(svp.toFixed(2)),
        status,
        risk_factor,
        recommendation,
        optimal_range: '0.8-1.2 kPa'
    };
}

// ============================================================
// 2. CUMULATIVE VPD STRESS TRACKER
// ============================================================

/**
 * Analyze cumulative VPD stress over time
 * Hidden stress: Daily averages may look fine, but hourly fluctuations damage crops
 * 
 * @param {Array<Object>} vpdLogs - Array of { timestamp, vpd_kpa }
 * @returns {Object} Stress analysis with actionable insights
 */
export function analyzeCumulativeVPDStress(vpdLogs) {
    if (!vpdLogs || vpdLogs.length === 0) {
        return { error: 'No VPD data provided' };
    }

    const OPTIMAL_MIN = 0.8;
    const OPTIMAL_MAX = 1.2;

    let hoursInOptimal = 0;
    let hoursLow = 0;
    let hoursHigh = 0;
    let totalStressScore = 0;

    vpdLogs.forEach(log => {
        const vpd = log.vpd_kpa || log.vpd;

        if (vpd >= OPTIMAL_MIN && vpd <= OPTIMAL_MAX) {
            hoursInOptimal++;
        } else if (vpd < OPTIMAL_MIN) {
            hoursLow++;
            // Stress severity increases exponentially as VPD drops
            const stressFactor = Math.pow((OPTIMAL_MIN - vpd) / OPTIMAL_MIN, 2);
            totalStressScore += stressFactor;
        } else {
            hoursHigh++;
            // Stress severity increases as VPD rises
            const stressFactor = Math.pow((vpd - OPTIMAL_MAX) / OPTIMAL_MAX, 2);
            totalStressScore += stressFactor;
        }
    });

    const totalHours = vpdLogs.length;
    const optimalPercentage = (hoursInOptimal / totalHours) * 100;
    const avgStressPerHour = totalStressScore / totalHours;

    let healthStatus, yieldImpact;

    if (optimalPercentage >= 80) {
        healthStatus = 'EXCELLENT';
        yieldImpact = 'No significant impact expected';
    } else if (optimalPercentage >= 60) {
        healthStatus = 'GOOD';
        yieldImpact = 'Minor yield reduction (0-5%)';
    } else if (optimalPercentage >= 40) {
        healthStatus = 'FAIR';
        yieldImpact = 'Moderate yield reduction (5-15%)';
    } else {
        healthStatus = 'POOR';
        yieldImpact = 'Significant yield reduction (15-30%)';
    }

    return {
        total_hours_analyzed: totalHours,
        hours_in_optimal: hoursInOptimal,
        hours_too_low: hoursLow,
        hours_too_high: hoursHigh,
        optimal_percentage: parseFloat(optimalPercentage.toFixed(1)),
        cumulative_stress_score: parseFloat(totalStressScore.toFixed(2)),
        avg_stress_per_hour: parseFloat(avgStressPerHour.toFixed(3)),
        health_status: healthStatus,
        predicted_yield_impact: yieldImpact,
        recommendation: hoursLow > hoursHigh
            ? 'Primary issue: Low VPD (high humidity). Increase ventilation to prevent Calcium deficiency.'
            : 'Primary issue: High VPD (low humidity). Increase humidity or reduce temperature.'
    };
}

// ============================================================
// 3. THE SMART HARVEST PREDICTOR (GDD ENGINE)
// ============================================================

/**
 * Calculate Growing Degree Days (GDD)
 * Thermal time is a better predictor than calendar days
 * 
 * Formula: GDD = ((Tmax + Tmin) / 2) - Tbase
 * 
 * @param {number} tMax - Maximum daily temperature (°C)
 * @param {number} tMin - Minimum daily temperature (°C)
 * @param {number} tBase - Base temperature for crop (default: 4°C for lettuce)
 * @returns {number} GDD for that day
 */
/**
 * Calculates Growing Degree Days (GDD)
 * Automatically detects if crop needs Base 4°C or Base 10°C
 */
export const calculateDailyGDD = (tMax, tMin, cropName = 'Lettuce') => {
    const params = getCropParams(cropName);
    const tBase = params.base_temp;

    const avgTemp = (tMax + tMin) / 2;
    let gdd = avgTemp - tBase;

    // Spy Logic: Check console to see if it worked
    console.log(`🌱 GDD for ${cropName}: Used Base ${tBase}°C (${params.type})`);

    if (gdd < 0) gdd = 0;
    return parseFloat(gdd.toFixed(2));
};

/**
 * Predict harvest readiness based on cumulative GDD
 * 
 * GDD Requirements (Research-Based):
 * - Lettuce: 600-800 GDD
 * - Basil: 800-1000 GDD
 * - Tomato: 1500-2000 GDD
 * 
 * @param {Array<Object>} tempLogs - Array of { date, tMax, tMin }
 * @param {string} cropType - Crop name
 * @returns {Object} Harvest prediction analysis
 */

export const GDD_TARGETS = {
    'Lettuce': 700,
    'Spinach (Palak)': 650,
    'Basil (Tulsi)': 900,
    'Radish (Mooli)': 400,
    'Fenugreek (Methi)': 500,
    'Mustard (Sarson)': 450,
    'Coriander (Dhania)': 600,
    'Tomato': 1750,
    'Cucumber': 1200,
    'Capsicum (Shimla Mirch)': 1600
};

export function predictHarvestByGDD(tempLogs, cropType = 'Lettuce') {
    const targetGDD = GDD_TARGETS[cropType] || 700;

    let cumulativeGDD = 0;

    tempLogs.forEach(log => {
        const dailyGDD = calculateDailyGDD(log.tMax || log.temp_max, log.tMin || log.temp_min);
        cumulativeGDD += dailyGDD;
    });

    const progressPercent = (cumulativeGDD / targetGDD) * 100;
    const remainingGDD = Math.max(0, targetGDD - cumulativeGDD);

    // Estimate days to harvest based on recent average GDD
    const recentLogs = tempLogs.slice(-7); // Last 7 days
    const avgRecentGDD = recentLogs.reduce((sum, log) => {
        return sum + calculateDailyGDD(log.tMax || log.temp_max, log.tMin || log.temp_min);
    }, 0) / recentLogs.length;

    const estimatedDaysRemaining = avgRecentGDD > 0
        ? Math.ceil(remainingGDD / avgRecentGDD)
        : null;

    return {
        crop_type: cropType,
        target_gdd: targetGDD,
        current_gdd: parseFloat(cumulativeGDD.toFixed(1)),
        progress_percent: parseFloat(progressPercent.toFixed(1)),
        remaining_gdd: parseFloat(remainingGDD.toFixed(1)),
        estimated_days_to_harvest: estimatedDaysRemaining,
        status: progressPercent >= 100 ? 'READY TO HARVEST' :
            progressPercent >= 80 ? 'APPROACHING MATURITY' :
                'VEGETATIVE GROWTH',
        recommendation: progressPercent >= 100
            ? 'Harvest immediately to prevent bolting and quality loss.'
            : `Continue growing. Approximately ${estimatedDaysRemaining || 'N/A'} days remaining.`
    };
}

// ============================================================
// 4. THE NUTRIENT DOCTOR (ANTAGONISM & LOCKOUT ENGINE)
// ============================================================

/**
 * Analyze nutrient health and detect lockouts
 * Based on Mulder's Chart and ionic antagonism principles
 * 
 * @param {Object} inputs - Sensor and nutrient data
 * @returns {Array<Object>} Array of warnings with scientific explanations
 */
export function analyzeNutrientHealth(inputs) {
    const warnings = [];

    const {
        ph,
        ec,
        waterTemp,
        dissolvedOxygen,
        potassium_ppm,
        calcium_ppm,
        phosphorus_ppm,
        iron_ppm,
        visualSymptoms = []
    } = inputs;

    // ========================================
    // CHECK 1: Potassium-Induced Calcium Lockout
    // Mulder's Chart: Excess K+ blocks Ca++ uptake
    // ========================================
    if (potassium_ppm && potassium_ppm > 300) {
        warnings.push({
            severity: 'HIGH',
            type: 'CATION_COMPETITION',
            title: 'Potassium-Induced Calcium Lockout',
            diagnosis: `Potassium level (${potassium_ppm} ppm) is excessive. K+ ions are aggressively blocking Ca++ uptake sites.`,
            symptoms: 'Expect Tip Burn (necrotic leaf margins) even if Calcium levels appear normal.',
            action: 'REDUCE Potassium concentration. Do NOT add more Calcium - it will not be absorbed.',
            scientific_basis: "Mulder's Chart: K-Ca antagonism. Excess K+ competitively inhibits Ca++ transport."
        });
    }

    // ========================================
    // CHECK 2: The Deadly Crossover (Root Hypoxia)
    // High Water Temp + Low DO = Root Rot
    // ========================================
    if (waterTemp && dissolvedOxygen) {
        if (waterTemp > 25 && dissolvedOxygen < 6) {
            warnings.push({
                severity: 'CRITICAL',
                type: 'ROOT_HYPOXIA',
                title: 'Deadly Crossover: Root Rot Risk',
                diagnosis: `Water Temperature (${waterTemp}°C) is too high AND Dissolved Oxygen (${dissolvedOxygen} mg/L) is critically low.`,
                symptoms: 'Root browning, slime formation, wilting despite adequate water.',
                action: 'URGENT: Cool water to <22°C AND increase aeration. Pythium thrives in warm, oxygen-poor water.',
                scientific_basis: 'Oxygen solubility decreases exponentially with temperature. Warm water cannot hold enough O2 for root respiration.'
            });
        } else if (waterTemp > 25) {
            warnings.push({
                severity: 'MEDIUM',
                type: 'TEMPERATURE_WARNING',
                title: 'High Water Temperature',
                diagnosis: `Water Temperature (${waterTemp}°C) exceeds optimal range.`,
                symptoms: 'Reduced nutrient uptake, increased pathogen risk.',
                action: 'Cool water to 18-22°C range. Consider chiller or frozen water bottles.',
                scientific_basis: 'Optimal root zone temperature for lettuce: 18-22°C. Higher temps reduce hydraulic conductivity.'
            });
        }
    }

    // ========================================
    // CHECK 3: pH-Induced Micronutrient Lockout
    // High pH precipitates Fe, Mn, Zn
    // ========================================
    if (ph && ph > 6.5) {
        warnings.push({
            severity: 'MEDIUM',
            type: 'PH_LOCKOUT',
            title: 'pH-Induced Micronutrient Precipitation',
            diagnosis: `pH (${ph}) is too high. Iron, Manganese, and Zinc are forming insoluble hydroxides.`,
            symptoms: 'Interveinal chlorosis (yellowing between leaf veins) despite adequate fertilization.',
            action: 'Lower pH to 5.8-6.2 range using phosphoric acid or citric acid.',
            scientific_basis: 'Fe³⁺ precipitates as Fe(OH)₃ at pH > 6.5. Use chelated iron (EDTA for pH < 6.0, DTPA for pH 6.0-7.0).'
        });
    } else if (ph && ph < 5.5) {
        warnings.push({
            severity: 'MEDIUM',
            type: 'PH_TOXICITY',
            title: 'Low pH: Micronutrient Toxicity Risk',
            diagnosis: `pH (${ph}) is too low. Manganese and Aluminum may reach toxic levels.`,
            symptoms: 'Brown spots on leaves, stunted growth.',
            action: 'Raise pH to 5.8-6.2 using potassium hydroxide or potassium bicarbonate.',
            scientific_basis: 'Mn²⁺ solubility increases 100-fold for each pH unit drop. Toxic at pH < 5.5.'
        });
    }

    // ========================================
    // CHECK 4: Phosphorus-Induced Zinc/Iron Lockout
    // High P binds with Zn and Fe
    // ========================================
    if (phosphorus_ppm && phosphorus_ppm > 80) {
        warnings.push({
            severity: 'MEDIUM',
            type: 'PHOSPHORUS_ANTAGONISM',
            title: 'Excess Phosphorus: Zinc/Iron Lockout',
            diagnosis: `Phosphorus (${phosphorus_ppm} ppm) is excessive. Forming insoluble phosphates with Zn and Fe.`,
            symptoms: 'Interveinal chlorosis, stunted new growth.',
            action: 'Reduce phosphorus concentration. Increase Zinc and chelated Iron.',
            scientific_basis: 'High P forms Zn₃(PO₄)₂ and FePO₄ precipitates, rendering them unavailable.'
        });
    }

    // ========================================
    // CHECK 5: Temperature Differential (Air vs Water)
    // Large delta = Physiological drought
    // ========================================
    if (inputs.airTemp && waterTemp) {
        const tempDelta = Math.abs(inputs.airTemp - waterTemp);
        if (tempDelta > 8) {
            warnings.push({
                severity: 'HIGH',
                type: 'THERMAL_STRESS',
                title: 'Temperature Differential: Physiological Drought',
                diagnosis: `Air Temperature (${inputs.airTemp}°C) and Water Temperature (${waterTemp}°C) differ by ${tempDelta}°C.`,
                symptoms: 'Wilting despite adequate water, tip burn.',
                action: inputs.airTemp > waterTemp
                    ? 'Warm the water or cool the air. Roots cannot pump water fast enough to match canopy transpiration.'
                    : 'Cool the air or warm the water. Metabolic mismatch between root and shoot zones.',
                scientific_basis: 'Hydraulic conductivity is temperature-dependent. Cold roots cannot supply water to warm, transpiring leaves.'
            });
        }
    }

    // ========================================
    // CHECK 6: EC Extremes
    // ========================================
    if (ec) {
        if (ec < 0.8) {
            warnings.push({
                severity: 'LOW',
                type: 'NUTRIENT_DEFICIENCY',
                title: 'Low EC: Nutrient Starvation',
                diagnosis: `EC (${ec} mS/cm) is below optimal range.`,
                symptoms: 'Pale leaves, slow growth.',
                action: 'Increase nutrient concentration to 1.2-2.0 mS/cm range.',
                scientific_basis: 'EC measures total dissolved ions. Low EC = insufficient nutrients for optimal growth.'
            });
        } else if (ec > 2.5) {
            warnings.push({
                severity: 'HIGH',
                type: 'SALT_STRESS',
                title: 'High EC: Salt Stress',
                diagnosis: `EC (${ec} mS/cm) is excessive. Osmotic stress is preventing water uptake.`,
                symptoms: 'Leaf edge burn, wilting, stunted growth.',
                action: 'Dilute solution with fresh water. Target EC: 1.2-2.0 mS/cm.',
                scientific_basis: 'High EC creates negative osmotic potential. Roots cannot overcome the gradient to absorb water.'
            });
        }
    }

    return warnings;
}

// ============================================================
// 5. NUTRIENT DEPLETION INTELLIGENCE
// ============================================================

/**
 * Analyze nutrient depletion patterns
 * Determines if plant is thirsty (transpiration dominant) or hungry (nutrient dominant)
 * 
 * @param {Object} currentReading - { waterLevel, ec }
 * @param {Object} previousReading - { waterLevel, ec }
 * @param {number} hoursElapsed - Time between readings
 * @returns {Object} Depletion analysis with recommendations
 */
export function analyzeNutrientDepletion(currentReading, previousReading, hoursElapsed = 24) {
    const waterDrop = previousReading.waterLevel - currentReading.waterLevel;
    const ecChange = currentReading.ec - previousReading.ec;

    let pattern, diagnosis, action, scientific_explanation;

    // ========================================
    // CASE A: Water ↓, EC ↑ = Thirsty (Transpiration Dominant)
    // ========================================
    if (waterDrop > 0 && ecChange > 0) {
        pattern = 'TRANSPIRATION_DOMINANT';
        diagnosis = 'Plant is drinking water faster than consuming nutrients.';
        action = 'Add PLAIN WATER (no nutrients) to dilute the solution back to target EC.';
        scientific_explanation = 'High transpiration rate (driven by VPD) is removing water, concentrating the remaining nutrients. This is normal in hot, dry conditions.';
    }
    // ========================================
    // CASE B: Water ↓, EC ↓ = Hungry (Nutrient Dominant)
    // ========================================
    else if (waterDrop > 0 && ecChange < 0) {
        pattern = 'NUTRIENT_DOMINANT';
        diagnosis = 'Plant is consuming nutrients faster than water.';
        action = 'Add NUTRIENT SOLUTION at target EC to replenish both water and nutrients.';
        scientific_explanation = 'Active growth phase. Plant is aggressively uptaking ions (N, P, K) for biomass production. This is ideal.';
    }
    // ========================================
    // CASE C: Water ↓, EC stable = Balanced
    // ========================================
    else if (waterDrop > 0 && Math.abs(ecChange) < 0.1) {
        pattern = 'BALANCED';
        diagnosis = 'Plant is consuming water and nutrients proportionally.';
        action = 'Add nutrient solution at current EC to maintain balance.';
        scientific_explanation = 'Perfect equilibrium. Water uptake matches nutrient uptake. Maintain current conditions.';
    }
    // ========================================
    // CASE D: No water drop = Stagnant
    // ========================================
    else {
        pattern = 'STAGNANT';
        diagnosis = 'Little to no water consumption detected.';
        action = 'Check for root health issues, temperature stress, or disease. Plant may be dormant or stressed.';
        scientific_explanation = 'Healthy plants should consume water daily. Lack of consumption indicates a problem.';
    }

    const waterConsumptionRate = hoursElapsed > 0 ? waterDrop / hoursElapsed : 0;
    const ecChangeRate = hoursElapsed > 0 ? ecChange / hoursElapsed : 0;

    return {
        pattern,
        diagnosis,
        action,
        scientific_explanation,
        metrics: {
            water_consumed_liters: parseFloat(waterDrop.toFixed(2)),
            ec_change_mS: parseFloat(ecChange.toFixed(2)),
            hours_elapsed: hoursElapsed,
            water_consumption_rate_L_per_hour: parseFloat(waterConsumptionRate.toFixed(3)),
            ec_change_rate_per_hour: parseFloat(ecChangeRate.toFixed(3))
        }
    };
}

// ============================================================
// 6. CONTEXT-AWARE ALERT ENGINE
// ============================================================

/**
 * Generate context-aware alerts (filter noise, show high-value insights)
 * Only triggers when COMBINATIONS of factors indicate real problems
 * 
 * @param {Object} sensorData - All current sensor readings
 * @returns {Array<Object>} Array of high-priority alerts
 */
export function generateContextAwareAlerts(sensorData) {
    const alerts = [];

    const {
        airTemp,
        humidity,
        waterTemp,
        ph,
        ec,
        dissolvedOxygen,
        lightHours
    } = sensorData;

    // Calculate VPD for context
    const vpdData = airTemp && humidity ? calculateVPD(airTemp, humidity) : null;

    // ========================================
    // ALERT 1: High Risk of Calcium Tip Burn
    // Trigger: High Temp + High Humidity + Low VPD
    // ========================================
    if (airTemp > 26 && humidity > 75 && vpdData && vpdData.vpd_kpa < 0.6) {
        alerts.push({
            priority: 'CRITICAL',
            title: '🚨 High Risk of Calcium Tip Burn',
            context: `Air Temperature is ${airTemp}°C (high) AND Humidity is ${humidity}% (high). VPD has dropped to ${vpdData.vpd_kpa} kPa.`,
            root_cause: 'Transpiration has stopped despite heat. Calcium transport to leaf tips is blocked.',
            immediate_action: 'Increase ventilation to raise VPD above 0.8 kPa. Reduce humidity or increase air movement.',
            why_this_matters: 'Tip Burn is irreversible and reduces marketable yield by 20-40%. Prevention is critical.'
        });
    }

    // ========================================
    // ALERT 2: Root Rot Imminent
    // Trigger: High Water Temp + Low DO
    // ========================================
    if (waterTemp > 24 && dissolvedOxygen < 6) {
        alerts.push({
            priority: 'CRITICAL',
            title: '☠️ Root Rot Risk: Deadly Crossover Detected',
            context: `Water Temperature (${waterTemp}°C) is too warm AND Dissolved Oxygen (${dissolvedOxygen} mg/L) is critically low.`,
            root_cause: 'Warm water cannot hold sufficient oxygen. Anaerobic conditions favor Pythium (root rot pathogen).',
            immediate_action: 'URGENT: Cool water to <22°C AND increase aeration (air stones, water chillers).',
            why_this_matters: 'Root rot can destroy an entire crop in 48-72 hours. This is the #1 killer in hydroponics.'
        });
    }

    // ========================================
    // ALERT 3: Photosynthesis Shutdown
    // Trigger: Low VPD (stomata closed) + Adequate light
    // ========================================
    if (vpdData && vpdData.vpd_kpa > 1.6 && lightHours > 12) {
        alerts.push({
            priority: 'HIGH',
            title: '🌡️ Stomatal Closure: Photosynthesis Stopped',
            context: `VPD is ${vpdData.vpd_kpa} kPa (too high). Guard cells have lost turgor - stomata are closed.`,
            root_cause: 'Air is too dry. Plant is prioritizing water conservation over CO₂ intake.',
            immediate_action: 'Increase humidity or reduce temperature. Target VPD: 0.8-1.2 kPa.',
            why_this_matters: 'No CO₂ intake = No photosynthesis = No growth. You are wasting electricity on lights.'
        });
    }

    // ========================================
    // ALERT 4: pH Drift (Micronutrient Lockout)
    // Trigger: pH outside optimal range
    // ========================================
    if (ph && (ph < 5.5 || ph > 6.5)) {
        const issue = ph < 5.5 ? 'too low (Mn toxicity risk)' : 'too high (Fe/Zn lockout)';
        alerts.push({
            priority: 'MEDIUM',
            title: '⚗️ pH Drift: Nutrient Availability Compromised',
            context: `pH is ${ph} (${issue}). Micronutrients are either toxic or unavailable.`,
            root_cause: ph < 5.5
                ? 'Acidic conditions increase Manganese solubility to toxic levels.'
                : 'Alkaline conditions precipitate Iron, Zinc, and Manganese as insoluble hydroxides.',
            immediate_action: ph < 5.5
                ? 'Raise pH to 5.8-6.2 using potassium hydroxide.'
                : 'Lower pH to 5.8-6.2 using phosphoric acid.',
            why_this_matters: 'Nutrient lockout causes deficiency symptoms even when nutrients are present. Wastes fertilizer.'
        });
    }

    // ========================================
    // ALERT 5: EC Imbalance
    // Trigger: EC too high or too low
    // ========================================
    if (ec && ec > 2.5) {
        alerts.push({
            priority: 'HIGH',
            title: '🧂 Salt Stress: Osmotic Shock',
            context: `EC is ${ec} mS/cm (excessive). Osmotic pressure is preventing water uptake.`,
            root_cause: 'Solution is too concentrated. Roots cannot overcome the osmotic gradient.',
            immediate_action: 'Dilute with fresh water immediately. Target EC: 1.2-2.0 mS/cm.',
            why_this_matters: 'Plants will wilt despite being in water. Leaf edge burn and stunted growth will occur.'
        });
    }

    return alerts;
}

// ============================================================
// BONUS: DAILY LIGHT INTEGRAL (DLI) CALCULATOR
// ============================================================



// ============================================================
// DATA SCHEMA RECOMMENDATIONS FOR AI-READY DATABASE
// ============================================================

/**
 * SUPABASE SCHEMA RECOMMENDATIONS
 * 
 * To make your `daily_logs` table "AI-Ready", save these DERIVED metrics:
 * 
 * 1. vpd_kpa (NUMERIC) - Calculated VPD, not just raw temp/humidity
 * 2. vpd_stress_hours (INTEGER) - Cumulative hours outside optimal VPD
 * 3. gdd_accumulated (NUMERIC) - Running total of Growing Degree Days
 * 4. nutrient_depletion_pattern (TEXT) - 'TRANSPIRATION_DOMINANT', 'NUTRIENT_DOMINANT', etc.
 * 5. ec_trend (TEXT) - 'RISING', 'FALLING', 'STABLE'
 * 6. water_consumption_rate (NUMERIC) - Liters per hour
 * 7. dli_mol_per_m2 (NUMERIC) - Daily Light Integral
 * 8. alert_count (INTEGER) - Number of context-aware alerts triggered
 * 9. health_score (INTEGER 0-100) - Composite score based on all metrics
 * 
 * WHY: Raw sensor data (temp, humidity) is not enough for ML models.
 * Derived metrics capture the BIOLOGICAL MEANING of the data.
 * 
 * Example: Instead of "Humidity was 80%", save "VPD was 0.3 kPa (Fungal Risk)".
 * This allows future AI to learn: "When VPD < 0.4 for >6 hours, Tip Burn occurs in 72% of cases."
 * 
 * SUGGESTED COLUMNS TO ADD:
 * 
 * ALTER TABLE daily_logs ADD COLUMN vpd_kpa NUMERIC(4,2);
 * ALTER TABLE daily_logs ADD COLUMN gdd_daily NUMERIC(5,2);
 * ALTER TABLE daily_logs ADD COLUMN dli_mol_per_m2 NUMERIC(5,2);
 * ALTER TABLE daily_logs ADD COLUMN depletion_pattern TEXT;
 * ALTER TABLE daily_logs ADD COLUMN alert_severity TEXT; -- 'NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
 * ALTER TABLE daily_logs ADD COLUMN health_score INTEGER; -- 0-100
 */



export default {
    calculateVPD,
    analyzeCumulativeVPDStress,
    calculateDailyGDD,
    predictHarvestByGDD,
    analyzeNutrientHealth,
    analyzeNutrientDepletion,
    generateContextAwareAlerts,
    calculateDLI,
    estimatePPFD,
    getDailyTaskAdvice
};
// --- NEW FUNCTION: CALCULATE MASTER HEALTH SCORE ---
export const calculateFarmHealth = (log) => {
    // Default to 100 (Perfect) if no log exists
    if (!log) return { score: 100, reasons: [] };

    let score = 100;
    let penalties = [];

    // 1. VISUAL CHECK (Max 30 pts)
    if (log.visual_check && log.visual_check.includes('Mold')) { score -= 30; penalties.push("Mold Detected (-30)"); }
    else if (log.visual_check && log.visual_check.includes('Wilting')) { score -= 20; penalties.push("Plants Wilting (-20)"); }
    else if (log.visual_check && log.visual_check.includes('Leggy')) { score -= 10; penalties.push("Leggy Growth (-10)"); }

    // 2. VPD CHECK (Max 25 pts)
    const vpd = parseFloat(log.vpd_kpa);
    if (!isNaN(vpd)) {
        if (vpd < 0.4 || vpd > 1.6) { score -= 25; penalties.push("VPD Danger Zone (-25)"); }
        else if (vpd < 0.8 || vpd > 1.2) { score -= 10; penalties.push("VPD Not Optimal (-10)"); }
    }

    // 3. DLI / LIGHT CHECK (Max 20 pts)
    const dli = parseFloat(log.dli_mol_per_m2);
    if (!isNaN(dli)) {
        if (dli > 30) { score -= 20; penalties.push("Light Burn Risk (-20)"); }
        else if (dli < 5) { score -= 10; penalties.push("Low Light (-10)"); }
    }

    // 4. SYSTEM SPECIFIC (Max 25 pts)
    if (log.system_type === 'Hydroponics') {
        const ph = parseFloat(log.ph);
        const ec = parseFloat(log.ec);
        if (ph < 5.5 || ph > 6.5) { score -= 15; penalties.push("Bad pH (-15)"); }
        if (ec < 1.0) { score -= 10; penalties.push("Low Nutrient (-10)"); }
    } else {
        // Microgreens: Deduct if misting happens in late stage (assumption)
        if (log.watering_status === 'Misted' && log.growth_stage !== 'Germination') {
            score -= 10; penalties.push("Improper Watering (-10)");
        }
    }

    return { score: Math.max(0, score), reasons: penalties };
};
