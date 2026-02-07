/**
 * cGrow SCIENTIFIC INTELLIGENCE LAYER
 * Pure biophysics and agronomy logic - NO UI components
 * All formulas are deterministic and research-backed
 * 
 * @module agriUtils
 * @author cGrow Biophysics Team
 */

/**
 * Validate sensor data for physical outliers
 * Prevents logic failure due to faulty sensors or erratic logging
 * 
 * @param {Object} data - { ph, ec, temp, humidity }
 * @returns {Object} { isValid, errors, cleanedData }
 */
export function validateSensorData(data) {
    const errors = [];
    const cleanedData = { ...data };

    Object.entries(data).forEach(([key, value]) => {
        const limits = SENSOR_LIMITS[key];
        if (!limits || value === undefined || value === null) return;

        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            errors.push(`${key} is not a valid number`);
            return;
        }

        // Extreme Hazard (Calibration Error / Broken Probe)
        if (numValue < limits.extreme_min || numValue > limits.extreme_max) {
            errors.push(`CRITICAL: ${key} reading (${numValue}) is physically impossible. Sensor failure likely.`);
            cleanedData[key] = numValue < limits.extreme_min ? limits.extreme_min : limits.extreme_max;
        }
        // Operational Warning
        else if (numValue < limits.min || numValue > limits.max) {
            errors.push(`WARNING: ${key} reading (${numValue}) is outside operational norms.`);
        }
    });

    return {
        isValid: errors.length === 0,
        isHazardous: errors.some(e => e.includes('CRITICAL')),
        errors,
        cleanedData
    };
}

/**
 * Detect gaps in logging for automated sync
 * @param {string} lastLogDate - ISO Date of the last manual log
 * @returns {Array<string>} List of missing dates in 'YYYY-MM-DD' format
 */
export function calculateMissingLogGaps(lastLogDate) {
    if (!lastLogDate) return [];

    const gaps = [];
    const last = new Date(lastLogDate);
    last.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from the day after the last log
    let current = new Date(last);
    current.setDate(current.getDate() + 1);

    while (current < today) {
        gaps.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    return gaps;
}

/**
 * Generate a scientific Ghost Log from weather data
 * Maps environmental parameters to crop health and biophysics
 */
export function generateGhostLogFromWeather(weatherDay, cropName = 'Lettuce') {
    const vpd = calculateVPD(weatherDay.max, 50); // Fallback humidity 50% if missing
    const gdd = calculateDailyGDD(weatherDay.max, weatherDay.min, cropName);

    return {
        temp: Math.round((weatherDay.max + weatherDay.min) / 2),
        temp_max: weatherDay.max,
        temp_min: weatherDay.min,
        humidity: 50, // Baseline estimate
        vpd_kpa: vpd.vpd_kpa,
        gdd_daily: gdd,
        health_score: 85, // Automated logs start with conservative confidence
        notes: `🤖 AUTO-SYNC: Ghost Log generated from Weather Archive.`,
        is_ghost_log: true,
        sync_source: 'WEATHER_API',
        created_at: new Date(weatherDay.date).toISOString()
    };
}

/**
 * Centralized Revenue Calculation
 * Standardizes profit logic across Dashboard, Microgreens, and Finance
 * 
 * @param {string} crop - Crop name
 * @param {number} yieldGrams - Actual or predicted yield in grams
 * @param {number} livePricePerKg - Optional live market price
 * @returns {number} Estimated Revenue in ₹
 */
export function calculateRevenue(crop, yieldGrams, livePricePerKg = null) {
    const pricePerKg = livePricePerKg || AVERAGE_MARKET_PRICES[crop] || 150;
    const yieldKg = (yieldGrams || 0) / 1000;
    return Math.round(yieldKg * pricePerKg);
}

// ==========================================
// 0. CONSTANTS & CONFIGURATION
// ==========================================

// ==========================================
// 0. CONSTANTS & CONFIGURATION
// ==========================================

// SENSOR SAFETY LIMITS (Physics-based)
export const SENSOR_LIMITS = {
    ph: { min: 3.0, max: 9.0, extreme_min: 0, extreme_max: 14 },
    ec: { min: 0.2, max: 4.5, extreme_min: 0, extreme_max: 10 },
    temp: { min: 5, max: 45, extreme_min: -10, extreme_max: 60 },
    humidity: { min: 10, max: 95, extreme_min: 0, extreme_max: 100 }
};

// AVERAGE MARKET PRICES (Baseline fallback)
export const AVERAGE_MARKET_PRICES = {
    'Radish (Mooli)': 180,
    'Fenugreek (Methi)': 200,
    'Mustard (Sarson)': 160,
    'Coriander (Dhania)': 220,
    'Amaranth (Chaulai)': 190,
    'Sunflower': 250,
    'Peas': 150,
    'Broccoli': 300,
    'Lettuce': 150,
    'Basil (Tulsi)': 400,
    'Tomato': 60,
    'Cucumber': 40
};

// USER PREFERENCES (Global Settings)
// TODO: Move this to a proper Settings Context or DB in future
export const USER_SETTINGS = {
    TRAY_TYPE: 'SINGLE', // Options: 'SINGLE' or 'DOUBLE'
    REGION: 'DELHI_NCR'  // Affects humidity warnings
};

// Manual Observation Mappings (Heuristic Engine)
export const MANUAL_PATTERNS = {
    NUTRIENT_STRENGTH: {
        'LOW': { ec: 0.8, label: 'Light Feed (Seedlings)' },
        'MEDIUM': { ec: 1.5, label: 'Standard Feed (Growth)' },
        'HIGH': { ec: 2.2, label: 'Heavy Feed (Fruiting)' }
    },
    AIR_QUALITY: {
        'DRY': { humidity: 40, label: 'Dry / Crisp Air' },
        'COMFORTABLE': { humidity: 60, label: 'Comfortable' },
        'MUGGY': { humidity: 85, label: 'Muggy / Sticky / Humid' }
    },
    WATER_TEMPERATURE: {
        'COLD': { temp: 18, label: 'Cold (Chilled)' },
        'COOL': { temp: 22, label: 'Cool (Ideal)' },
        'WARM': { temp: 28, label: 'Warm (Bath water)' }
    }
};

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
        'Kale', 'Swiss Chard', 'Arugula', 'Wheatgrass',
        'Beetroot', 'Carrot'
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
        'Rice', 'Corn'
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
 * @param {number} dailyLogLightHours - Hours of light logged today
 * @param {number|null} currentHumidity - Current humidity from sensor/input
 * @param {string|null} trayWeightStatus - 'LIGHT', 'NORMAL', 'HEAVY'
 * @param {string} fanStatus - 'ON' or 'OFF' (Optional)
 * @returns {Object} { age, watering, lighting, alerts } with icons and tips
 */
export function getDailyTaskAdvice(batch, dailyLogLightHours = 0, currentHumidity = null, trayWeightStatus = null, fanStatus = 'ON', trayType = 'SINGLE') {
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

    // ==========================================
    // 1. SAFETY CHECKS (Overrides Routine)
    // ==========================================

    // CHECK A: High Humidity / Heavy Tray (Prevent Root Rot)
    const isHighHumidity = currentHumidity && currentHumidity > 75;
    const isTrayHeavy = trayWeightStatus === 'HEAVY' || trayWeightStatus === 'SOGGY' || trayWeightStatus === 'Bohot Bhaari (Soggy)';

    if (isHighHumidity || isTrayHeavy) {
        return {
            age,
            watering: {
                type: "⛔ SKIP WATERING",
                tip: isHighHumidity ? "Humidity is >75%. Watering now causes Rot." : "Tray is heavy. Plants have enough water.",
                icon: "🛑",
                action: "DO NOT WATER TODAY"
            },
            lighting: { status: "CHECK FANS", action: "Maximize airflow to dry soil", is_blackout: isBlackoutPhase },
            alerts: [{ type: 'danger', msg: isHighHumidity ? '🌧️ High Humidity Lockout: Watering skipped to prevent Damping Off.' : '⚖️ Soil is saturated. Skipping water cycle.' }]
        };
    }

    // CHECK B: Pre-Harvest Drying (1 Day Before Harvest)
    // Estimate Harvest Day (Simplistic for now, using GDD would be better but age is okay for alerts)
    const harvestAge = 7; // Default average for microgreens
    const daysToHarvest = harvestAge - age;

    if (daysToHarvest === 1) {
        return {
            age,
            watering: {
                type: "🛑 STOP WATERING (Dry Harvest Prep)",
                tip: "Harvest is tomorrow. Keep leaves dry for longer shelf life.",
                icon: "🍂",
                action: "NO WATER"
            },
            lighting: { status: "FINAL LIGHT", action: "Ensure leaves are dry", is_blackout: false },
            alerts: [{ type: 'info', msg: '🚜 Pre-Harvest Mode: Stop watering to ensure crisp, dry microgreens for harvest.' }]
        };
    }

    // CHECK C: "The Burp" (Air Exchange Reminder)
    // If lights are actively pushing photosynthesis (>4h) but fans are OFF, CO2 depletes.
    if (dailyLogLightHours > 4 && fanStatus === 'OFF' && !isBlackoutPhase) {
        alerts.push({
            type: 'warning',
            msg: '🌬️ The Burp Needed: Plants are starving for CO2. Open windows or turn on fans for 10 mins.'
        });
    }

    // ==========================================
    // 2. ROUTINE LOGIC
    // ==========================================

    // Phase 1: Blackout (Germination)
    if (isBlackoutPhase) {
        watering = { type: "Spray / Misting", tip: "Keep seeds moist, not soaking. Light misting twice a day.", icon: "🚿" };
        lighting = { status: "BLACKOUT MODE", action: "Cover with tray + 1kg Weight", is_blackout: true };

        // Smart Alert: If user gave light during blackout
        if (dailyLogLightHours > 0) {
            alerts.push({ type: 'danger', msg: `🚨 ERROR: It's Day ${age} (Blackout). You gave ${dailyLogLightHours} hrs light. Seeds need TOTAL DARKNESS!` });
        }
    }
    // Phase 2: Growth (Light Phase)
    else {
        // PRACTICAL LOGIC: Single vs Double Tray
        if (trayType === 'SINGLE') {
            watering = {
                type: "📥 Tub Method (Dip & Lift)",
                tip: "Dip tray in water tub for 15-20 mins. Lift when heavy.",
                icon: "quarantine", // Using closest available icon
                reason: "Single trays cannot hold bottom water. Dip prevents leaf mold."
            };
        } else {
            watering = {
                type: "📥 Bottom Watering (Reservoir)",
                tip: "Pour 300-500ml in bottom tray. Drain excess after 45 mins.",
                icon: "📥",
                reason: "Standard method for double trays."
            };
        }

        lighting = { status: "LIGHT PHASE", action: "Ensure 16 hrs Light", is_blackout: false };

        // Smart Alert: If light is too low for growth
        if (dailyLogLightHours > 0 && dailyLogLightHours < 12) {
            alerts.push({ type: 'warning', msg: `⚠️ Low Light: Day ${age} needs 16 hours benchmark. You only logged ${dailyLogLightHours} hours.` });
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
    // MICROGREENS (Short cycle)
    'Radish (Mooli)': 150,
    'Fenugreek (Methi)': 200,
    'Mustard (Sarson)': 180,
    'Coriander (Dhania)': 250,
    'Amaranth (Chaulai)': 220,
    'Sunflower': 200,
    'Peas': 240,
    'Broccoli': 200,
    'Wheatgrass': 150,
    'Beetroot': 220,

    // HYDROPONICS (Full cycle)
    'Lettuce': 700,
    'Spinach (Palak)': 650,
    'Basil (Tulsi)': 900,
    'Mint (Pudina)': 800,
    'Tomato': 1750,
    'Cucumber': 1200,
    'Capsicum (Shimla Mirch)': 1600,
    'Strawberry': 1500,
    'Eggplant (Brinjal)': 1800,
    'Chilli': 1600
};

export const CROP_THRESHOLDS = {
    // MICROGREENS
    'Radish (Mooli)': { ph: [5.5, 6.5], ec: [1.2, 1.8], temp: [18, 24] },
    'Fenugreek (Methi)': { ph: [6.0, 7.0], ec: [1.0, 1.6], temp: [15, 25] },
    'Mustard (Sarson)': { ph: [6.0, 7.0], ec: [1.2, 1.8], temp: [15, 25] },
    'Coriander (Dhania)': { ph: [6.0, 7.0], ec: [1.0, 1.6], temp: [15, 25] },
    'Amaranth (Chaulai)': { ph: [6.0, 7.5], ec: [1.5, 2.5], temp: [20, 28] },
    'Sunflower': { ph: [6.0, 7.5], ec: [1.2, 1.8], temp: [20, 24] },
    'Peas': { ph: [6.0, 7.0], ec: [1.2, 1.8], temp: [15, 20] },
    'Broccoli': { ph: [6.0, 7.0], ec: [1.5, 2.5], temp: [15, 20] },
    'Wheatgrass': { ph: [6.0, 7.0], ec: [1.0, 1.5], temp: [18, 24] },
    'Beetroot': { ph: [6.0, 7.0], ec: [1.5, 2.5], temp: [18, 24] },

    // HYDROPONICS
    'Lettuce': { ph: [5.5, 6.2], ec: [1.2, 1.8], temp: [18, 22] },
    'Spinach (Palak)': { ph: [6.0, 7.0], ec: [1.5, 2.3], temp: [15, 20] },
    'Basil (Tulsi)': { ph: [5.5, 6.5], ec: [1.0, 1.6], temp: [20, 30] },
    'Mint (Pudina)': { ph: [5.5, 6.5], ec: [1.2, 1.8], temp: [18, 24] },
    'Tomato': { ph: [6.0, 6.5], ec: [2.0, 3.5], temp: [22, 28] },
    'Cucumber': { ph: [5.8, 6.0], ec: [1.8, 2.5], temp: [22, 28] },
    'Capsicum (Shimla Mirch)': { ph: [5.8, 6.2], ec: [1.8, 2.8], temp: [22, 30] },
    'Strawberry': { ph: [5.5, 6.2], ec: [1.5, 2.5], temp: [18, 24] },
    'Eggplant (Brinjal)': { ph: [5.8, 6.5], ec: [2.0, 3.0], temp: [22, 30] },
    'Chilli': { ph: [5.8, 6.5], ec: [1.8, 2.5], temp: [22, 32] }
};

export function predictHarvestByGDD(tempLogs, cropType = 'Lettuce', sowingDate = null) {
    const targetGDD = GDD_TARGETS[cropType] || 700;

    if (!tempLogs || tempLogs.length === 0) {
        return {
            crop_type: cropType,
            target_gdd: targetGDD,
            current_gdd: 0,
            progress_percent: 0,
            remaining_gdd: targetGDD,
            estimated_days_to_harvest: null,
            status: 'NEW CROP',
            recommendation: 'Waiting for first daily log to calculate thermal progress.'
        };
    }

    let cumulativeGDD = 0;
    const loggedDates = new Set();

    // 1. Accumulate real logs
    tempLogs.forEach(log => {
        if (sowingDate && new Date(log.created_at) < new Date(sowingDate)) return;
        const logDate = new Date(log.created_at).toISOString().split('T')[0];
        loggedDates.add(logDate);

        const dailyGDD = calculateDailyGDD(log.tMax || log.temp_max || log.temp, log.tMin || log.temp_min || log.temp);
        cumulativeGDD += dailyGDD;
    });

    // 2. GHOST LOG LOGIC: Interpolate missing days
    if (sowingDate) {
        const start = new Date(sowingDate);
        const end = new Date();
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const missingDays = totalDays - loggedDates.size;

        if (missingDays > 0) {
            // Use average GDD of logged days as the estimate for missing days
            // If no logs, fallback to a safe baseline (e.g. 15 GDD for standard climate)
            const avgGDD = loggedDates.size > 0 ? (cumulativeGDD / loggedDates.size) : 15;
            cumulativeGDD += (avgGDD * missingDays);
        }
    }

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
 * @param {string} cropName - Name of the crop for context
 * @returns {Array<Object>} Array of high-priority alerts
 */
export function generateContextAwareAlerts(sensorData, cropName = 'Lettuce') {
    const thresholds = CROP_THRESHOLDS[cropName] || CROP_THRESHOLDS['Lettuce'];
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
    const [minPh, maxPh] = thresholds.ph;
    if (ph && (ph < (minPh - 0.2) || ph > (maxPh + 0.2))) {
        const issue = ph < minPh ? `too low (<${minPh})` : `too high (>${maxPh})`;

        // CUSTOM RULE: pH High Auto-Correction Advisor
        if (ph > 6.5) {
            alerts.push({
                priority: 'CRITICAL',
                title: '⚗️ Smart Advisor: pH High Detected',
                context: `pH level is ${ph}. This blocks Iron/Zinc uptake.`,
                root_cause: 'Natural pH drift or nutrient consumption.',
                immediate_action: 'Recommendation: Add 5ml Phosphoric Acid to lower pH.',
                why_this_matters: 'High pH causes "Locked-out" nutrients. Your plants are hungry but cannot eat.'
            });
        } else {
            alerts.push({
                priority: 'MEDIUM',
                title: `⚗️ pH Drift: ${cropName} Nutrient Lockout`,
                context: `pH is ${ph} (${issue}). Nutrient solubility for ${cropName} is compromised.`,
                root_cause: ph < minPh
                    ? 'Acidic conditions increase certain minerals to toxic levels.'
                    : 'Alkaline conditions precipitate Iron and Zinc into forms roots cannot drink.',
                immediate_action: `Target pH: ${minPh}-${maxPh}. Adjust solution accordingly.`,
                why_this_matters: 'Nutrient lockout causes deficiency even when fertilizer is present. Blocks growth.'
            });
        }
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

    // ========================================
    // ALERT 6: Log Data Gap (Catch-up Needed)
    // Triggered when active batches are missing daily logs
    // ========================================
    if (sensorData.needsCatchup && sensorData.missingDays > 0) {
        alerts.push({
            priority: 'HIGH',
            title: '📅 Catch-up Needed: Missing Log Days',
            context: `We detected a ${sensorData.missingDays}-day gap since you sowed your ${cropName} batch.`,
            root_cause: 'Consistency is key for Farm Health accuracy and GDD tracking.',
            immediate_action: 'Please log a "Catch-up" entry in the Daily Tracker to summarize the missing period.',
            why_this_matters: 'Without daily logs, the health engine cannot accurately predict harvest dates or detect early signs of stress.'
        });
    }

    return alerts;
}

// ============================================================
// BONUS: DAILY LIGHT INTEGRAL (DLI) CALCULATOR
// ============================================================



// ============================================================
// 7. REAL-TIME FARM HEALTH CALCULATOR
// ============================================================

/**
 * Calculate overall farm health score (0-100) based on sensor inputs.
 * @param {Object} logs - The latest daily log { temp, humidity, ph, ec }
 * @returns {Object} { score: number, reasons: string[] }
 */
/**
 * cGrow ALGORITHMS: Lighting Compliance (Blackout Phase)
 */
export function checkLightingCompliance(log, batchAge, sourceType = 'microgreens') {
    if (!log || batchAge === undefined) return 'OK';

    const lightHours = parseFloat(log.light_hours || log.light_hours_per_day || 0);

    // Phase 1: Blackout (Only for Microgreens, Days 0-3)
    // Hydroponics is EXEMPT from this phase as it does not require a blackout period.
    if (sourceType === 'microgreens' && batchAge <= 3) {
        if (lightHours > 0) return 'DANGER'; // STRICT: No light allowed
        return 'OK';
    }

    // Phase 2: Active Growth (Day 0+ for Hydro, Day 4+ for MG)
    // Hydro expects 12-16 hours from Day 0.
    if (lightHours < 12) return 'WARN'; // Benchmark is 16h, <12 is warning
    return 'OK';
}

/**
 * Calculate overall farm health score (0-100) based on cGrow Protocols.
 * @param {Object} logs - The latest daily log
 * @param {number} batchAge - (Optional) Days since sowing/planting
 * @param {string} sourceType - 'hydroponics' | 'microgreens'
 * @param {string} cropName - (Optional) Name of the crop for specific thresholds
 * @returns {Object} { score: number, reasons: string[], details: Object }
 */
export function calculateFarmHealth(logs, batchAge = 99, sourceType = 'hydroponics', cropName = 'Lettuce') {
    if (!logs) return { score: 100, reasons: [], details: { light: 'OK', air: 'OK', nutrient: 'OK' } };

    let score = 100;
    const reasons = [];
    const details = {
        light: 'OK',
        air: 'OK',
        nutrient: 'OK'
    };

    const temp = logs.temp || 24;
    const hum = logs.humidity || 60;
    const ph = parseFloat(logs.ph);
    const ec = parseFloat(logs.ec);
    const waterStatus = logs.watering_status; // For Microgreens

    // Get Crop-Specific Thresholds
    const thresholds = CROP_THRESHOLDS[cropName] || (sourceType === 'hydroponics' ? CROP_THRESHOLDS['Lettuce'] : CROP_THRESHOLDS['Radish (Mooli)']);

    // 1. LIGHTING CHECK (Weighted: 30%)
    const lightStatus = checkLightingCompliance(logs, batchAge, sourceType);
    details.light = lightStatus;

    if (lightStatus === 'DANGER') {
        score -= 30;
        reasons.push(batchAge <= 3 && sourceType === 'microgreens' ? 'CRITICAL: Light detected during Blackout Phase!' : 'Severe lighting issue');
    } else if (lightStatus === 'WARN') {
        score -= 10;
        reasons.push('Low Light: <12 hours (Target: 16h)');
    }

    // 2. AIR / VPD CHECK (Weighted: 30%)
    const vpdRes = calculateVPD(temp, hum);
    if (vpdRes.status.includes('DANGER')) {
        score -= 30; // Increased penalty per protocol
        details.air = 'DANGER';
        reasons.push('VPD Danger: ' + vpdRes.recommendation);
    } else if (vpdRes.status.includes('CAUTION')) {
        score -= 10;
        details.air = 'WARN';
        reasons.push('VPD Warning: ' + vpdRes.recommendation);
    }

    // 3. NUTRIENT & SYSTEM TYPE CHECK (Weighted: 40%) - Crop & System Aware
    if (sourceType === 'hydroponics') {
        // Base Nutrient Check (pH/EC)
        if (ph && ec) {
            const [minPh, maxPh] = thresholds.ph;
            const [minEc, maxEc] = thresholds.ec;

            if (ph > 6.5) {
                score -= 40;
                details.nutrient = 'DANGER';
                reasons.push(`pH ${ph} is HIGH: Add 5ml Phosphoric Acid (Expert Advice)`);
            } else if (ph < (minPh - 0.5) || ph > (maxPh + 0.5) || ec > (maxEc + 0.5)) {
                score -= 40;
                details.nutrient = 'DANGER';
                reasons.push(`CRITICAL: pH ${ph} / EC ${ec} out of safe range for ${cropName}!`);
            } else if ((ph < minPh || ph > maxPh) || (ec < minEc || ec > maxEc)) {
                score -= 15;
                details.nutrient = 'WARN';
                reasons.push(`Nutrient warning: ${cropName} needs pH ${minPh}-${maxPh}, EC ${minEc}-${maxEc}`);
            }
        }

        // Sub-Type Specific Intelligence
        const subType = logs.system_type || logs.systemSubType || 'NFT';

        // NFT (Active Flow) Logic
        if (subType === 'NFT') {
            const pumpStatus = logs.pump_status || 'ON';
            const waterFlow = logs.water_flow || 'Normal';
            if (pumpStatus === 'OFF' || waterFlow === 'Blocked') {
                score -= 60; // Overrides base nutrient score if pump is off
                details.nutrient = 'DANGER';
                reasons.push(`🚨 NFT CRITICAL: Pump is ${pumpStatus} / Flow is ${waterFlow}. Plants die within 2 hours in NFT!`);
            }
        }

        // DWC (Static Deep Water) Logic
        if (subType === 'DWC') {
            const waterTemp = parseFloat(logs.water_temp || logs.waterTemp || temp);
            const airStones = logs.air_stones || 'Bubbling';
            if (waterTemp > 26) {
                score -= 40;
                details.nutrient = 'DANGER';
                reasons.push(`🔥 DWC DANGER: Water Temp is ${waterTemp}°C. Root rot risk is critical above 26°C!`);
            }
            if (airStones === 'Not Bubbling') {
                score -= 30;
                details.nutrient = 'WARN';
                reasons.push('🫧 DWC WARNING: Air stones are not bubbling. Oxygen levels are dropping.');
            }
        }

        // Ebb & Flow (Pulse System) Logic
        if (subType === 'Ebb & Flow') {
            const hydrationStress = logs.hydration_stress || false;
            const lastCycleTime = parseFloat(logs.last_cycle_time || 0);
            if (hydrationStress || lastCycleTime > 4) {
                score -= 25;
                details.nutrient = 'WARN';
                reasons.push('⏳ EBB & FLOW: Hydration Stress detected. Last flood cycle was >4 hours ago.');
            }
        }
    } else {
        // Microgreens Specific Logic
        details.isManualEstimate = true;
        const visual = logs.visual_check || '';
        if (visual.includes('Yellowing') || visual.includes('Pale')) {
            score -= 20;
            details.nutrient = 'WARN';
            reasons.push('Leaf discoloration detected.');
        }

        if (waterStatus === 'Dry' || waterStatus === 'Under-watered') {
            score -= 25;
            details.nutrient = 'DANGER';
            reasons.push('CRITICAL: Trays are dry - immediate bottom watering required!');
        }

        // IoT Hardware Link: Ventilation Bonus
        if (logs.fan_status === 'ON' || logs.fan_status === true) {
            score += 5;
            reasons.push('🌬️ IoT Active: Air circulation fan is running.');
        }
    }

    // 5. TEMP EXTREMES (Crop Aware)
    const [minTemp, maxTemp] = thresholds.temp;
    if (temp > (maxTemp + 5) || temp < (minTemp - 5)) {
        score -= 20;
        reasons.push(`EXTREME TEMP: ${temp}°C is critical for ${cropName} (Ideal: ${minTemp}-${maxTemp}°C)`);
        details.air = 'DANGER';
    } else if (temp > maxTemp || temp < minTemp) {
        score -= 10;
        reasons.push(`Temp Alert: ${temp}°C (Outside ${cropName} optimal: ${minTemp}-${maxTemp}°C)`);
        details.air = 'WARN';
    }

    // 6. METABOLIC BOOST: INTERVENTIONS
    if (logs.intervention_actions && logs.intervention_actions !== 'NO_ACTION') {
        score += 10;
        reasons.push("⚡ Intervention Boost: Added +10 health for proactive maintenance.");
    }

    // 7. LOG CONSISTENCY PENALTY
    if (logs.isBackfilled) {
        score -= 5;
        reasons.push("⚠️ Log Gap: Score adjusted due to estimated weather data for missing days.");
    }

    // CAP SCORE: If any Red Dot (DANGER), Max Score = 70.
    if (details.light === 'DANGER' || details.air === 'DANGER' || details.nutrient === 'DANGER') {
        score = Math.min(score, 70);
    } else {
        score = Math.min(score, 100);
    }

    return {
        score: Math.min(100, Math.max(0, Math.round(score))),
        reasons,
        details
    };
}

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



// Consolidated exports at end of file
// ============================================================
// 8. PREDICTIVE ANALYTICS ENGINE (TREND DETECTION)
// ============================================================

/**
 * Analyze trends in sensor data to predict future risks
 * Uses Linear Regression slope to determine drift direction and speed
 * 
 * @param {Array<Object>} logs - Array of log objects sorted by date (newest first)
 * @param {String} metricKey - Key to analyze (e.g., 'ph', 'ec', 'vpd_kpa')
 * @returns {Object} { trend: 'STABLE'|'RISING'|'FALLING', risk: 'NONE'|'HIGH', message }
 */
export function analyzeTrend(logs, metricKey) {
    // Need at least 3 points for a meaningful trend
    if (!logs || logs.length < 3) return { trend: 'INSUFFICIENT_DATA', risk: 'NONE' };

    // extracting values, filtering out nulls, taking latest 5
    const values = logs
        .map((log, idx) => ({
            y: parseFloat(log[metricKey] || (log.details && log.details[metricKey])),
            x: idx
        })) // x=0 is newest
        .filter(p => !isNaN(p.y))
        .slice(0, 5);

    if (values.length < 3) return { trend: 'INSUFFICIENT_DATA', risk: 'NONE' };

    // Simple Linear Regression (y = mx + b)
    // We are looking for 'm' (slope). data is reverse chronological (x=0 is now, x=4 is past)
    // So a POSITIVE slope in this coordinate system means values are DECREASING over time (higher in past, lower now)
    // Wait, let's normalize: x=0 (oldest), x=4 (newest) to make intuition standard.

    values.reverse(); // Now index 0 is oldest, index N is newest.
    // Re-map x to 0..N
    const points = values.map((p, i) => ({ x: i, y: p.y }));

    const n = points.length;
    const sumX = points.reduce((acc, p) => acc + p.x, 0);
    const sumY = points.reduce((acc, p) => acc + p.y, 0);
    const sumXY = points.reduce((acc, p) => acc + (p.x * p.y), 0);
    const sumXX = points.reduce((acc, p) => acc + (p.x * p.x), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Thresholds for "Significant Drift" (per day/log)
    const DRIFT_THRESHOLDS = {
        'ph': 0.1,      // 0.1 pH per day is fast
        'ec': 0.2,      // 0.2 mS per day is fast
        'vpd_kpa': 0.15 // 0.15 kPa per day
    };

    const threshold = DRIFT_THRESHOLDS[metricKey] || 0.1;
    const currentVal = points[points.length - 1].y;

    let status = 'STABLE';
    let risk = 'NONE';
    let msg = '';

    if (Math.abs(slope) < threshold / 2) {
        return { trend: 'STABLE', slope: slope.toFixed(3), risk: 'NONE' };
    }

    if (slope > threshold) {
        status = 'RISING FAST';
        // Contextual Risk Analysis
        if (metricKey === 'ph' && currentVal > 6.2) {
            risk = 'HIGH';
            msg = '📈 pH is drifting UP rapidly. Lockout imminent.';
        } else if (metricKey === 'ec' && currentVal > 2.0) {
            risk = 'HIGH';
            msg = '📈 EC is spiking. Salt buildup detected.';
        } else if (metricKey === 'vpd_kpa' && currentVal > 1.2) {
            risk = 'HIGH';
            msg = '📈 Air is getting drier. Watch for wilting.';
        }
    } else if (slope < -threshold) {
        status = 'FALLING FAST';
        // Contextual Risk Analysis
        if (metricKey === 'ph' && currentVal < 5.8) {
            risk = 'HIGH';
            msg = '📉 pH is crashing. Acidic toxicity risk.';
        } else if (metricKey === 'ec' && currentVal < 1.0) {
            risk = 'HIGH';
            msg = '📉 EC is dropping. Plants are hungry.';
        }
    }

    return {
        trend: status,
        slope: slope.toFixed(3),
        risk,
        message: msg,
        currentValue: currentVal
    };
}

/**
 * Determine the specific action needed for a microgreens batch based on its age and crop.
 */
/**
 * Determine the specific action needed for a microgreens batch based on its age and crop.
 * Uses PRIORITY HIERARCHY (Return Early Rule) to prevent logic conflicts.
 * 
 * Hierarchy:
 * 1. 🔴 CRITICAL (Safety/Loss) - Density Risk, Mold, Harvest Overdue
 * 2. 🟠 HIGH (Yield Impact) - Under-seeding, Flip Day
 * 3. 🟢 ROUTINE (Daily Operations) - Blackout, Lights, Water
 */
export function getMicrogreensAction(batchAge, cropName, densityAudit = null) {
    if (batchAge === undefined) return { action: 'No Data', priority: 'LOW', description: 'Ensure sowing date is set.' };

    const name = cropName || 'Generic';

    // ============================================================
    // 1. 🔴 CRITICAL PRIORITY (Stop Everything Else)
    // ============================================================

    // CHECK A: Density / Mold Risk (From Audit)
    if (densityAudit && densityAudit.status === 'CRITICAL_OVER') {
        return {
            action: '🔴 HIGH DENSITY RISK',
            priority: 'CRITICAL',
            description: `${densityAudit.message}. Risk of Mold & Rot. Monitor airflow closely or thin out seeds if possible.`
        };
    }

    // CHECK B: Harvest Overdue (Bolting Risk)
    const targetGDD = GDD_TARGETS[name] || 200;
    const estHarvestDay = Math.round(targetGDD / 20) + 1;

    if (batchAge > estHarvestDay + 3) {
        return {
            action: '☠️ OVERDUE: HARVEST NOW',
            priority: 'CRITICAL',
            description: `Crop is ${batchAge - estHarvestDay} days past maturity. Flavor is turning bitter/spicy. Cut immediately.`
        };
    }

    // ============================================================
    // 2. 🟠 HIGH PRIORITY (Yield Critical Moments)
    // ============================================================

    // CHECK C: The "Flip" Day (Transition from Blackout)
    if (batchAge === 4) {
        return {
            action: '🔄 FLIP & UNCOVER',
            priority: 'HIGH',
            description: 'CRITICAL DAY: Remove weights and flip top tray. If stems are upright and yellow, expose to light.'
        };
    }

    // CHECK D: Under-Seeding Warning (Yield Loss)
    if (densityAudit && densityAudit.status === 'WARNING_UNDER') {
        return {
            action: '⚠️ Low Yield Warning',
            priority: 'HIGH',
            description: `Density is low (${densityAudit.message}). Maximize light to encourage what little growth you have.`
        };
    }

    // ============================================================
    // 3. 🟢 ROUTINE PRIORITY (Standard Operations)
    // ============================================================

    // Stage 1: Blackout (Sowing to Day 3)
    if (batchAge <= 3) {
        return {
            action: '🌑 Blackout & Weight',
            priority: 'MEDIUM',
            description: 'Keep weighted and covered. Darkness strengthens roots. Mist only if dry.'
        };
    }

    // Stage 3: Light & Bottom Water (Day 5 to Harvest - 1)
    if (batchAge >= 5 && batchAge < estHarvestDay) {
        return {
            action: '☀️ Light & Bottom Water',
            priority: 'MEDIUM',
            description: 'Ensure 16h light. Water from bottom only to prevent mold. Check for white roots (healthy).'
        };
    }

    // Stage 4: Harvest Window (On Time)
    if (batchAge >= estHarvestDay) {
        return {
            action: '✂️ Ready to Harvest',
            priority: 'HIGH',
            description: 'Perfect Maturity. True leaves are forming. Harvest now for best quality.'
        };
    }

    return {
        action: '✅ Monitor Growth',
        priority: 'LOW',
        description: 'Conditions are stable. Keep monitoring VPD and Temperature.'
    };
}


// ============================================================
// 7. BIOFILTER IMPACT CALCULATOR (Active Botanical Biofiltration)
// ============================================================

/**
 * Calculate Air Quality Impact based on Active Biofilters
 * Based on Source: Active Botanical Biofiltration in Built Environment
 * 
 * Research shows that Active Green Walls (fan-driven) have CADR of 25-100 m³/h per module
 * Microgreens + Active Airflow = ~60-80% VOC removal efficiency
 * 
 * @param {number} activeBatches - Number of active growing trays/batches
 * @param {string} fanSpeedMode - Fan speed mode ('HIGH', 'MEDIUM', 'LOW', 'OFF')
 * @returns {Object} Air quality impact metrics
 */
export const calculateAirQualityImpact = (activeBatches, fanSpeedMode = 'MEDIUM') => {
    // Average CADR per tray based on active airflow (fan-driven)
    const BASE_CADR_PER_TRAY = 15; // m³/hour clean air per tray

    // Fan Speed Multiplier (High speed = more filtration but less residence time)
    // Optimal Residence Time (EBRT) is 10s - 2min according to research
    let fanMultiplier = 1.0;
    switch (fanSpeedMode) {
        case 'HIGH':
            fanMultiplier = 1.5;
            break;
        case 'MEDIUM':
            fanMultiplier = 1.0;
            break;
        case 'LOW':
            fanMultiplier = 0.6;
            break;
        case 'OFF':
            fanMultiplier = 0.1; // Passive filtration only
            break;
        default:
            fanMultiplier = 1.0;
    }

    // Calculate Total Clean Air Delivery Rate
    const totalCleanAir = activeBatches * BASE_CADR_PER_TRAY * fanMultiplier;

    // VOC Removal Efficiency Estimate
    // Microgreens + Active Airflow = ~60-80% VOC removal
    // Passive plants = <10% VOC removal
    let removalEfficiency;
    let vocStatus;

    if (fanSpeedMode === 'HIGH' || fanSpeedMode === 'MEDIUM') {
        removalEfficiency = fanSpeedMode === 'HIGH' ? 80 : 70;
        vocStatus = 'High (~' + removalEfficiency + '%)';
    } else if (fanSpeedMode === 'LOW') {
        removalEfficiency = 40;
        vocStatus = 'Medium (~40%)';
    } else {
        removalEfficiency = 10;
        vocStatus = 'Passive (<10%)';
    }

    // Generate user-friendly message
    let message;
    if (totalCleanAir > 50) {
        message = "🌱 Excellent Biofiltration: Air is being actively purified!";
    } else if (totalCleanAir > 20) {
        message = "✅ Good Filtration: Moderate air quality improvement.";
    } else {
        message = "⚠️ Low Filtration: Increase fan speed or add trays.";
    }

    return {
        cleanAirVolume: totalCleanAir.toFixed(1), // m³/hour
        cleanAirVolumeDaily: (totalCleanAir * 24).toFixed(0), // m³/day
        vocRemovalEfficiency: removalEfficiency,
        vocStatus: vocStatus,
        message: message,
        activeBatches: activeBatches,
        fanMode: fanSpeedMode,
        recommendation: totalCleanAir < 30
            ? "Consider increasing fan speed or adding more trays for better air purification."
            : "Your system is providing good air quality benefits. Maintain current setup."
    };
};

// ============================================================
// 8. MYCOLOGY INTELLIGENCE (Mushroom Farm Library)
// ============================================================

export const MUSHROOM_LIBRARY = {
    'Oyster': {
        temp: { optimal: [20, 28], alert: [15, 32] },
        humidity: { optimal: [80, 90], alert: [70, 95] },
        co2: { spawn_run: 2000, fruiting: 800 }, // ppm
        substrate: 'Paddy Straw / Wheat Straw',
        casing: false,
        light: 'Low (Indirect)',
        cycle_days: 25
    },
    'Milky': {
        temp: { optimal: [30, 35], alert: [25, 40] },
        humidity: { optimal: [85, 90], alert: [75, 95] },
        co2: { spawn_run: 1500, fruiting: 600 },
        substrate: 'Wheat Straw',
        casing: true,
        casing_recipe: '50% Cocopeat + 50% Vermiculite',
        cycle_days: 45
    },
    'Button': {
        temp: { optimal: [18, 22], alert: [15, 25] },
        humidity: { optimal: [85, 90], alert: [80, 95] },
        co2: { spawn_run: 5000, fruiting: 1000 },
        substrate: 'Compost (Pasteurized)',
        casing: true,
        casing_recipe: 'Cocopeat + Vermiculite (1:1)',
        cycle_days: 60
    },
    'Shiitake': {
        temp: { optimal: [15, 24], alert: [10, 28] },
        humidity: { optimal: [80, 85], alert: [70, 90] },
        co2: { spawn_run: 3000, fruiting: 1000 },
        substrate: 'Hardwood Sawdust + Bran (80:20)',
        casing: false,
        cycle_days: 120
    }
};

export const MUSHROOM_STAGES = [
    { id: 'spawn_run', label: 'Spawn Run', days: 15, color: 'indigo' },
    { id: 'pinhead', label: 'Pinhead Initiation', days: 5, color: 'cyan' },
    { id: 'fruiting', label: 'Fruiting', days: 7, color: 'emerald' },
    { id: 'harvest', label: 'Harvest Ready', days: 3, color: 'amber' }
];

/**
 * Substrate & Casing Calculator
 * @param {string} mushroomType - Oyster, Milky, etc.
 * @param {number} bagCount - Number of grow bags
 * @returns {Object} Required materials breakdown
 */
export function calculateMushroomSubstrate(mushroomType, bagCount) {
    const type = mushroomType || 'Oyster';
    const count = parseInt(bagCount) || 0;

    // Baselines (approximate per bag)
    const strawPerBag = 1.0; // kg dry straw
    const spawnPerBag = 0.1; // kg spawn (10% rate)
    const cocopeatPerBag = 0.5; // kg for casing (if applicable)

    const result = {
        mainSubstrate: {
            item: MUSHROOM_LIBRARY[type]?.substrate || 'Straw',
            quantity: (strawPerBag * count).toFixed(1),
            unit: 'kg'
        },
        spawn: {
            quantity: (spawnPerBag * count).toFixed(2),
            unit: 'kg'
        }
    };

    if (MUSHROOM_LIBRARY[type]?.casing) {
        result.casing = {
            recipe: MUSHROOM_LIBRARY[type].casing_recipe,
            cocopeat: (cocopeatPerBag * count).toFixed(1),
            unit: 'kg'
        };
    }

    return result;
}

// ==========================================
// DENSITY AUDITOR: SCIENTIFIC SEEDING DATA
// Sources: Johnny's Selected Seeds [Source 358, 359] & Profit Analysis [Source 771]
// Units: Grams per 10x20 Inch Tray
// ==========================================
export const OPTIMAL_SEED_DENSITY = {
    // --- EXISTING ---
    'Radish': { min: 35, ideal: 40, max: 45 },      // 40g is standard [Source 895]
    'Broccoli': { min: 18, ideal: 20, max: 25 },    // 20g is standard
    'Sunflower': { min: 110, ideal: 120, max: 130 }, // 120g is standard
    'Pea': { min: 280, ideal: 300, max: 320 },      // 300g is standard [Source 895]
    'Mustard': { min: 8, ideal: 10, max: 12 },      // Mustard seeds are tiny
    'Wheatgrass': { min: 150, ideal: 180, max: 200 },

    // --- NEW ADDITIONS (15 More Crops) ---
    'Arugula': { min: 8, ideal: 10, max: 12 }, // Mucilaginous
    'Basil': { min: 4, ideal: 6, max: 8 },    // Specific expensive
    'Amaranth': { min: 6, ideal: 7.5, max: 9 }, // Tiny seeds
    'Beet': { min: 22, ideal: 25, max: 30 },  // Multigerm
    'Cilantro': { min: 25, ideal: 28, max: 35 }, // Split vs Whole issues
    'Kale': { min: 10, ideal: 12, max: 15 },
    'Kohlrabi': { min: 9, ideal: 10, max: 12 },
    'Cabbage': { min: 10, ideal: 11, max: 14 },
    'Pak Choi': { min: 9, ideal: 10.5, max: 12.5 },
    'Swiss Chard': { min: 28, ideal: 31.5, max: 35 },
    'Cress': { min: 10, ideal: 11, max: 13 },
    'Dill': { min: 18, ideal: 20, max: 22 },
    'Fennel': { min: 18, ideal: 20, max: 22 },
    'Nasturtium': { min: 70, ideal: 80, max: 90 }, // Large/Espensive
    'Lettuce': { min: 8, ideal: 10, max: 12 }
};

/**
 * Check Seeding Density (The Density Auditor)
 * Prevents over-seeding (Profit Loss) and under-seeding (Yield Loss)
 */
export const checkSeedingDensity = (cropName, userSeedWeightGrams, numberOfTrays) => {
    const crop = OPTIMAL_SEED_DENSITY[cropName];

    // 1. Validation: Agar crop list mein nahi hai
    if (!crop) return {
        status: "UNKNOWN",
        message: "Crop density data not found.",
        color: "gray"
    };

    const userPerTray = userSeedWeightGrams / numberOfTrays;

    // Hard Seed Check (Soaking Reminder)
    const needsSoaking = ['Pea', 'Sunflower', 'Beet', 'Swiss Chard', 'Cilantro', 'Nasturtium'].includes(cropName);
    const soakingMsg = needsSoaking ? " 💧 Reminder: These seeds usually require 8-12hr soaking." : "";

    // 2. OVER-SEEDING LOGIC (Waste & Mold Risk)
    if (userPerTray > crop.max) {
        const wasteGrams = (userPerTray - crop.ideal) * numberOfTrays;
        const estLoss = Math.round(wasteGrams * 2.5); // Avg cost approx ₹2.5/g for premium seeds

        return {
            status: "CRITICAL_OVER",
            message: `🚨 High Density Detected: ${userPerTray.toFixed(1)}g/tray`,
            detail: `Recommended max is ${crop.max}g. You are wasting ~${wasteGrams.toFixed(1)}g of seeds.${soakingMsg}`,
            risk: "High risk of Mold, Stem Rot, and weak stems due to overcrowding.",
            financial_impact: `Estimated waste: ₹${estLoss}`,
            color: "red"
        };
    }

    // 3. UNDER-SEEDING LOGIC (Low Yield)
    if (userPerTray < crop.min) {
        return {
            status: "WARNING_UNDER",
            message: `⚠️ Low Density: ${userPerTray.toFixed(1)}g/tray`,
            detail: `Recommended min is ${crop.min}g. Your harvest weight will be low.`,
            risk: "Poor yield per tray. Waste of electricity/soil costs.",
            financial_impact: "Lower revenue per tray.",
            color: "orange"
        };
    }

    // 4. OPTIMAL ZONE
    return {
        status: "OPTIMAL",
        message: `✅ Perfect Density (${userPerTray.toFixed(1)}g/tray)`,
        detail: `Within scientific range (${crop.min}-${crop.max}g).${soakingMsg}`,
        color: "green"
    };
};
