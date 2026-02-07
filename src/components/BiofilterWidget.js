import React from 'react';
import { calculateAirQualityImpact } from '../utils/agriUtils';

/**
 * BiofilterWidget - Displays air quality impact metrics
 * Based on Active Botanical Biofiltration research
 * 
 * @param {number} activeBatchCount - Number of active growing batches
 * @param {string} fanSpeedMode - Fan speed: 'HIGH', 'MEDIUM', 'LOW', 'OFF'
 */
const BiofilterWidget = ({ activeBatchCount = 0, fanSpeedMode = 'MEDIUM' }) => {
    const airQuality = calculateAirQualityImpact(activeBatchCount, fanSpeedMode);

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <span className="text-2xl">🌱</span>
                    Air Quality Impact
                </h3>
                <div className="px-3 py-1 bg-green-100 rounded-full">
                    <span className="text-xs font-bold text-green-700">
                        {activeBatchCount > 0 ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
            </div>

            {/* Main Metrics */}
            <div className="space-y-3">
                {/* CADR Display */}
                <div>
                    <p className="text-sm text-green-600 mb-1">Clean Air Delivery Rate</p>
                    <p className="text-3xl font-black text-green-700">
                        {airQuality.cleanAirVolume} <span className="text-lg">m³/h</span>
                    </p>
                </div>

                {/* Grid Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-600">Daily Volume</p>
                        <p className="text-lg font-bold text-green-600">
                            {airQuality.cleanAirVolumeDaily} m³
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-600">VOC Removal</p>
                        <p className="text-lg font-bold text-green-600">
                            {airQuality.vocRemovalEfficiency}%
                        </p>
                    </div>
                </div>

                {/* Status Message */}
                <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                    <p className="text-sm font-bold text-green-800">
                        {airQuality.message}
                    </p>
                </div>

                {/* Recommendation */}
                <p className="text-xs text-green-600 italic">
                    {airQuality.recommendation}
                </p>

                {/* Active Batches Info */}
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-green-200">
                    <span>Active Trays: {airQuality.activeBatches}</span>
                    <span>Fan Mode: {airQuality.fanMode}</span>
                </div>
            </div>
        </div>
    );
};

export default BiofilterWidget;
