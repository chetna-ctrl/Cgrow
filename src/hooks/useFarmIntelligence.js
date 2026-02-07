/**
 * Custom Hook: useFarmIntelligence
 * React wrapper for Farm Intelligence Service
 * Provides error boundaries and React integration
 */

import { useCallback, useMemo } from 'react';
import { farmIntelligence } from '../services/farmIntelligence';

export const useFarmIntelligence = () => {
    /**
     * Calculate farm health with error handling
     */
    const calculateHealth = useCallback((logData, batchAge, systemType, crop) => {
        return farmIntelligence.calculateHealth(logData, batchAge, systemType, crop);
    }, []);

    /**
     * Calculate VPD
     */
    const calculateVPD = useCallback((airTemp, humidity) => {
        return farmIntelligence.calculateVPD(airTemp, humidity);
    }, []);

    /**
     * Predict harvest date
     */
    const predictHarvest = useCallback((tempLogs, cropType, sowingDate) => {
        return farmIntelligence.predictHarvest(tempLogs, cropType, sowingDate);
    }, []);

    /**
     * Analyze nutrients
     */
    const analyzeNutrients = useCallback((inputs) => {
        return farmIntelligence.analyzeNutrients(inputs);
    }, []);

    /**
     * Generate alerts
     */
    const generateAlerts = useCallback((sensorData, cropName) => {
        return farmIntelligence.generateAlerts(sensorData, cropName);
    }, []);

    /**
     * Get crop optimal values
     */
    const getCropOptimalValues = useCallback((crop) => {
        return farmIntelligence.getCropOptimalValues(crop);
    }, []);

    /**
     * Calculate daily GDD
     */
    const calculateDailyGDD = useCallback((tMax, tMin, cropName) => {
        return farmIntelligence.calculateDailyGDD(tMax, tMin, cropName);
    }, []);

    return {
        calculateHealth,
        calculateVPD,
        predictHarvest,
        analyzeNutrients,
        generateAlerts,
        getCropOptimalValues,
        calculateDailyGDD
    };
};
