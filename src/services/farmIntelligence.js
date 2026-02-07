/**
 * cGrow Farm Intelligence Service
 * Decoupled business logic layer - NO React dependencies
 * Pure functions with caching and error boundaries
 * 
 * @module farmIntelligence
 * @author cGrow Engineering Team
 */

import {
    calculateVPD,
    calculateDailyGDD,
    analyzeNutrientHealth,
    predictHarvestByGDD,
    generateContextAwareAlerts,
    calculateFarmHealth,
    getCropParams,
    CROP_THRESHOLDS,
    GDD_TARGETS
} from '../utils/agriUtils';

/**
 * Farm Intelligence Service Class
 * Singleton pattern with internal caching
 */
class FarmIntelligenceService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get cache key for memoization
     */
    _getCacheKey(prefix, params) {
        return `${prefix}_${JSON.stringify(params)}`;
    }

    /**
     * Check if cache is valid
     */
    _isCacheValid(key) {
        const cached = this.cache.get(key);
        if (!cached) return false;
        return Date.now() - cached.timestamp < this.cacheTimeout;
    }

    /**
     * Get from cache or compute
     */
    _getOrCompute(key, computeFn) {
        if (this._isCacheValid(key)) {
            return this.cache.get(key).value;
        }

        const value = computeFn();
        this.cache.set(key, { value, timestamp: Date.now() });
        return value;
    }

    /**
     * Calculate farm health with error boundaries
     */
    calculateHealth(logData, batchAge, systemType, crop) {
        try {
            const cacheKey = this._getCacheKey('health', { systemType, crop, batchAge });

            return this._getOrCompute(cacheKey, () => {
                return calculateFarmHealth(logData, batchAge, systemType, crop);
            });
        } catch (error) {
            console.error('Health Calculation Error:', error);
            return {
                score: 0,
                details: { air: 'ERROR', nutrient: 'ERROR', light: 'ERROR' },
                error: true,
                errorMessage: error.message
            };
        }
    }

    /**
     * Calculate VPD with validation
     */
    calculateVPD(airTemp, humidity) {
        try {
            if (!airTemp || !humidity || airTemp <= 0 || humidity <= 0) {
                return null;
            }
            return calculateVPD(airTemp, humidity);
        } catch (error) {
            console.error('VPD Calculation Error:', error);
            return null;
        }
    }

    /**
     * Predict harvest date with GDD
     */
    predictHarvest(tempLogs, cropType, sowingDate) {
        try {
            return predictHarvestByGDD(tempLogs, cropType, sowingDate);
        } catch (error) {
            console.error('Harvest Prediction Error:', error);
            return {
                error: true,
                errorMessage: error.message,
                status: 'CALCULATION_ERROR'
            };
        }
    }

    /**
     * Analyze nutrient health
     */
    analyzeNutrients(inputs) {
        try {
            return analyzeNutrientHealth(inputs);
        } catch (error) {
            console.error('Nutrient Analysis Error:', error);
            return [];
        }
    }

    /**
     * Generate context-aware alerts
     */
    generateAlerts(sensorData, cropName) {
        try {
            return generateContextAwareAlerts(sensorData, cropName);
        } catch (error) {
            console.error('Alert Generation Error:', error);
            return [];
        }
    }

    /**
     * Get crop-specific optimal values
     */
    getCropOptimalValues(crop) {
        try {
            const params = getCropParams(crop);
            const thresholds = CROP_THRESHOLDS[crop] || CROP_THRESHOLDS['Lettuce'];

            return {
                ph: (thresholds.ph[0] + thresholds.ph[1]) / 2,
                ec: (thresholds.ec[0] + thresholds.ec[1]) / 2,
                temp: (thresholds.temp[0] + thresholds.temp[1]) / 2,
                base_temp: params.base_temp,
                gdd_target: GDD_TARGETS[crop] || 700
            };
        } catch (error) {
            console.error('Crop Params Error:', error);
            return {
                ph: 6.0,
                ec: 1.8,
                temp: 22,
                base_temp: 4,
                gdd_target: 700
            };
        }
    }

    /**
     * Calculate GDD for a day
     */
    calculateDailyGDD(tMax, tMin, cropName) {
        try {
            return calculateDailyGDD(tMax, tMin, cropName);
        } catch (error) {
            console.error('GDD Calculation Error:', error);
            return 0;
        }
    }

    /**
     * Clear cache (useful for testing)
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export singleton instance
export const farmIntelligence = new FarmIntelligenceService();

// Export class for testing
export { FarmIntelligenceService };
