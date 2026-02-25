/**
 * Hydroponics Engineering Engine
 */
import { generateFarmBlueprint } from '../utils/farmEngine';

export const calculateHydroponics = (config, marketRates = {}, customPrices = {}) => {
    const {
        length = 50,
        width = 30,
        climate = 'Delhi',
        crop = 'Lettuce',
        applySubsidy = false,
        rentedSpace = false,
        rentPerSqft = customPrices.rentPerSqft || 40
    } = config;

    const area = length * width;

    // Seasonal Efficiency logic
    const month = new Date().getMonth();
    let efficiency = 0.70;
    if (climate === 'Delhi') {
        efficiency = (month >= 4 && month <= 6) ? 0.55 : 0.75;
    } else if (climate === 'Bangalore') {
        efficiency = 0.85;
    }

    const blueprint = generateFarmBlueprint(length, width, climate, crop);
    const capexData = blueprint.economics.capexBreakdown;

    const baseCapex = blueprint.economics.estimatedCapex;
    const actualCapex = applySubsidy ? baseCapex * 0.6 : baseCapex;

    const marketPrice = marketRates[crop] || customPrices.hydro_cropPrice || 200;

    const annualRevenue = blueprint.production.totalPlants * 0.25 * marketPrice * 10 * efficiency;
    const annualOpEx = annualRevenue * 0.35 + (rentedSpace ? area * rentPerSqft * 12 : 0);
    const annualNetProfit = annualRevenue - annualOpEx;

    return {
        capacity: blueprint.production.totalPlants,
        units: 'Plants',
        capex: {
            infra: capexData.structure + capexData.cooling,
            hardware: capexData.hydroponics,
            total: actualCapex,
            subsidySaved: baseCapex - actualCapex
        },
        opex: {
            monthly: annualOpEx / 12,
            annual: annualOpEx
        },
        revenue: annualRevenue / 12,
        roi: ((annualNetProfit / actualCapex) * 100).toFixed(1),
        breakEven: (actualCapex / annualNetProfit).toFixed(1),
        efficiency: (efficiency * 100).toFixed(0)
    };
};
