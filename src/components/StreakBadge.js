// src/components/StreakBadge.js
// Gamification: Display user's current logging streak

import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Zap, Calendar } from 'lucide-react';
import { calculateStreak, getStreakBadge } from '../utils/agronomyLogic';
import { supabase } from '../lib/supabaseClient';
// import { isDemoMode } from '../utils/sampleData';

const StreakBadge = ({ showDetails = true }) => {
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastLogDate, setLastLogDate] = useState(null);

    useEffect(() => {
        const loadStreak = async () => {
            try {
                let logs = [];

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data } = await supabase
                    .from('daily_logs')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(60);

                logs = data || [];

                const calculatedStreak = calculateStreak(logs);
                setStreak(calculatedStreak);

                if (logs.length > 0) {
                    setLastLogDate(new Date(logs[0].created_at));
                }
            } catch (err) {
                console.error('Streak load error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStreak();
    }, []);

    const badge = getStreakBadge(streak);

    // Check if logged today
    const loggedToday = lastLogDate &&
        new Date().toDateString() === new Date(lastLogDate).toDateString();

    if (loading) {
        return (
            <div className="animate-pulse bg-slate-100 rounded-xl p-4 h-24" />
        );
    }

    // Compact badge (for headers/sidebars)
    if (!showDetails) {
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-bold text-sm ${badge.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                badge.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                        badge.color === 'green' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-slate-100 text-slate-600'
                }`}>
                <span className="text-lg">{badge.emoji}</span>
                <span>{badge.label}</span>
            </div>
        );
    }

    // Full badge with details
    return (
        <div className={`p-5 rounded-2xl border-2 transition-all ${badge.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200' :
            badge.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' :
                badge.color === 'yellow' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' :
                    badge.color === 'green' ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' :
                        'bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${badge.color === 'orange' ? 'bg-orange-500' :
                        badge.color === 'purple' ? 'bg-purple-500' :
                            badge.color === 'yellow' ? 'bg-yellow-500' :
                                badge.color === 'green' ? 'bg-emerald-500' :
                                    'bg-slate-400'
                        }`}>
                        {badge.emoji}
                    </div>
                    <div>
                        <p className={`text-xl font-bold ${badge.color === 'orange' ? 'text-orange-700' :
                            badge.color === 'purple' ? 'text-purple-700' :
                                badge.color === 'yellow' ? 'text-yellow-700' :
                                    badge.color === 'green' ? 'text-emerald-700' :
                                        'text-slate-700'
                            }`}>
                            {badge.label}
                        </p>
                        <p className="text-sm text-slate-500">{badge.message}</p>
                    </div>
                </div>

                {/* Today's status */}
                <div className={`px-3 py-2 rounded-lg text-center ${loggedToday
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                    }`}>
                    <div className="flex items-center gap-1 text-sm font-bold">
                        {loggedToday ? (
                            <>
                                <Zap size={14} /> Logged
                            </>
                        ) : (
                            <>
                                <Calendar size={14} /> Log Today!
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Streak visualization */}
            {streak > 0 && (
                <div className="mt-4 flex gap-1">
                    {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-2 rounded-full ${badge.color === 'orange' ? 'bg-orange-400' :
                                badge.color === 'purple' ? 'bg-purple-400' :
                                    badge.color === 'yellow' ? 'bg-yellow-400' :
                                        badge.color === 'green' ? 'bg-emerald-400' :
                                            'bg-slate-300'
                                }`}
                        />
                    ))}
                    {streak < 7 && Array.from({ length: 7 - streak }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1 h-2 rounded-full bg-slate-200" />
                    ))}
                </div>
            )}

            {streak === 0 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-slate-400">
                        Log your first entry today to start your streak! 🌱
                    </p>
                </div>
            )}
        </div>
    );
};

export default StreakBadge;
