// src/components/DailyWalkthrough.js
// "Zen Mode" - Step-by-step daily logging wizard
// Reduces cognitive load by asking one question at a time

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Thermometer, Droplet, Zap, Eye, Sparkles } from 'lucide-react';
import { calculateVPD, getVpdStatus, calculateStreak, getStreakBadge } from '../utils/agronomyLogic';
import { supabase } from '../lib/supabaseClient';
// import { isDemoMode } from '../utils/sampleData';

const DailyWalkthrough = ({ systemId, systemType, onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        visual_check: '',
        temp: '',
        humidity: '',
        ph: '',
        ec: '',
        notes: ''
    });
    const [vpd, setVpd] = useState(null);
    const [streak, setStreak] = useState(0);

    // Calculate VPD when temp/humidity changes
    useEffect(() => {
        if (formData.temp && formData.humidity) {
            const val = calculateVPD(parseFloat(formData.temp), parseFloat(formData.humidity));
            setVpd(val);
        } else {
            setVpd(null);
        }
    }, [formData.temp, formData.humidity]);

    // Load streak on mount
    useEffect(() => {
        const loadStreak = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: logs } = await supabase
                    .from('daily_logs')
                    .select('created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(60);

                setStreak(calculateStreak(logs || []));
            } catch (err) {
                console.error('Streak load error:', err);
            }
        };
        loadStreak();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const logData = {
                system_id: systemId || 'default',
                system_type: systemType || 'Hydroponics',
                visual_check: formData.visual_check,
                temp: formData.temp ? parseFloat(formData.temp) : null,
                humidity: formData.humidity ? parseFloat(formData.humidity) : null,
                ph: formData.ph ? parseFloat(formData.ph) : null,
                ec: formData.ec ? parseFloat(formData.ec) : null,
                notes: formData.notes,
                created_at: new Date().toISOString()
            };

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not logged in');

            const { error } = await supabase
                .from('daily_logs')
                .insert([{ ...logData, user_id: user.id }]);

            if (error) throw error;
            setStreak(streak + 1); // Optimistic update

            setStep(5); // Success screen
        } catch (err) {
            alert('Error saving log: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const vpdInfo = getVpdStatus(vpd);
    const streakBadge = getStreakBadge(streak);

    // Progress bar
    const progress = ((step - 1) / 4) * 100;

    // STEP 1: Visual Check (Quick Win)
    if (step === 1) {
        return (
            <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="text-emerald-600" size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">👋 Quick Visual Check</h2>
                    <p className="text-slate-500 mb-6">How do your plants look today?</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { value: 'Looks Good', emoji: '🌿', color: 'emerald' },
                            { value: 'Drooping', emoji: '🥀', color: 'amber' },
                            { value: 'Yellowing', emoji: '🍂', color: 'yellow' },
                            { value: 'Mold Detected', emoji: '🍄', color: 'red' }
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    setFormData({ ...formData, visual_check: opt.value });
                                    setStep(2);
                                }}
                                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${formData.visual_check === opt.value
                                    ? `border-${opt.color}-500 bg-${opt.color}-50`
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <span className="text-3xl mb-2 block">{opt.emoji}</span>
                                <span className="text-sm font-medium text-slate-700">{opt.value}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        className="text-slate-400 text-sm hover:text-slate-600"
                    >
                        Skip to data →
                    </button>
                </div>
            </div>
        );
    }

    // STEP 2: Environment (VPD Calculator)
    if (step === 2) {
        return (
            <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Thermometer className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Environment Check</h2>
                            <p className="text-sm text-slate-500">Auto-calculates VPD for you!</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">
                                🌡️ Temperature (°C)
                            </label>
                            <input
                                name="temp"
                                type="number"
                                value={formData.temp}
                                onChange={handleChange}
                                placeholder="24"
                                className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">
                                💧 Humidity (%)
                            </label>
                            <input
                                name="humidity"
                                type="number"
                                value={formData.humidity}
                                onChange={handleChange}
                                placeholder="60"
                                className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* VPD Display */}
                    {vpd !== null && (
                        <div className={`p-5 rounded-xl mb-6 border-2 ${vpdInfo.color === 'green' ? 'bg-emerald-50 border-emerald-200' :
                            vpdInfo.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                                vpdInfo.color === 'red' ? 'bg-red-50 border-red-200' :
                                    'bg-amber-50 border-amber-200'
                            }`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-2xl font-bold text-slate-800">
                                    VPD: {vpd} kPa
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${vpdInfo.color === 'green' ? 'bg-emerald-500 text-white' :
                                    vpdInfo.color === 'blue' ? 'bg-blue-500 text-white' :
                                        vpdInfo.color === 'red' ? 'bg-red-500 text-white' :
                                            'bg-amber-500 text-white'
                                    }`}>
                                    {vpdInfo.icon} {vpdInfo.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600">{vpdInfo.recommendation}</p>
                        </div>
                    )}

                    {!vpd && (
                        <div className="p-5 rounded-xl mb-6 bg-slate-50 border-2 border-dashed border-slate-200 text-center">
                            <p className="text-slate-400">Enter temp & humidity to see VPD analysis</p>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
                        >
                            Next: Water <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 3: Water Metrics (pH/EC)
    if (step === 3) {
        return (
            <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                            <Droplet className="text-cyan-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Water Metrics</h2>
                            <p className="text-sm text-slate-500">Optional - only if you measured today</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">
                                🧪 pH Level <span className="font-normal text-slate-400">(Target: 5.5 - 6.5)</span>
                            </label>
                            <input
                                name="ph"
                                type="number"
                                step="0.1"
                                value={formData.ph}
                                onChange={handleChange}
                                placeholder="6.0"
                                className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-2">
                                ⚡ EC <span className="font-normal text-slate-400">(mS/cm)</span>
                            </label>
                            <input
                                name="ec"
                                type="number"
                                step="0.1"
                                value={formData.ec}
                                onChange={handleChange}
                                placeholder="1.2"
                                className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(2)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                        <button
                            onClick={() => setStep(4)}
                            className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-cyan-700"
                        >
                            Next: Notes <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 4: Notes & Submit
    if (step === 4) {
        return (
            <div className="max-w-lg mx-auto">
                {/* Progress */}
                <div className="h-2 bg-slate-200 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Sparkles className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Any Notes?</h2>
                            <p className="text-sm text-slate-500">Observations, todos, anything!</p>
                        </div>
                    </div>

                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="e.g., 'Added Cal-Mag today', 'Spotted aphids on leaf #3'..."
                        rows={4}
                        className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-purple-500 focus:outline-none resize-none mb-6"
                    />

                    {/* Summary */}
                    <div className="bg-slate-50 p-4 rounded-xl mb-6">
                        <p className="text-sm font-bold text-slate-600 mb-2">📋 Log Summary:</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <span>Visual: {formData.visual_check || 'Not set'}</span>
                            <span>Temp: {formData.temp || '-'}°C</span>
                            <span>Humidity: {formData.humidity || '-'}%</span>
                            <span>VPD: {vpd || '-'} kPa</span>
                            <span>pH: {formData.ph || '-'}</span>
                            <span>EC: {formData.ec || '-'} mS/cm</span>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(3)}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
                        >
                            <ChevronLeft size={20} /> Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : '✅ Save Log'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // STEP 5: Success & Streak!
    if (step === 5) {
        return (
            <div className="max-w-lg mx-auto">
                <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="text-emerald-600" size={48} />
                    </div>

                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Log Saved! 🎉</h2>
                    <p className="text-slate-500 mb-6">Great job keeping the farm healthy.</p>

                    {/* Streak Badge */}
                    <div className={`inline-block p-6 rounded-2xl mb-6 ${streakBadge.color === 'orange' ? 'bg-orange-50 border-2 border-orange-200' :
                        streakBadge.color === 'purple' ? 'bg-purple-50 border-2 border-purple-200' :
                            streakBadge.color === 'yellow' ? 'bg-yellow-50 border-2 border-yellow-200' :
                                'bg-emerald-50 border-2 border-emerald-200'
                        }`}>
                        <span className="text-5xl mb-2 block">{streakBadge.emoji}</span>
                        <span className={`text-xl font-bold ${streakBadge.color === 'orange' ? 'text-orange-600' :
                            streakBadge.color === 'purple' ? 'text-purple-600' :
                                streakBadge.color === 'yellow' ? 'text-yellow-600' :
                                    'text-emerald-600'
                            }`}>
                            {streakBadge.label}
                        </span>
                        <p className="text-sm text-slate-500 mt-1">{streakBadge.message}</p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onComplete}
                            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
                        >
                            Back to Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setStep(1);
                                setFormData({ visual_check: '', temp: '', humidity: '', ph: '', ec: '', notes: '' });
                            }}
                            className="w-full text-slate-500 hover:text-slate-700"
                        >
                            Log Another System
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default DailyWalkthrough;
