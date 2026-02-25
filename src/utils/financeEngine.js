/**
 * Agri-OS 2.0 Engineering Planning Engine (V2)
 * Main orchestrator for modular logic
 */

import { calculateGeometry, calculateVerticalRacks } from '../engine/core/geometry';
import { calculateHVAC } from '../engine/core/climate';
import { calculateYield } from '../engine/core/production';
import { calculateFinancials } from '../engine/financial/financeCore';
import { generateProjections } from '../engine/financial/projections';

export const calculateFeasibility = (config, marketRates = {}, customPrices = {}) => {
    const {
        length = 50,
        width = 30,
        gutterHeight = 12,
        ridgeHeight = 16,
        layers = 4,
        climate = 'Delhi',
        cropType = 'Lettuce',
        businessType = 'Hydroponics',
        applySubsidy = false,
        rentedSpace = false
    } = config;

    const crop = cropType;

    // 1. Solve Geometry
    const geometry = calculateGeometry(length || 0, width || 0, gutterHeight || 12, ridgeHeight || 16);
    if (businessType === 'Microgreens') {
        geometry.vertical = calculateVerticalRacks(geometry.area, layers || 4);
    }

    // 2. Solve Climate
    const hvac = calculateHVAC(geometry, climate);

    // 3. Solve Production
    const production = calculateYield(geometry, crop);

    // 4. Solve Financials
    const financials = calculateFinancials(geometry, hvac, production, customPrices, applySubsidy, marketRates, crop, config.equipmentTier || 'Standard');

    // 5. Generate Projections (with Sensitivity)
    const sensitivity = {
        survivalImpact: config.simulationMode === 'worst' ? -0.25 : (config.simulationMode === 'best' ? 0.05 : 0),
        priceImpact: config.simulationMode === 'worst' ? -0.20 : (config.simulationMode === 'best' ? 0.10 : 0)
    };

    const projections = generateProjections(financials, 60, sensitivity);

    return {
        ...financials,
        ...projections,
        revenue: projections.adjRevenue || 0,
        capacity: production?.totalPlants || 0,
        units: production?.units || 'Units',
        efficiency: ((hvac?.loadFactor || 0) * 100).toFixed(0),
        warnings: geometry.warnings || [],
        debug: { geometry, hvac, production }
    };
};
