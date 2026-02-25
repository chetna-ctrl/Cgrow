/**
 * Agri-OS Financial Core Engine
 */

export const calculateFinancials = (geometry, hvac, yieldData, customPrices = {}, applySubsidy = false, marketRates = {}, crop = 'Lettuce', equipmentTier = 'Standard') => {
    const { area } = geometry;
    const { loadFactor } = hvac;
    const { totalPlants, monthlyYieldKg } = yieldData;

    const marketPrice = marketRates[crop] || 200;
    const revenue = (monthlyYieldKg || 0) * marketPrice;

    // Scaling factor based on Tier
    const tierMultiplier = equipmentTier === 'Premium' ? 1.4 : (equipmentTier === 'Budget' ? 0.75 : 1.0);

    // 1. Detailed CAPEX Calculation
    const structureBase = area * 180 * (equipmentTier === 'Budget' ? 0.8 : 1.0);
    const polyfilm = area * 45 * tierMultiplier;
    const coolingEquip = area * 150 * tierMultiplier;
    const hydroponicHardware = (totalPlants || 0) * 120 * tierMultiplier;
    const automation = (customPrices.iot_controller || 25000) * (equipmentTier === 'Premium' ? 2.5 : (equipmentTier === 'Budget' ? 0.5 : 1.0));

    const totalCapex = structureBase + polyfilm + coolingEquip + hydroponicHardware + automation;
    const subsidyAmount = applySubsidy ? totalCapex * 0.4 : 0;
    const finalCapex = totalCapex - subsidyAmount;

    // 2. OPEX Calculation (Monthly)
    const baseElectricity = (area / 100) * 15 * loadFactor; // Units multiplied by seasonal load
    const electricityCost = baseElectricity * (customPrices.electricityRate || 10);
    const laborCost = Math.ceil(area / 2000) * (customPrices.laborSalary || 15000);
    const inputCosts = (monthlyYieldKg || 0) * 25; // Nutrients, seeds, CO2 per kg

    const monthlyOpex = electricityCost + laborCost + inputCosts;

    return {
        revenue,
        capex: {
            structure: structureBase,
            polyfilm: polyfilm,
            cooling: coolingEquip,
            hardware: hydroponicHardware,
            automation: automation,
            total: totalCapex,
            subsidy: subsidyAmount,
            net: finalCapex
        },
        opex: {
            electricity: electricityCost,
            labor: laborCost,
            inputs: inputCosts,
            monthly: monthlyOpex,
            total: monthlyOpex
        }
    };
};
