/**
 * DashboardMetrics Component
 * Displays the main bento grid with health, weather, and VPD
 * Extracted from DashboardHome
 */

import React from 'react';
import HealthMeter from './HealthMeter';
import WeatherCard from './WeatherWidget';
import VPDWidget from '../../components/VPDWidget';
import { HelpCircle } from 'lucide-react';

export const DashboardMetrics = ({
    latestLog,
    healthIndex,
    riskItems,
    dataAge,
    weatherData,
    currentConditions
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6">
            {/* 1. MASTER HEALTH (Dominant Primary) */}
            <div className="md:col-span-5 row-span-2 group">
                <div className="h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <HealthMeter
                        latestLog={latestLog}
                        healthIndex={healthIndex}
                        riskItems={riskItems}
                        dataAge={dataAge}
                    />
                </div>
            </div>

            {/* 2. SUPPORTING METRICS (Small/Medium) */}
            <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[240px]">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl shadow-blue-500/20 overflow-hidden text-white relative h-full">
                    <WeatherCard weather={weatherData} />
                    <div className="absolute top-4 right-4 group">
                        <HelpCircle size={16} className="text-white/50 hover:text-white cursor-help" />
                        <div className="absolute right-0 top-6 w-48 p-2 bg-slate-800 text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <strong>Solar Activity:</strong> High solar radiation (&gt;400W/m²) triggers intense photosynthesis, causing plants to drink more water to stay cool.
                        </div>
                    </div>
                </div>
                <div className="h-full">
                    <VPDWidget
                        initialTemp={latestLog?.temp || weatherData?.temp}
                        initialHumidity={latestLog?.humidity || weatherData?.humidity}
                        isLive={currentConditions.isRealData}
                    />
                </div>
            </div>
        </div>
    );
};
