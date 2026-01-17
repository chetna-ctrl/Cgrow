/**
 * Astro Utils - Lunar Cycle Calculator
 * Used for traditional agricultural planning (Lunar Farming)
 */

export const LUNAR_PHASES = {
    NEW_MOON: 'New Moon',
    WAXING_CRESCENT: 'Waxing Crescent',
    FIRST_QUARTER: 'First Quarter',
    WAXING_GIBBOUS: 'Waxing Gibbous',
    FULL_MOON: 'Full Moon',
    WANING_GIBBOUS: 'Waning Gibbous',
    LAST_QUARTER: 'Last Quarter',
    WANING_CRESCENT: 'Waning Crescent'
};

/**
 * Calculates current lunar phase
 * Returns Phase Name and "Sap Flow" activity level
 */
export const getLunarPhase = (date = new Date()) => {
    const LUNAR_MONTH = 29.530588853;
    // Known New Moon: 2000-01-06 18:14 UTC
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');

    const msDiff = date.getTime() - knownNewMoon.getTime();
    const daysDiff = msDiff / (1000 * 60 * 60 * 24);
    const phaseValue = (daysDiff % LUNAR_MONTH) / LUNAR_MONTH;

    let phase, sapFlow, description;

    if (phaseValue < 0.03 || phaseValue > 0.97) {
        phase = LUNAR_PHASES.NEW_MOON;
        sapFlow = 'Low';
        description = 'Good for root crop maintenance and pruning.';
    } else if (phaseValue < 0.25) {
        phase = LUNAR_PHASES.WAXING_CRESCENT;
        sapFlow = 'Increasing';
        description = 'Excellent for sowing leafy greens (Lettuce, Spinach).';
    } else if (phaseValue < 0.47) {
        phase = LUNAR_PHASES.FIRST_QUARTER;
        sapFlow = 'High';
        description = 'Strongest growth boost for above-ground crops.';
    } else if (phaseValue < 0.53) {
        phase = LUNAR_PHASES.FULL_MOON;
        sapFlow = 'Maximum';
        description = 'Peak moisture uptake. Best for transplanting.';
    } else if (phaseValue < 0.75) {
        phase = LUNAR_PHASES.WANING_GIBBOUS;
        sapFlow = 'Decreasing';
        description = 'Focus on root development and harvesting.';
    } else if (phaseValue < 0.97) {
        phase = LUNAR_PHASES.LAST_QUARTER;
        sapFlow = 'Low';
        description = 'Lowest sap flow. Best for harvest and storage.';
    } else {
        phase = LUNAR_PHASES.NEW_MOON;
        sapFlow = 'Low';
        description = 'Rest period for the system.';
    }

    return {
        phase,
        sapFlow,
        description,
        isOptimalSowing: phaseValue > 0.03 && phaseValue < 0.5,
        isOptimalHarvest: phaseValue > 0.53
    };
};

/**
 * Get Lunar Agricultural Advice
 */
export const getLunarAdvice = (cropType) => {
    const { phase, description, isOptimalSowing, isOptimalHarvest } = getLunarPhase();

    if (cropType === 'microgreens') {
        return isOptimalSowing
            ? `🌕 ${phase}: Peak growth window. Sowing now will yield 15% better biomass.`
            : `🌙 ${phase}: Focus on harvest. Sap flow is moving to roots.`;
    }

    return description;
};
