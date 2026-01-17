/**
 * Smart Predictions for Harvest Dates, Yields, and Revenue
 * Uses real crop data to make accurate predictions
 */

import { getDaysToMaturity, getAverageYield, getAveragePrice, getCropData } from './cropData';
import { getLunarPhase } from './astroUtils';

/**
 * Calculate Solar Adjustment for Growth
 * Logic: Every 50 MJ/m² of cumulative solar radiation above average 
 * can speed up growth by roughly 4-8 hours for microgreens.
 */
export const calculateSolarAdjustment = (solarHistory = []) => {
    if (!solarHistory.length) return 0;
    const avgSolar = 15; // MJ/m² average
    const totalSolar = solarHistory.reduce((sum, val) => sum + (val || 0), 0);
    const deviation = totalSolar - (avgSolar * solarHistory.length);

    // speed up by 0.1 days for every 10 MJ/m² extra
    return Math.floor(deviation / 10) * 0.1;
};

/**
 * Calculate days between two dates
 */
export const calculateDays = (startDate, endDate = new Date()) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Predict harvest date based on crop type and sowing date
 * Incorporates Solar Adjustment if history provided
 */
export const predictHarvestDate = (crop, sowDate, solarHistory = []) => {
    let daysToMaturity = getDaysToMaturity(crop);

    // Adjust based on solar energy
    const solarAdj = calculateSolarAdjustment(solarHistory);
    daysToMaturity = Math.max(daysToMaturity - solarAdj, daysToMaturity * 0.8); // Max 20% faster

    const sowingDate = sowDate ? new Date(sowDate) : new Date();

    // Fallback if date is invalid
    const validSowDate = isNaN(sowingDate.getTime()) ? new Date() : sowingDate;

    const harvestDate = new Date(validSowDate);
    harvestDate.setDate(harvestDate.getDate() + Math.round(daysToMaturity));

    try {
        return harvestDate.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * Predict yield based on crop type and quantity
 */
export const predictYield = (crop, quantity = 1) => {
    return getAverageYield(crop, quantity); // Returns grams
};

/**
 * Predict revenue based on crop, quantity, and quality
 * Supports Live Market Price override
 */
export const predictRevenue = (crop, quantity = 1, qualityGrade = 'A', livePricePerKg = null) => {
    const yieldGrams = predictYield(crop, quantity);
    const yieldKg = yieldGrams / 1000;
    const pricePerKg = livePricePerKg || getAveragePrice(crop);

    // Quality multiplier
    const qualityMultiplier = {
        'A': 1.0,
        'B': 0.85,
        'C': 0.70
    };

    return yieldKg * pricePerKg * (qualityMultiplier[qualityGrade] || 1.0);
};

/**
 * Check if batch/system is ready to harvest
 */
export const isReadyToHarvest = (crop, sowDate, status) => {
    if (status === 'harvested' || status === 'Harvested') return false;

    const daysCurrent = calculateDays(sowDate);
    const daysToMaturity = getDaysToMaturity(crop);

    // Ready if within 1 day of maturity
    return daysCurrent >= (daysToMaturity - 1);
};

/**
 * Get days until harvest
 */
export const getDaysUntilHarvest = (crop, sowDate) => {
    const daysCurrent = calculateDays(sowDate);
    const daysToMaturity = getDaysToMaturity(crop);
    const daysRemaining = daysToMaturity - daysCurrent;
    return Math.max(0, daysRemaining);
};

/**
 * Get harvest status message
 */
export const getHarvestStatus = (crop, sowDate, status) => {
    if (status === 'harvested' || status === 'Harvested') {
        return { message: 'Harvested', color: 'slate', ready: false };
    }

    const daysCurrent = calculateDays(sowDate);
    const daysToMaturity = getDaysToMaturity(crop);
    const daysRemaining = daysToMaturity - daysCurrent;

    if (daysRemaining <= 0) {
        const daysOverdue = Math.abs(daysRemaining);
        return {
            message: `Overdue (${daysOverdue} days)`,
            color: 'red',
            ready: true,
            overdue: true
        };
    } else if (daysRemaining <= 1) {
        return {
            message: 'Ready to Harvest!',
            color: 'emerald',
            ready: true
        };
    } else if (daysRemaining <= 2) {
        return {
            message: `Almost Ready (${daysRemaining} days)`,
            color: 'amber',
            ready: false
        };
    } else {
        return {
            message: `Growing (Day ${daysCurrent} of ${daysToMaturity})`,
            color: 'blue',
            ready: false
        };
    }
};

/**
 * Get upcoming harvests from batches/systems
 */
export const getUpcomingHarvests = (items) => {
    return items
        .filter(item => item.status !== 'harvested' && item.status !== 'Harvested')
        .map(item => {
            const sowDate = item.sow_date || item.sowingDate || item.plant_date;
            const crop = item.crop;
            const quantity = item.qty || 1;

            return {
                ...item,
                predicted_harvest_date: predictHarvestDate(crop, sowDate),
                predicted_yield: predictYield(crop, quantity),
                predicted_revenue: predictRevenue(crop, quantity),
                days_until_harvest: getDaysUntilHarvest(crop, sowDate),
                harvest_status: getHarvestStatus(crop, sowDate, item.status)
            };
        })
        .sort((a, b) => a.days_until_harvest - b.days_until_harvest);
};

/**
 * Get harvest calendar (next 7 days)
 */
export const getHarvestCalendar = (items, days = 7) => {
    const upcoming = getUpcomingHarvests(items);
    const today = new Date();
    const calendar = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const harvestsOnDate = upcoming.filter(item =>
            item.predicted_harvest_date === dateStr
        );

        if (harvestsOnDate.length > 0) {
            calendar.push({
                date: dateStr,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                harvests: harvestsOnDate,
                totalRevenue: harvestsOnDate.reduce((sum, h) => sum + h.predicted_revenue, 0)
            });
        }
    }

    return calendar;
};

/**
 * Calculate health score based on conditions
 */
export const calculateHealthScore = (crop, ph, ec, temp) => {
    const cropData = getCropData(crop);
    if (!cropData) return 50; // Default score

    const ideal = cropData.ideal_conditions;
    let score = 100;

    // pH score (40% weight)
    const [minPH, maxPH] = ideal.ph;
    if (ph < minPH || ph > maxPH) {
        const deviation = Math.min(Math.abs(ph - minPH), Math.abs(ph - maxPH));
        score -= Math.min(40, deviation * 20);
    }

    // EC score (30% weight)
    const [minEC, maxEC] = ideal.ec;
    if (ec < minEC || ec > maxEC) {
        const deviation = Math.min(Math.abs(ec - minEC), Math.abs(ec - maxEC));
        score -= Math.min(30, deviation * 15);
    }

    // Temperature score (30% weight)
    const [minTemp, maxTemp] = ideal.temp;
    if (temp < minTemp || temp > maxTemp) {
        const deviation = Math.min(Math.abs(temp - minTemp), Math.abs(temp - maxTemp));
        score -= Math.min(30, deviation * 3);
    }

    return Math.max(0, Math.round(score));
};

/**
 * Get recommendations based on conditions
 */
export const getRecommendations = (crop, ph, ec, temp) => {
    const cropData = getCropData(crop);
    if (!cropData) return [];

    const ideal = cropData.ideal_conditions;
    const recommendations = [];

    // pH recommendations
    const [minPH, maxPH] = ideal.ph;
    if (ph < minPH) {
        recommendations.push({
            type: 'warning',
            category: 'pH',
            message: `pH too low (${ph}). Add pH Up solution to raise to ${minPH}-${maxPH}`
        });
    } else if (ph > maxPH) {
        recommendations.push({
            type: 'warning',
            category: 'pH',
            message: `pH too high (${ph}). Add pH Down solution to lower to ${minPH}-${maxPH}`
        });
    }

    // EC recommendations
    const [minEC, maxEC] = ideal.ec;
    if (ec < minEC) {
        recommendations.push({
            type: 'info',
            category: 'EC',
            message: `EC too low (${ec}). Add more nutrients to reach ${minEC}-${maxEC}`
        });
    } else if (ec > maxEC) {
        recommendations.push({
            type: 'warning',
            category: 'EC',
            message: `EC too high (${ec}). Dilute with water to lower to ${minEC}-${maxEC}`
        });
    }

    // Temperature recommendations
    const [minTemp, maxTemp] = ideal.temp;
    if (temp < minTemp) {
        recommendations.push({
            type: 'info',
            category: 'Temperature',
            message: `Temperature too low (${temp}°C). Increase to ${minTemp}-${maxTemp}°C`
        });
    } else if (temp > maxTemp) {
        recommendations.push({
            type: 'warning',
            category: 'Temperature',
            message: `Temperature too high (${temp}°C). Cool down to ${minTemp}-${maxTemp}°C`
        });
    }

    return recommendations;
};

/**
 * Get Consolidate Intelligent Insights
 * Combines Weather, Market, and Lunar data
 */
export const getIntelligentInsights = (crop, weatherData = null, marketData = null) => {
    const insights = [];
    const lunar = getLunarPhase();

    // 1. Lunar Insight
    if (lunar.isOptimalSowing) {
        insights.push({
            type: 'success',
            title: 'Optimal Sowing Window',
            message: `Lunar phase (${lunar.phase}) is ideal for sowing ${crop}. Sap flow is high.`,
            icon: 'Moon'
        });
    }

    // 2. Market Insight
    if (marketData && marketData.isLive) {
        const avgPrice = getAveragePrice(crop);
        const diff = ((marketData.pricePerKg - avgPrice) / avgPrice) * 100;

        if (diff > 10) {
            insights.push({
                type: 'success',
                title: 'High Market Demand',
                message: `Current Mandi price (₹${marketData.pricePerKg}/kg) is ${diff.toFixed(0)}% above average!`,
                icon: 'TrendingUp'
            });
        }
    }

    // 3. Weather Insight (Solar)
    if (weatherData && weatherData.current?.solar > 400) {
        insights.push({
            type: 'info',
            title: 'High Solar Activity',
            message: 'Strong sunlight detected. Growth rates may accelerate.',
            icon: 'Sun'
        });
    }

    return insights;
};

/**
 * AUTO-DETECT Quality Grade Based on Yield
 * CRITICAL: Ensures revenue calculations match actual quality
 */
export const determineQualityGrade = (crop, yieldPerUnit, quantity = 1) => {
    const cropData = getCropData(crop);
    if (!cropData || !cropData.quality_grades) return 'B'; // Default to B

    const actualYieldPerUnit = yieldPerUnit / quantity; // Normalize to per-tray or per-system
    const grades = cropData.quality_grades;

    // Check from best to worst
    if (grades.A && actualYieldPerUnit >= grades.A.min_yield) return 'A';
    if (grades.B && actualYieldPerUnit >= grades.B.min_yield) return 'B';
    return 'C';
};
