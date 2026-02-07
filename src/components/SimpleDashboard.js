/**
 * SimpleDashboard Component
 * Beginner-friendly dashboard with only 3 essential cards
 * Phase 3: UX Simplification
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, Scissors, ArrowRight } from 'lucide-react';

export const SimpleDashboard = ({ healthIndex, upcomingHarvests, nextTask }) => {
    const getHealthStatus = (score) => {
        if (score >= 80) return { label: 'Excellent', color: 'green', emoji: '🌟' };
        if (score >= 60) return { label: 'Good', color: 'emerald', emoji: '✅' };
        if (score >= 40) return { label: 'Needs Attention', color: 'amber', emoji: '⚠️' };
        return { label: 'Critical', color: 'red', emoji: '🚨' };
    };

    const status = getHealthStatus(healthIndex || 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. FARM HEALTH */}
            <div className={`bg-gradient-to-br from-${status.color}-50 to-${status.color}-100 rounded-3xl p-8 border-2 border-${status.color}-200 shadow-xl`}>
                <div className="flex items-center gap-3 mb-4">
                    <Activity className={`text-${status.color}-600`} size={28} />
                    <h3 className="text-lg font-bold text-slate-900">Farm Health</h3>
                </div>

                <div className="text-center my-6">
                    <div className={`text-7xl font-black text-${status.color}-600`}>
                        {healthIndex || 0}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">out of 100</p>
                </div>

                <div className="bg-white/50 rounded-xl p-3 text-center">
                    <p className="text-2xl mb-1">{status.emoji}</p>
                    <p className={`font-bold text-${status.color}-800`}>{status.label}</p>
                </div>
            </div>

            {/* 2. NEXT TASK */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-blue-600" size={28} />
                    <h3 className="text-lg font-bold text-slate-900">What's Next?</h3>
                </div>

                {nextTask ? (
                    <div className="space-y-4">
                        <div className="bg-white/70 rounded-xl p-4">
                            <p className="text-sm text-blue-600 font-bold mb-1">TODAY'S TASK</p>
                            <p className="text-lg font-black text-slate-900">{nextTask.title}</p>
                            <p className="text-sm text-slate-600 mt-2">{nextTask.description}</p>
                        </div>
                        <Link to="/tracker">
                            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                Log Daily Check <ArrowRight size={18} />
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500 mb-4">All caught up! 🎉</p>
                        <Link to="/tracker">
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
                                Log Update
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            {/* 3. HARVEST READY */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 border-2 border-amber-200 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <Scissors className="text-amber-600" size={28} />
                    <h3 className="text-lg font-bold text-slate-900">Ready to Harvest</h3>
                </div>

                {upcomingHarvests && upcomingHarvests.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingHarvests.slice(0, 2).map((harvest, idx) => (
                            <div key={idx} className="bg-white/70 rounded-xl p-4">
                                <p className="font-black text-slate-900 text-lg">{harvest.crop}</p>
                                <p className="text-sm text-slate-600">
                                    {harvest.days_until_harvest === 0 ? (
                                        <span className="text-red-600 font-bold">🚨 Harvest NOW!</span>
                                    ) : (
                                        `Ready in ${harvest.days_until_harvest} days`
                                    )}
                                </p>
                                <p className="text-xs text-emerald-600 font-bold mt-1">
                                    Est. ₹{harvest.predicted_revenue?.toLocaleString() || '0'}
                                </p>
                            </div>
                        ))}
                        <Link to={upcomingHarvests[0].itemType === 'microgreens' ? '/microgreens' : '/hydroponics'}>
                            <button className="w-full bg-amber-600 text-white py-2 rounded-xl font-bold hover:bg-amber-700 transition text-sm">
                                View Details →
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-slate-500 mb-2">No harvests scheduled</p>
                        <p className="text-xs text-slate-400">Sow new batches to see predictions</p>
                    </div>
                )}
            </div>
        </div>
    );
};
