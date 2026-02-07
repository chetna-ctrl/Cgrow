import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
// import { isDemoMode } from '../../utils/sampleData';

const HarvestTimeline = ({ harvests = [] }) => {
    // Process harvests from props
    const upcomingHarvests = harvests.map(item => {
        const daysAway = item.days_until_harvest;
        let dateStr = '';
        let status = 'growing';

        if (daysAway <= 0) {
            dateStr = 'Ready Now!';
            status = 'ready';
        } else if (daysAway === 1) {
            dateStr = 'Tomorrow';
            status = 'ready';
        } else {
            dateStr = `In ${daysAway} Days`;
            status = daysAway <= 2 ? 'ready' : 'growing';
        }

        return {
            crop: item.crop,
            date: dateStr,
            daysAway,
            quantity: `${(item.predicted_yield / 1000).toFixed(1)} kg`,
            status,
            batchId: item.batch_id || item.system_id || item.id,
            type: item.itemType || 'microgreens'
        };
    }).filter(h => h.daysAway <= 30); // Show next 30 days

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Harvest Forecast
                </h3>
                <Link to="/microgreens" className="text-sm text-blue-600 font-medium hover:underline">
                    View All
                </Link>
            </div>

            {upcomingHarvests.length > 0 ? (
                <div className="space-y-4">
                    {upcomingHarvests.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                {/* Icon based on status */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {item.status === 'ready' ? '✅' : '🌱'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{item.crop}</p>
                                    <p className="text-xs text-gray-500">Est. Yield: {item.quantity}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`block text-sm font-bold ${item.status === 'ready' ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {item.date}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {item.batchId}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-slate-600 text-sm">No upcoming harvests</p>
                    <p className="text-xs text-slate-400 mt-1">Create batches to see harvest timeline</p>
                </div>
            )}

            {/* Quick Action Button */}
            <Link
                to="/microgreens"
                className="block w-full mt-6 py-2 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors text-sm font-medium text-center"
            >
                + Schedule New Harvest
            </Link>
        </div>
    );
};

export default HarvestTimeline;
