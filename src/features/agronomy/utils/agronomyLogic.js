/**
 * cGrow Expert Agronomy Logic
 * Core biological calculations for plant health.
 */

// 1. VPD (Vapor Pressure Deficit) Calculation
// Returns VPD in kPa.
// Target Range: 0.8 - 1.2 kPa (Vegetative/Flowering)
export const calculateVPD = (tempC, rh) => {
    // Saturation Vapor Pressure (SVP)
    const svp = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));

    // Actual Vapor Pressure (AVP)
    const avp = svp * (rh / 100);

    // VPD
    return (svp - avp).toFixed(2); // kPa
};

export const getVPDStatus = (vpd) => {
    const val = parseFloat(vpd);
    if (val < 0.4) return { status: 'Dangerously Low', color: '#ef4444', advice: 'Risk of fungal rot. Increase ventilation.' };
    if (val < 0.8) return { status: 'Low (Under-transpiration)', color: '#f59e0b', advice: 'Reduce humidity.' };
    if (val <= 1.2) return { status: 'Perfect (Goldilocks Zone)', color: '#10b981', advice: 'Ideal for growth.' };
    if (val <= 1.6) return { status: 'High (Over-transpiration)', color: '#f59e0b', advice: 'Increase humidity or mist.' };
    return { status: 'Dangerously High', color: '#ef4444', advice: 'Stomata closing. Wilting risk.' };
};

// 2. GDD (Growing Degree Days)
// Base Temp depends on crop (e.g., Cool season = 5°C, Warm season = 10°C)
export const calculateGDD = (maxTemp, minTemp, baseTemp = 10) => {
    const avgTemp = (maxTemp + minTemp) / 2;
    const gdd = avgTemp - baseTemp;
    return gdd > 0 ? gdd.toFixed(1) : 0;
};

// 3. Nutrient Lockout Check
// Returns blocked nutrients based on pH
export const checkNutrientLockout = (pH) => {
    const blocked = [];

    // Acidic Lockout (pH < 5.5)
    if (pH < 5.0) blocked.push('Nitrogen (N)', 'Potassium (K)', 'Magnesium (Mg)', 'Calcium (Ca)');
    else if (pH < 5.5) blocked.push('Magnesium (Mg)', 'Calcium (Ca)');

    // Alkaline Lockout (pH > 6.5)
    if (pH > 7.5) blocked.push('Iron (Fe)', 'Manganese (Mn)', 'Phosphorus (P)', 'Boron (B)');
    else if (pH > 6.5) blocked.push('Iron (Fe) - Partial');

    return blocked.length > 0 ? blocked : null;
};
