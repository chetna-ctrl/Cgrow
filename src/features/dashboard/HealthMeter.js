import React from 'react';
import { calculateFarmHealth } from '../../utils/agriUtils'; // Import logic

const HealthMeter = ({ latestLog }) => {
    // Default to 100/Perfect if no logic yet
    if (!latestLog) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center h-full justify-center opacity-50">
                <p className="text-gray-400 font-bold">No Data Yet</p>
                <p className="text-xs text-gray-400">Log daily metrics to see Health Score</p>
            </div>
        )
    }

    // Calculate Score
    const { score, reasons } = calculateFarmHealth(latestLog);

    // Color Logic
    let color = '#10B981'; // Green
    let message = 'Perfect Condition 🌟';
    if (score < 80) { color = '#F59E0B'; message = 'Needs Attention ⚠️'; } // Yellow
    if (score < 50) { color = '#EF4444'; message = 'Critical Risk 🚨'; } // Red

    // Circle CSS Logic
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center h-full">
            <h3 className="text-gray-500 font-bold mb-4 uppercase text-xs tracking-wider">
                Overall Farm Health
            </h3>

            {/* Circular Progress Bar */}
            <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle cx="64" cy="64" r={radius} stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                    {/* Active Score Circle */}
                    <circle
                        cx="64" cy="64" r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Score Text in Middle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-800">{Math.round(score)}</span>
                    <span className="text-xs text-gray-400">/100</span>
                </div>
            </div>

            {/* Status Message */}
            <div className="text-center w-full">
                <p className="font-bold text-lg mb-1" style={{ color: color }}>{message}</p>

                {/* Why did score drop? Show penalties */}
                {reasons.length > 0 && (
                    <div className="bg-red-50 p-2 rounded text-left mt-2 w-full">
                        <p className="text-[10px] font-bold text-red-500 mb-1 border-b border-red-100 pb-1">ISSUES FOUND:</p>
                        <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                            {reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthMeter;
