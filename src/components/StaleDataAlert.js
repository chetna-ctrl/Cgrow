/**
 * StaleDataAlert Component
 * Warns users when data is outdated and intelligence may be inaccurate
 * Phase 2: Intelligence Enhancement
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock } from 'lucide-react';

export const StaleDataAlert = ({ latestLog, threshold = 12 }) => {
    if (!latestLog) {
        return (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4 flex items-start gap-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                    <h3 className="font-bold text-amber-900 text-sm">No Recent Data</h3>
                    <p className="text-xs text-amber-700 mt-1">
                        Dashboard is showing generic weather data. Log your first entry to activate farm-specific intelligence.
                    </p>
                    <Link
                        to="/tracker"
                        className="inline-block mt-2 text-xs font-bold text-amber-800 hover:underline"
                    >
                        Start Logging →
                    </Link>
                </div>
            </div>
        );
    }

    const dataAge = (Date.now() - new Date(latestLog.created_at)) / (1000 * 60 * 60);

    if (dataAge < threshold) return null;

    const severity = dataAge > 48 ? 'critical' : dataAge > 24 ? 'warning' : 'info';
    const bgColor = severity === 'critical' ? 'bg-red-50 border-red-500' :
        severity === 'warning' ? 'bg-amber-50 border-amber-500' :
            'bg-blue-50 border-blue-500';
    const textColor = severity === 'critical' ? 'text-red-900' :
        severity === 'warning' ? 'text-amber-900' :
            'text-blue-900';
    const iconColor = severity === 'critical' ? 'text-red-600' :
        severity === 'warning' ? 'text-amber-600' :
            'text-blue-600';

    return (
        <div className={`${bgColor} border-l-4 p-4 rounded-r-lg mb-4 flex items-start gap-3`}>
            <Clock className={`${iconColor} flex-shrink-0`} size={24} />
            <div className="flex-1">
                <h3 className={`font-bold ${textColor} text-sm`}>
                    ⚠️ Data is {Math.round(dataAge)} hours old
                </h3>
                <p className={`text-xs ${textColor.replace('900', '700')} mt-1`}>
                    Health scores and predictions may be inaccurate. Intelligence degrades without fresh data.
                </p>
                {dataAge > 72 && (
                    <p className={`text-xs ${textColor.replace('900', '800')} mt-1 font-bold`}>
                        🚨 Critical: System has been in "passive mode" for {Math.floor(dataAge / 24)} days.
                        Please update to restore predictive capabilities.
                    </p>
                )}
                <Link
                    to="/tracker"
                    className={`inline-block mt-2 text-xs font-bold ${textColor} hover:underline`}
                >
                    Update Now →
                </Link>
            </div>
        </div>
    );
};
