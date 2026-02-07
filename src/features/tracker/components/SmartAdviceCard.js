/**
 * SmartAdviceCard Component
 * Displays daily task advice based on batch age
 * Extracted from DailyTrackerPage
 */

import React from 'react';
import { BookOpen } from 'lucide-react';

export const SmartAdviceCard = ({ advice }) => {
    if (!advice) return null;

    return (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fade-in">
            <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                <BookOpen size={16} />
                📅 Day {advice.age}: Task Guide
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-start gap-2">
                    <span className="text-xl">{advice.watering.icon}</span>
                    <div>
                        <p className="font-bold text-blue-900">{advice.watering.type}</p>
                        <p className="text-xs text-blue-700 leading-tight">{advice.watering.tip}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <span className="text-xl">💡</span>
                    <div>
                        <p className="font-bold text-orange-800">{advice.lighting.status}</p>
                        <p className="text-xs text-orange-700 leading-tight">{advice.lighting.action}</p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {advice.alerts && advice.alerts.length > 0 && (
                <div className="mt-3 space-y-1">
                    {advice.alerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={`p-2 rounded text-xs ${alert.type === 'danger' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                        >
                            {alert.msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
