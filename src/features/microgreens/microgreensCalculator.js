/**
 * Microgreens ROI & Planning Engine
 * v2.1 - Hardened Logic, Validation & Realism
 */

export const generateMicrogreensPlan = (config) => {
    // 0. Input Validation & Safe Defaults
    const length = Math.max(1, config.length || 0);
    const width = Math.max(1, config.width || 0);
    const layers = Math.max(1, config.layers || 0);
    const pricePerTray = Math.max(0, config.pricePerTray || 0);
    const rent = Math.max(0, config.rent || 0);
    const labor = Math.max(0, config.labor || 0);
    const electricityRate = Math.max(0, config.electricityRate || 0);
    const lossPercent = Math.min(100, Math.max(0, config.lossPercent || 0));
    const capex = Math.max(1, config.capex || 0);
    const seedCostTray = Math.max(0, config.seedCostTray || 0);
    const cycleDays = Math.max(1, config.cycleDays || 12); // Fallback to 12 if missing

    // Engineering Assumptions
    const {
        usableAreaRatio = 0.6,
        sqftPerTray = 1.5,
        powerDrawFactor = 6.5,
        photoperiod = 16,
        mediaCostPerTray = 5,
        packagingCostPerTray = 6,
        otherOpexPercent = 5 // New: Marketing, Distribution, Maintenance
    } = config;

    const area = length * width;

    // 1. Capacity Calculations
    const usableArea = area * usableAreaRatio;
    const traysPerLayer = Math.floor(usableArea / sqftPerTray);
    const totalTrays = traysPerLayer * layers;

    // 2. Production Cycles (FIX: Dynamic based on crop days)
    // Formula: 30 days / cycle length. 
    // We keep a small buffer (e.g., 2 days for cleaning/prep) implicitly or explicitly.
    const turnAroundBuffer = 2;
    const effectiveCycleDays = cycleDays + turnAroundBuffer;
    const cyclesPerMonth = 30 / effectiveCycleDays;

    const monthlyTrays = totalTrays * cyclesPerMonth;

    // 3. Risk Adjustment
    const effectiveTrays = Math.floor(monthlyTrays * (1 - (lossPercent / 100)));

    // 4. Revenue
    const revenue = effectiveTrays * pricePerTray;

    // 5. OpEx Breakdown
    const estimatedLoadKW = (area / 1000) * powerDrawFactor;
    const monthlyUnits = estimatedLoadKW * photoperiod * 30;
    const electricityCost = monthlyUnits * electricityRate;

    const seedAndMediaCost = effectiveTrays * (seedCostTray + mediaCostPerTray);
    const packagingCost = effectiveTrays * packagingCostPerTray;

    // Financial Realism: Add 5-10% for distribution/maintenance
    const directOpex = rent + labor + electricityCost + seedAndMediaCost + packagingCost;
    const incidentalOpex = revenue * (otherOpexPercent / 100);
    const totalOpex = directOpex + incidentalOpex;

    // 6. Net Financials
    const netProfit = revenue - totalOpex;
    const breakEvenMonths = netProfit > 0 ? (capex / netProfit) : 999;
    const breakEvenYears = (breakEvenMonths / 12).toFixed(1);

    return {
        capacity: totalTrays,
        monthlyTrays: effectiveTrays,
        revenue,
        opex: {
            total: totalOpex,
            electricity: electricityCost,
            inputs: seedAndMediaCost + packagingCost,
            incidentals: incidentalOpex,
            rent,
            labor
        },
        profit: netProfit,
        breakEvenMonths: breakEvenMonths.toFixed(1),
        breakEvenYears: breakEvenYears,
        roi: netProfit > 0 ? ((netProfit * 12) / capex * 100).toFixed(1) : 0,
        cycles: cyclesPerMonth.toFixed(1)
    };
};
