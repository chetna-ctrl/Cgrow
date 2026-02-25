/**
 * Microgreens Indian Market Defaults
 * Optimized for professional modeling
 */

export const MG_DEFAULTS = {
    // Basic Site Info
    length: 50,
    width: 20,
    layers: 4,

    // Financials
    pricePerTray: 150,
    rent: 20000,
    labor: 15000,
    electricityRate: 8,
    lossPercent: 10,
    capex: 600000,

    // Professional Assumptions
    usableAreaRatio: 0.6,
    sqftPerTray: 1.5,
    powerDrawFactor: 6.5,
    photoperiod: 16,
    mediaCostPerTray: 5,
    packagingCostPerTray: 6,
    otherOpexPercent: 5, // Distribution, Marketing, Maintenance

    // UI State
    isConsultant: false,
    cropType: 'Radish'
};

export const MG_CROPS = [
    { value: 'Radish', label: 'Radish (Mooli)', seedCostTray: 12, cycleDays: 10 },
    { value: 'Pea Shoots', label: 'Pea Shoots (Matar)', seedCostTray: 18, cycleDays: 14 },
    { value: 'Sunflower', label: 'Sunflower (Surajmukhi)', seedCostTray: 15, cycleDays: 12 },
    { value: 'Mustard', label: 'Mustard (Sarson)', seedCostTray: 10, cycleDays: 9 },
    { value: 'Mix', label: 'Exotic Salad Mix', seedCostTray: 25, cycleDays: 12 }
];
