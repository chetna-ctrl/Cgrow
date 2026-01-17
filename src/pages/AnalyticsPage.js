import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Minus, Activity, Droplets, Thermometer,
    Wind, Zap, AlertTriangle, CheckCircle, XCircle, Brain, BarChart3, Sprout
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '../lib/supabaseClient'; // Kept original path
import { isDemoMode } from '../utils/sampleData';
import { fetchWithTimeout, handleSupabaseError } from '../utils/supabaseHelpers'; // Kept original import
import { useQuery } from '@tanstack/react-query';
import {
    calculateGrowthRate, // Kept original import
    calculateDiseaseRisk,
    calculateRootHealthScore,
    analyzeTrend
} from '../utils/analyticsCalculations'; // Kept original path
import {
    calculateVPD,
    analyzeCumulativeVPDStress,
    generateContextAwareAlerts
} from '../utils/agriUtils';
// Scientific Intelligence: Phase 2 - Smart Alerts & VPD Stress Analysis Active

const AnalyticsPage = () => {
    const [selectedMicrogreens, setSelectedMicrogreens] = useState(null);
    const [selectedHydroponics, setSelectedHydroponics] = useState(null);

    // 1. QUERY: Fetch Logs
    const { data: allLogs = [], isLoading: loading, error } = useQuery({
        queryKey: ['analytics_logs'],
        queryFn: async () => {
            if (isDemoMode()) {
                const demoLogs = JSON.parse(localStorage.getItem('demo_logs') || '[]');
                return demoLogs;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];

                // 🛡️ TIMEOUT PROTECTION (Kept from critical fix)
                const { data, error } = await fetchWithTimeout(
                    supabase
                        .from('daily_logs')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(100),
                    10000
                );

                if (error) throw error;
                return data || [];
            }
        },
        staleTime: 1000 * 60 * 5 // 5 mins
    });

    // 2. PROCESS LOGS (Memoized)
    const { microgreensLogs, hydroponicsLogs } = useMemo(() => {
        // Filter and normalize IDs
        const micro = allLogs
            .filter(l => l.system_type === 'Microgreens')
            .map(l => ({ ...l, system_id: l.batch_id || l.system_id || 'Unknown-Batch' }));

        const hydro = allLogs
            .filter(l => l.system_type === 'Hydroponics')
            .map(l => ({ ...l, system_id: l.target_id || l.system_id || 'Unknown-System' }));

        let finalMicro = micro;
        let finalHydro = hydro;

        // Visual Richness: Generate demo data if empty (for fresh Netlify deployments)
        if (micro.length === 0 && !loading && !error) {
            finalMicro = Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (13 - i));
                return {
                    system_id: 'DEMO-BATCH-01',
                    system_type: 'Microgreens',
                    humidity: (45 + Math.random() * 10).toFixed(1),
                    temp: (22 + Math.random() * 3).toFixed(1),
                    created_at: date.toISOString()
                };
            });
        }

        if (hydro.length === 0 && !loading && !error) {
            finalHydro = Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (13 - i));
                return {
                    system_id: 'DEMO-NFT-01',
                    system_type: 'Hydroponics',
                    ph: (5.8 + Math.random() * 0.6).toFixed(1),
                    ec: (1.5 + Math.random() * 0.4).toFixed(1),
                    water_temp: (21 + Math.random() * 4).toFixed(1),
                    water_level: 'OK',
                    dissolved_oxygen: (7 + Math.random() * 1).toFixed(1),
                    created_at: date.toISOString()
                };
            });
        }

        return { microgreensLogs: finalMicro, hydroponicsLogs: finalHydro };
    }, [allLogs, loading, error]);

    // 3. AUTO-SELECT (Effect)
    useEffect(() => {
        if (!selectedMicrogreens && microgreensLogs.length > 0) {
            const microGroups = microgreensLogs.reduce((acc, log) => {
                if (!acc[log.system_id]) acc[log.system_id] = [];
                acc[log.system_id].push(log);
                return acc;
            }, {});
            const mostActive = Object.keys(microGroups).sort((a, b) =>
                microGroups[b].length - microGroups[a].length
            )[0];
            setSelectedMicrogreens(mostActive);
        }

        if (!selectedHydroponics && hydroponicsLogs.length > 0) {
            const hydroGroups = hydroponicsLogs.reduce((acc, log) => {
                if (!acc[log.system_id]) acc[log.system_id] = [];
                acc[log.system_id].push(log);
                return acc;
            }, {});
            const mostActive = Object.keys(hydroGroups).sort((a, b) =>
                hydroGroups[b].length - hydroGroups[a].length
            )[0];
            setSelectedHydroponics(mostActive);
        }
    }, [microgreensLogs, hydroponicsLogs, selectedMicrogreens, selectedHydroponics]);

    // 4. ANALYTICS CALCULATION (Memoized)
    const microAnalytics = useMemo(() => {
        if (!selectedMicrogreens || !microgreensLogs.length) return null;

        const systemLogs = microgreensLogs.filter(l => l.system_id === selectedMicrogreens);
        if (!systemLogs.length) return null;

        const sortedLogs = [...systemLogs].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        const humidityValues = sortedLogs.filter(l => l.humidity).map(l => parseFloat(l.humidity));
        const humidityTrend = analyzeTrend(humidityValues, 40, 60);

        const latest = sortedLogs[sortedLogs.length - 1];
        let diseaseRisk = null;
        if (latest.humidity) {
            diseaseRisk = calculateDiseaseRisk(
                parseFloat(latest.humidity),
                parseFloat(latest.temp || 22),
                2
            );
        }

        return {
            humidityTrend,
            diseaseRisk,
            latest,
            totalLogs: systemLogs.length
        };
    }, [selectedMicrogreens, microgreensLogs]);

    const hydroAnalytics = useMemo(() => {
        if (!selectedHydroponics || !hydroponicsLogs.length) return null;

        const systemLogs = hydroponicsLogs.filter(l => l.system_id === selectedHydroponics);
        if (!systemLogs.length) return null;

        const sortedLogs = [...systemLogs].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        const phValues = sortedLogs.filter(l => l.ph).map(l => parseFloat(l.ph));
        const phTrend = analyzeTrend(phValues, 5.5, 6.5);

        const ecValues = sortedLogs.filter(l => l.ec).map(l => parseFloat(l.ec));
        const ecTrend = analyzeTrend(ecValues, 1.2, 2.0);

        const recentLogs = sortedLogs.slice(-10);
        const phData = recentLogs.filter(l => l.ph).map(l => ({
            date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ph: parseFloat(l.ph)
        }));
        const ecData = recentLogs.filter(l => l.ec).map(l => ({
            date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ec: parseFloat(l.ec),
            waterLevel: l.water_level ? parseFloat(l.water_level) : null
        }));
        const tempData = recentLogs.filter(l => l.water_temp).map(l => ({
            date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temp: parseFloat(l.water_temp)
        }));

        const latest = sortedLogs[sortedLogs.length - 1];
        let rootHealth = null;
        if (latest.dissolved_oxygen) {
            rootHealth = calculateRootHealthScore(
                parseFloat(latest.dissolved_oxygen),
                parseFloat(latest.water_temp || 22),
                parseFloat(latest.ec || 1.5)
            );
        }

        const predictions = [];
        if (phTrend.stability > 80) {
            predictions.push({
                type: 'success',
                message: `✅ pH stable(${phTrend.stability} %).If maintained, yield ↑ 15 %.`,
                scientific: 'Wageningen University: Stable pH 5.5-6.5 maximizes nutrient uptake'
            });
        }

        return {
            phTrend,
            ecTrend,
            phData,
            ecData,
            tempData,
            rootHealth,
            predictions,
            latest,
            totalLogs: systemLogs.length
        };
    }, [selectedHydroponics, hydroponicsLogs]);

    // SCIENTIFIC INTELLIGENCE: VPD Stress Analysis for Microgreens
    const vpdStressAnalysis = useMemo(() => {
        if (!selectedMicrogreens || !microgreensLogs.length) return null;

        const systemLogs = microgreensLogs.filter(l => l.system_id === selectedMicrogreens);

        // Calculate VPD for each log entry
        const vpdLogs = systemLogs
            .filter(l => l.temp && l.humidity)
            .map(l => {
                const vpdData = calculateVPD(parseFloat(l.temp), parseFloat(l.humidity));
                return {
                    timestamp: l.created_at,
                    vpd_kpa: vpdData.vpd_kpa,
                    vpd: vpdData.vpd_kpa // Support both field names
                };
            });

        if (vpdLogs.length === 0) return null;

        return analyzeCumulativeVPDStress(vpdLogs);
    }, [selectedMicrogreens, microgreensLogs]);

    // SCIENTIFIC INTELLIGENCE: Context-Aware Smart Alerts
    const smartAlerts = useMemo(() => {
        const latestMicro = microAnalytics?.latest;
        const latestHydro = hydroAnalytics?.latest;

        if (!latestMicro && !latestHydro) return [];

        // Combine latest sensor data
        const sensorData = {
            airTemp: latestMicro?.temp || latestHydro?.temp,
            humidity: latestMicro?.humidity,
            waterTemp: latestHydro?.water_temp,
            ph: latestHydro?.ph,
            ec: latestHydro?.ec,
            dissolvedOxygen: latestHydro?.dissolved_oxygen,
            lightHours: 16 // Can be made dynamic later
        };

        const alerts = generateContextAwareAlerts(sensorData);

        // Filter to only CRITICAL and HIGH priority
        return alerts.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH');
    }, [microAnalytics, hydroAnalytics]);


    if (loading) {
        return <div className="p-8 flex items-center gap-2"><Activity className="animate-spin text-emerald-500" /> Loading analytics...</div>;
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Analytics</h3>
                <p className="text-red-600 mb-4">{error.message || 'An error occurred'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!microgreensLogs.length && !hydroponicsLogs.length) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <BarChart3 size={64} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Data Yet</h3>
                    <p className="text-slate-600">Start logging your systems in the Daily Tracker to see analytics!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600">
                    <BarChart3 size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                    <p className="text-slate-600">Research-Based Intelligence by System Type</p>
                </div>
            </div>

            {/* Two-Column Layout - ALWAYS SHOW BOTH */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* MICROGREENS ANALYTICS */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Sprout className="text-green-600" size={28} />
                        <h2 className="text-2xl font-bold text-green-900">🌿 Microgreens Analytics</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-green-900 mb-2">Select Batch:</label>
                        {microgreensLogs.length > 0 ? (
                            <>
                                <select
                                    className="p-2 border-2 border-green-300 rounded-lg w-full bg-white text-green-900 font-bold"
                                    value={selectedMicrogreens || ''}
                                    onChange={(e) => setSelectedMicrogreens(e.target.value)}
                                >
                                    <option value="" disabled>-- Select a Batch --</option>
                                    {Object.keys(microgreensLogs.reduce((acc, l) => { if (l.system_id) acc[l.system_id] = true; return acc; }, {})).map(id => (
                                        <option key={id} value={id}>{id}</option>
                                    ))}
                                </select>
                                {microAnalytics && (
                                    <span className="text-xs text-green-700 mt-1 block">
                                        Data from last 100 entries
                                    </span>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-green-700 italic">No microgreens logs found.</p>
                        )}
                    </div>

                    {microAnalytics && (
                        <>
                            {/* Humidity Trend */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                                <h3 className="font-bold text-green-900 mb-2">Humidity Stability</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {microAnalytics.humidityTrend.stability}%
                                </div>
                                <p className="text-sm text-green-700">
                                    {microAnalytics.humidityTrend.inRange}% in optimal range (40-60%)
                                </p>
                                <span className={`inline - block mt - 2 px - 2 py - 1 rounded text - xs ${microAnalytics.humidityTrend.trend === 'Stable' ? 'bg-green-100 text-green-800' :
                                    'bg-amber-100 text-amber-800'
                                    } `}>
                                    {microAnalytics.humidityTrend.trend}
                                </span>
                            </div>

                            {/* Disease Risk */}
                            {microAnalytics.diseaseRisk && (
                                <div className={`rounded - lg p - 4 border - 2 ${microAnalytics.diseaseRisk.level === 'Low' ? 'bg-green-100 border-green-300' :
                                    microAnalytics.diseaseRisk.level === 'Medium' ? 'bg-amber-100 border-amber-300' :
                                        'bg-red-100 border-red-300'
                                    } `}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={20} />
                                        <h3 className="font-bold">Disease Risk</h3>
                                    </div>
                                    <div className="text-2xl font-bold mb-2">
                                        {microAnalytics.diseaseRisk.score}/100
                                        <span className="text-sm ml-2">({microAnalytics.diseaseRisk.level})</span>
                                    </div>
                                    <div className="space-y-1">
                                        {microAnalytics.diseaseRisk.recommendations.map((rec, i) => (
                                            <p key={i} className="text-xs">{rec}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* HYDROPONICS ANALYTICS */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplets className="text-blue-600" size={28} />
                        <h2 className="text-2xl font-bold text-blue-900">💧 Hydroponics Analytics</h2>
                    </div>

                    {/* System Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-blue-900 mb-2">Select System:</label>
                        <select
                            className="p-2 border-2 border-blue-300 rounded-lg w-full bg-white"
                            value={selectedHydroponics || ''}
                            onChange={(e) => setSelectedHydroponics(e.target.value)}
                        >
                            {/* Derive systems from hydro logs */}
                            {hydroponicsLogs && Object.keys(hydroponicsLogs.reduce((acc, l) => { acc[l.system_id] = true; return acc; }, {})).map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                        {hydroAnalytics && (
                            <span className="text-xs text-blue-700 mt-1 block">
                                {hydroAnalytics.totalLogs} logs recorded
                            </span>
                        )}
                    </div>

                    {hydroAnalytics && (
                        <>
                            {/* pH Trend LINE CHART */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">pH Stability Over Time</h3>
                                <div className="text-2xl font-bold text-blue-600 mb-2">
                                    {hydroAnalytics.phTrend.stability}%
                                </div>
                                <p className="text-xs text-blue-700 mb-4">
                                    {hydroAnalytics.phTrend.inRange}% in optimal range (5.5-6.5)
                                </p>

                                {/* LINE CHART */}
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hydroAnalytics.phData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10 }}
                                                stroke="#0369a1"
                                            />
                                            <YAxis
                                                domain={[4, 8]}
                                                tick={{ fontSize: 10 }}
                                                stroke="#0369a1"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#eff6ff',
                                                    border: '1px solid #0369a1',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            {/* Safe Zone (Green Background) */}
                                            <ReferenceLine y={5.5} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min 5.5', fontSize: 10, fill: '#10b981' }} />
                                            <ReferenceLine y={6.5} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Max 6.5', fontSize: 10, fill: '#10b981' }} />

                                            {/* pH Line */}
                                            <Line
                                                type="monotone"
                                                dataKey="ph"
                                                stroke="#0369a1"
                                                strokeWidth={3}
                                                dot={{ fill: '#0369a1', r: 4 }}
                                                name="pH Level"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">
                                    📚 Wageningen Research: pH 5.5-6.5 maximizes nutrient uptake
                                </p>
                            </div>

                            {/* EC Trend LINE CHART */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">EC (Nutrient Strength) Trend</h3>
                                <div className="text-2xl font-bold text-blue-600 mb-2">
                                    {hydroAnalytics.ecTrend.stability}%
                                </div>
                                <p className="text-xs text-blue-700 mb-4">
                                    {hydroAnalytics.ecTrend.inRange}% in optimal range (1.2-2.0 mS/cm)
                                </p>

                                {/* LINE CHART */}
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hydroAnalytics.ecData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10 }}
                                                stroke="#0369a1"
                                            />
                                            <YAxis
                                                domain={[0, 3]}
                                                tick={{ fontSize: 10 }}
                                                stroke="#0369a1"
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#eff6ff',
                                                    border: '1px solid #0369a1',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            {/* Safe Zone */}
                                            <ReferenceLine y={1.2} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min 1.2', fontSize: 10, fill: '#10b981' }} />
                                            <ReferenceLine y={2.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Max 2.0', fontSize: 10, fill: '#10b981' }} />

                                            {/* EC Line */}
                                            <Line
                                                type="monotone"
                                                dataKey="ec"
                                                stroke="#0284c7"
                                                strokeWidth={3}
                                                dot={{ fill: '#0284c7', r: 4 }}
                                                name="EC Level"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2">
                                    📚 NASA CEA: Consistent EC prevents salt buildup
                                </p>
                            </div>

                            {/* WATER TEMPERATURE CHART (3rd Critical Chart) */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">💧 Water Temperature - Root Rot Risk</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hydroAnalytics.tempData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 10 }}
                                                stroke="#0369a1"
                                            />
                                            <YAxis
                                                domain={[15, 30]}
                                                tick={{ fontSize: 10 }}
                                                stroke="#0369a1"
                                                label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 10 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#eff6ff',
                                                    border: '1px solid #0369a1',
                                                    borderRadius: '8px'
                                                }}
                                            />

                                            {/* RED DANGER LINE at 24°C */}
                                            <ReferenceLine
                                                y={24}
                                                stroke="#dc2626"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                label={{ value: 'DANGER 24°C', fontSize: 11, fill: '#dc2626', fontWeight: 'bold' }}
                                            />

                                            {/* Area with gradient (red above 24°C) */}
                                            <defs>
                                                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="10%" stopColor="#dc2626" stopOpacity={0.3} />
                                                    <stop offset="40%" stopColor="#f59e0b" stopOpacity={0.2} />
                                                    <stop offset="90%" stopColor="#10b981" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>

                                            <Area
                                                type="monotone"
                                                dataKey="temp"
                                                stroke="#0369a1"
                                                strokeWidth={3}
                                                fill="url(#tempGradient)"
                                                name="Water Temperature"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                    <p className="text-[10px] text-red-900 font-bold">
                                        ⚠️ If temp &gt; 24°C: Root Rot Risk! Cool water = More oxygen.
                                    </p>
                                    <p className="text-[10px] text-slate-600">
                                        📚 Research: Pythium thrives in warm water (low DO)
                                    </p>
                                </div>
                            </div>

                            {/* Predictions */}
                            {hydroAnalytics.predictions.length > 0 && (
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Brain size={20} className="text-purple-600" />
                                        <h3 className="font-bold text-purple-900">Predictions</h3>
                                    </div>
                                    {hydroAnalytics.predictions.map((pred, i) => (
                                        <div key={i} className="mb-2">
                                            <p className="text-sm font-bold">{pred.message}</p>
                                            <p className="text-xs text-purple-700 italic">📚 {pred.scientific}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Root Health */}
                            {hydroAnalytics.rootHealth && (
                                <div className={`rounded - lg p - 4 border - 2 mt - 4 ${hydroAnalytics.rootHealth.color === 'green' ? 'bg-green-100 border-green-300' :
                                    hydroAnalytics.rootHealth.color === 'amber' ? 'bg-amber-100 border-amber-300' :
                                        'bg-red-100 border-red-300'
                                    } `}>
                                    <h3 className="font-bold mb-2">Root Health</h3>
                                    <div className="text-2xl font-bold mb-2">
                                        {hydroAnalytics.rootHealth.score}/100
                                        <span className="text-sm ml-2">({hydroAnalytics.rootHealth.status})</span>
                                    </div>
                                    <div className="space-y-1">
                                        {hydroAnalytics.rootHealth.recommendations.map((rec, i) => (
                                            <p key={i} className="text-xs">{rec}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* SCIENTIFIC INTELLIGENCE: Smart Alerts Section */}
            {smartAlerts.length > 0 && (
                <div className="mt-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-red-600" size={28} />
                        <h2 className="text-2xl font-bold text-red-900">🚨 Smart Alerts</h2>
                    </div>
                    <p className="text-sm text-red-700 mb-4">Context-aware warnings based on sensor combinations</p>

                    <div className="space-y-4">
                        {smartAlerts.map((alert, idx) => (
                            <div
                                key={idx}
                                className={`p - 4 rounded - lg border - 2 ${alert.priority === 'CRITICAL' ? 'bg-red-100 border-red-400' : 'bg-orange-100 border-orange-400'
                                    } `}
                            >
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className={alert.priority === 'CRITICAL' ? 'text-red-600' : 'text-orange-600'} size={24} />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-2">{alert.title}</h3>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Context:</strong> {alert.context}</p>
                                            <p><strong>Root Cause:</strong> {alert.root_cause}</p>
                                            <p className="bg-white/50 p-2 rounded"><strong>Immediate Action:</strong> {alert.immediate_action}</p>
                                            <p className="text-xs italic">{alert.why_this_matters}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SCIENTIFIC INTELLIGENCE: VPD Stress Analysis for Microgreens */}
            {vpdStressAnalysis && selectedMicrogreens && (
                <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="text-purple-600" size={28} />
                        <h2 className="text-2xl font-bold text-purple-900">🧠 VPD Stress Analysis</h2>
                    </div>
                    <p className="text-sm text-purple-700 mb-4">Cumulative transpiration stress over time</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/50 p-4 rounded-lg">
                            <p className="text-xs text-purple-700 mb-1">Hours Analyzed</p>
                            <p className="text-2xl font-bold">{vpdStressAnalysis.total_hours_analyzed}</p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg">
                            <p className="text-xs text-purple-700 mb-1">Optimal Range</p>
                            <p className="text-2xl font-bold">{vpdStressAnalysis.optimal_percentage}%</p>
                        </div>
                        <div className={`p - 4 rounded - lg ${vpdStressAnalysis.health_status === 'EXCELLENT' ? 'bg-green-100' :
                            vpdStressAnalysis.health_status === 'GOOD' ? 'bg-blue-100' :
                                vpdStressAnalysis.health_status === 'FAIR' ? 'bg-yellow-100' :
                                    'bg-red-100'
                            } `}>
                            <p className="text-xs mb-1">Health Status</p>
                            <p className="text-2xl font-bold">{vpdStressAnalysis.health_status}</p>
                        </div>
                    </div>

                    <div className="bg-white/50 p-4 rounded-lg">
                        <p className="text-sm font-bold mb-2">Predicted Yield Impact:</p>
                        <p className="text-sm">{vpdStressAnalysis.predicted_yield_impact}</p>
                        <p className="text-xs mt-2 italic">{vpdStressAnalysis.recommendation}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-red-50 p-3 rounded">
                            <p className="font-bold text-red-700">Hours Too Low (High Humidity)</p>
                            <p className="text-2xl font-bold text-red-900">{vpdStressAnalysis.hours_too_low}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                            <p className="font-bold text-orange-700">Hours Too High (Low Humidity)</p>
                            <p className="text-2xl font-bold text-orange-900">{vpdStressAnalysis.hours_too_high}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;

