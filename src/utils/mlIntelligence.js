/**
 * ML Intelligence Engine
 * 
 * This module implements the Decision Tree rules extracted from the user's
 * cgrowml.ipynb research notebook.
 */

/**
 * Apply the ML Decision Tree rules to agricultural telemetry data.
 * 
 * Based on the model trained in cgrowml.ipynb:
 * - Accuracy: 99.50%
 * - Features: water_temp_c, ph_level, avg_temp_c, vpd_kpa
 * 
 * @param {Object} data - The telemetry data object.
 * @returns {Object} - { isRecommended: boolean, riskFactor: string }
 */
export const applyMLRules = (data) => {
    const { waterTemp, ph, airTemp, vpd } = data;

    // Use default values if data point is missing to avoid crashing
    const wt = parseFloat(waterTemp) || 24;
    const p = parseFloat(ph) || 6.0;
    const at = parseFloat(airTemp) || 25;
    const v = parseFloat(vpd) || 1.0;

    // Decision Tree Rules (Path-to-Leaf)
    if (wt > 26.05) {
        return {
            isRecommended: false,
            riskFactor: "Root Rot Risk (Model Alert: Water Temp > 26°C)"
        };
    }

    if (p > 7.05) {
        return {
            isRecommended: false,
            riskFactor: "Nutrient Lockout (Model Alert: pH > 7.0)"
        };
    }

    if (p <= 5.45) {
        return {
            isRecommended: false,
            riskFactor: "Acidic Stress (Model Alert: pH < 5.5)"
        };
    }

    // Leaf: pH is 5.45 - 7.05, Water Temp <= 26.05
    if (at <= 26.50) {
        return {
            isRecommended: true,
            riskFactor: "Optimal Conditions (ML Model Validated)"
        };
    } else {
        // High temp path
        if (v <= 2.50) {
            return {
                isRecommended: true,
                riskFactor: "Stable Under Heat (ML Model Validated)"
            };
        } else {
            return {
                isRecommended: false,
                riskFactor: "VPD Dry Stress (Model Alert: VPD > 2.5 kPa)"
            };
        }
    }
};

/**
 * Phase 2: Finance AI - Predicts profitability based on health and market data
 */
export const predictProfitability = (batchData, marketRate) => {
    const { healthScore, weightGrams, totalCosts } = batchData;

    // Predicted Yield based on Health Score (Simplified Regression Logic)
    // If health is 100%, yield is 100%. If health is 50%, yield drops by 70% (non-linear risk)
    const yieldMultiplier = healthScore > 80 ? 1.0 : (healthScore / 100) * 0.7;
    const predictedYieldKg = (weightGrams / 1000) * yieldMultiplier;

    const projectedRevenue = predictedYieldKg * marketRate;
    const projectedProfit = projectedRevenue - totalCosts;
    const roi = totalCosts > 0 ? (projectedProfit / totalCosts) * 100 : 0;

    return {
        projectedRevenue: projectedRevenue.toFixed(2),
        projectedProfit: projectedProfit.toFixed(2),
        roi: roi.toFixed(1),
        status: projectedProfit > 0 ? 'PROFITABLE' : 'RISK'
    };
};

/** 
 * VPD Calculation (Simplified)
 * @param {number} temp - Temperature in Celsius
 * @param {number} hum - Humidity in %
 * @returns {number} VPD in kPa
 */
export const calculateVPD = (temp, hum) => {
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const vpd = svp * (1 - hum / 100);
    return parseFloat(vpd.toFixed(3));
};

/**
 * Churn/Retention Predictor (Decision Tree Logic)
 * Identifies at-risk customers based on order history.
 */
export const predictChurn = (customer, orders) => {
    const customerOrders = orders.filter(o => o.customer_id === customer.id);
    if (customerOrders.length === 0) return { risk: 'NEW', color: 'text-blue-500', label: 'New Lead' };

    const lastOrder = new Date(Math.max(...customerOrders.map(o => new Date(o.created_at))));
    const daysSinceLast = (new Date() - lastOrder) / (1000 * 60 * 60 * 24);

    // Churn Rules
    if (daysSinceLast > 30) return { risk: 'HIGH', color: 'text-red-500', label: 'Churning' };
    if (daysSinceLast > 15) return { risk: 'MEDIUM', color: 'text-orange-500', label: 'At Risk' };
    if (customerOrders.length > 5 && daysSinceLast < 7) return { risk: 'STABLE', color: 'text-emerald-500', label: 'High Value' };

    return { risk: 'LOW', color: 'text-slate-400', label: 'Stable' };
};

/**
 * Phase 6: Smart Pricing AI (Weather-Aware)
 * 
 * Logic for Delhi 2026:
 * - High Heat (>38C): Supply drops (evaporation/heat stress), Price ↑ 15-20%
 * - Monsoon (High Humidity): Fungal risk ↑, Price ↑ 10% (for premium quality)
 * - Night Temp drops: Energy costs ↑, Price ↑ 5%
 */
export const calculateOptimalPrice = (basePrice, weatherData, inventoryCount = 50) => {
    let multiplier = 1.0;
    const { temp, humidity } = weatherData;

    // 1. Heat Wave Multiplier (Delhi Summer)
    if (temp > 38) multiplier += 0.20;
    else if (temp > 32) multiplier += 0.10;

    // 2. Humidity/Monsoon Multiplier
    if (humidity > 80) multiplier += 0.05;

    // 3. Inventory Scarcity Multiplier
    if (inventoryCount < 10) multiplier += 0.15;
    else if (inventoryCount < 25) multiplier += 0.05;

    const suggested = basePrice * multiplier;

    return {
        base: basePrice,
        suggested: Math.round(suggested),
        difference: Math.round(suggested - basePrice),
        reason: temp > 38 ? 'High Heat Supply Drop' : inventoryCount < 25 ? 'Low Stock Scarcity' : 'Market Optimal'
    };
};

/**
 * Enhanced CRM Intelligence
 * Predicts when a customer might need a refill based on order volume.
 */
export const predictConsumption = (customer, orders) => {
    const customerOrders = orders.filter(o => o.customer_id === customer.id);
    const tier = customerOrders.length > 5 ? 'Elite' : customerOrders.length > 2 ? 'Regular' : 'Emerging';

    if (customerOrders.length < 2) return { daysLeft: null, suggestion: 'Insufficient Data', loyaltyTier: tier };

    // Calculate average gap between orders
    const sorted = [...customerOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastOrder = new Date(sorted[0].created_at);
    const prevOrder = new Date(sorted[1].created_at);

    const cycleDays = (lastOrder - prevOrder) / (1000 * 60 * 60 * 24);
    const daysSinceLast = (new Date() - lastOrder) / (1000 * 60 * 60 * 24);

    const daysRemaining = Math.max(0, Math.round(cycleDays - daysSinceLast));

    return {
        daysLeft: daysRemaining,
        isRefillUrgent: daysRemaining <= 1,
        suggestion: daysRemaining <= 1 ? 'Chef is likely out of stock' : `Refill due in ${daysRemaining} days`,
        loyaltyTier: tier
    };
};

export default {
    applyMLRules,
    predictProfitability,
    calculateVPD,
    predictChurn,
    calculateOptimalPrice,
    predictConsumption
};
