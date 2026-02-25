/**
 * Agri-OS Financial Projection Engine
 * Cash flow, Depreciation, and Break-even Simulation
 */

export const generateProjections = (financeData, months = 36, sensitivity = { survivalImpact: 0, priceImpact: 0 }) => {
    const { capex, opex, revenue } = financeData;

    // Adjusted revenue based on sensitivity
    const adjRevenue = (revenue || 0) * (1 + sensitivity.survivalImpact) * (1 + sensitivity.priceImpact);

    // Handle both property names for safety
    const monthlyOpex = opex?.monthly || opex?.total || 0;
    const monthlyNetProfit = adjRevenue - monthlyOpex;

    const cashFlow = [];
    let cumulativeProfit = -(capex?.net || 0);
    let breakEvenMonth = -1;

    for (let m = 1; m <= months; m++) {
        const monthlyDepreciation = ((capex?.total || 0) * 0.10) / 12;
        cumulativeProfit += monthlyNetProfit;

        if (cumulativeProfit >= 0 && breakEvenMonth === -1) {
            breakEvenMonth = m;
        }

        cashFlow.push({
            month: m,
            revenue: adjRevenue,
            opex: monthlyOpex,
            netProfit: monthlyNetProfit,
            cumulative: cumulativeProfit,
            depreciation: monthlyDepreciation
        });
    }

    return {
        cashFlow,
        breakEvenMonth,
        breakEvenYears: breakEvenMonth !== -1 ? (breakEvenMonth / 12).toFixed(1) : '>3',
        tenYearROI: (capex?.net > 0) ? ((monthlyNetProfit * 120) / capex.net * 100).toFixed(0) : '0',
        adjRevenue
    };
};
