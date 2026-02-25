/**
 * Microgreens Engineering Engine
 */
export const calculateMicrogreens = (config, marketRates = {}, customPrices = {}) => {
    const {
        length = 20,
        width = 15,
        layers = 4,
        climate = 'Delhi',
        crop = 'Radish',
        applySubsidy = false,
        rentedSpace = false,
        rentPerSqft = customPrices.rentPerSqft || 40
    } = config;

    const area = length * width;

    // Base efficiency for microgreens (indoor controlled)
    const month = new Date().getMonth();
    let efficiency = 0.80; // Indoor is more stable
    if (climate === 'Delhi' && (month >= 4 && month <= 6)) {
        efficiency = 0.70; // Cooling burden
    }

    const EFFICIENCY_FACTOR = 0.65 * efficiency;
    const effectiveArea = area * EFFICIENCY_FACTOR;
    const maxRacks = Math.floor(effectiveArea / 25);
    const capacity = maxRacks * layers * 4; // Trays per cycle
    const monthlyCycles = 3.5;
    const sellableTrays = Math.floor(capacity * monthlyCycles * 0.95);

    // Hardware costs from custom prices or defaults
    const rackCost = customPrices.mg_rackCost || 4500;
    const trayCost = customPrices.mg_trayCost || 120;
    const acCost = customPrices.acCost || 35000;

    const hardware = (maxRacks * rackCost) + (capacity * 2 * trayCost);
    const ac = Math.ceil(area / 300) * acCost;
    const baseCapex = hardware + ac;
    const actualCapex = applySubsidy ? baseCapex * 0.6 : baseCapex;

    const marketPrice = marketRates[crop] || customPrices.mg_cropPrice || 150;
    const monthlyRevenue = sellableTrays * marketPrice;

    const labor = (Math.ceil(area / 1000) * (customPrices.laborSalary || 15000));
    const inputs = (sellableTrays * 15); // seeds + media + packaging
    const monthlyOpEx = labor + inputs + (rentedSpace ? area * rentPerSqft : 0);
    const annualNetProfit = (monthlyRevenue - monthlyOpEx) * 12;

    return {
        capacity: capacity * monthlyCycles,
        units: 'Trays/mo',
        capex: {
            infra: ac,
            hardware: hardware,
            total: actualCapex,
            subsidySaved: baseCapex - actualCapex
        },
        opex: {
            monthly: monthlyOpEx,
            annual: monthlyOpEx * 12
        },
        revenue: monthlyRevenue,
        roi: ((annualNetProfit / actualCapex) * 100).toFixed(1),
        breakEven: (actualCapex / annualNetProfit).toFixed(1),
        efficiency: (efficiency * 100).toFixed(0)
    };
};
