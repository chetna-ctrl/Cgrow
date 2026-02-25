/**
 * Agri-OS Production & Yield Engine
 */

export const CROP_DATABASE = {
    'Lettuce': {
        type: 'Hydro',
        spacingCm: 20, // cm between plants
        cycleDays: 45,
        harvestWeightGm: 250,
        survivalRate: 0.92,
        category: 'Exotic Greens'
    },
    'Basil': {
        type: 'Hydro',
        spacingCm: 15,
        cycleDays: 35,
        harvestWeightGm: 150,
        survivalRate: 0.95,
        category: 'Herbs'
    },
    'Radish': {
        type: 'Micro',
        seedsPerTrayGm: 30,
        cycleDays: 10,
        harvestWeightGm: 250,
        survivalRate: 0.98,
        category: 'Microgreens'
    },
    'Arugula': {
        type: 'Micro',
        seedsPerTrayGm: 15,
        cycleDays: 12,
        harvestWeightGm: 180,
        survivalRate: 0.96,
        category: 'Microgreens'
    }
};

export const calculateYield = (geometry, cropName) => {
    const crop = CROP_DATABASE[cropName] || CROP_DATABASE['Lettuce'];
    const { area } = geometry;

    if (crop.type === 'Hydro') {
        // Calculate plants based on spacing
        // 1 sq meter = 10.76 sqft
        const areaSqMeter = area / 10.76;
        const spacingMeter = crop.spacingCm / 100;
        const plantsPerSqMeter = (1 / spacingMeter) * (1 / spacingMeter) * 0.70; // 70% floor efficiency

        const totalPlants = Math.floor(areaSqMeter * plantsPerSqMeter);
        const monthlyYieldKg = (totalPlants * (crop.harvestWeightGm / 1000) * (365 / crop.cycleDays)) / 12;

        return {
            totalPlants,
            monthlyYieldKg: monthlyYieldKg * crop.survivalRate,
            units: 'Plants',
            cycleDays: crop.cycleDays
        };
    }

    if (crop.type === 'Micro') {
        const totalTrays = geometry.vertical?.totalTrays || 0;
        const monthlyCycles = 30 / crop.cycleDays;
        const monthlyYieldKg = totalTrays * (crop.harvestWeightGm / 1000) * monthlyCycles;

        return {
            totalPlants: totalTrays,
            monthlyYieldKg: (monthlyYieldKg || 0) * crop.survivalRate,
            units: 'Trays',
            cycleDays: crop.cycleDays
        };
    }
};
