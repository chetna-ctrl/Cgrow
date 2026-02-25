/**
 * Agri-OS Climate Intelligence Engine
 */

export const CLIMATE_PROFILES = {
    'Delhi': {
        peakSummerTemp: 45,
        minWinterTemp: 5,
        avgHumidity: 55,
        solarRadiation: 850, // W/m2
        coolingRequirement: 'High',
        heatingRequirement: 'Medium',
        recommendedAirChanges: 1.5 // per minute
    },
    'Bangalore': {
        peakSummerTemp: 34,
        minWinterTemp: 15,
        avgHumidity: 65,
        solarRadiation: 750,
        coolingRequirement: 'Low',
        heatingRequirement: 'None',
        recommendedAirChanges: 1.0
    },
    'Mumbai': {
        peakSummerTemp: 36,
        minWinterTemp: 22,
        avgHumidity: 80,
        solarRadiation: 700,
        coolingRequirement: 'Medium',
        heatingRequirement: 'None',
        recommendedAirChanges: 1.2
    }
};

export const calculateHVAC = (geometry, location = 'Delhi') => {
    const profile = CLIMATE_PROFILES[location] || CLIMATE_PROFILES['Delhi'];
    const { volume } = geometry;

    // 1. CFM (Cubic Feet per Minute) Requirement
    // Standard: Volume x AirChanges
    const requiredCFM = volume * profile.recommendedAirChanges;

    // 2. Pad Size Requirement (Approx 1 sqft of pad per 350-400 CFM)
    const padAreaSqft = requiredCFM / 380;

    // 3. Operational Load Factor (0.0 to 1.0)
    // Depends on ambient vs target temp.
    const month = new Date().getMonth();
    let loadFactor = 0.6;
    if (location === 'Delhi' && (month >= 4 && month <= 6)) loadFactor = 1.0; // Peak Summer
    if (location === 'Delhi' && (month >= 11 || month <= 1)) loadFactor = 0.2; // Winter

    return {
        requiredCFM,
        padAreaSqft,
        loadFactor,
        profile
    };
};
