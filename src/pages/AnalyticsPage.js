import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Minus, Activity, Droplets, Thermometer,
    Wind, Zap, AlertTriangle, CheckCircle, XCircle, Brain, BarChart3, Sprout
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { fetchWithTimeout, handleSupabaseError } from '../utils/supabaseHelpers';
import { useQuery } from '@tanstack/react-query';
import {
    calculateGrowthRate,
    calculateDiseaseRisk,
    calculateRootHealthScore,
    analyzeTrend
} from '../utils/analyticsCalculations';
import {
    calculateVPD,
    analyzeCumulativeVPDStress,
    generateContextAwareAlerts
} from '../utils/agriUtils';
import { useMicrogreens } from '../features/microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../features/hydroponics/hooks/useHydroponics';

const AnalyticsPage = () => {
    // 1. SOURCE OF TRUTH: Fetch Systems Directly
    const { batches: microBatches, loading: loadingMicro } = useMicrogreens();
    const { systems: hydroSystems, loading: loadingHydro } = useHydroponics();

    // Selection State
    const [selectedMicroBatchId, setSelectedMicroBatchId] = useState(null);
    const [selectedHydroSystemId, setSelectedHydroSystemId] = useState(null);

    // Auto-select first available item on load
    useEffect(() => {
        if (!selectedMicroBatchId && microBatches.length > 0) {
            setSelectedMicroBatchId(microBatches[0].id); // Use internal UUID
        }
    }, [microBatches, selectedMicroBatchId]);

    useEffect(() => {
        if (!selectedHydroSystemId && hydroSystems.length > 0) {
            setSelectedHydroSystemId(hydroSystems[0].id); // Use internal UUID
        }
    }, [hydroSystems, selectedHydroSystemId]);

    // 2. TARGETED QUERY: Fetch Logs for Selected Microgreen Batch
    const { data: microLogs = [], isLoading: loadingMicroLogs } = useQuery({
        queryKey: ['logs', 'microgreens', selectedMicroBatchId],
        queryFn: async () => {
            if (!selectedMicroBatchId) return [];
            console.log("Fetching logs for batch:", selectedMicroBatchId);

            // Try matching by batch_id string OR UUID to be safe
            const batch = microBatches.find(b => b.id === selectedMicroBatchId);
            const batchIdString = batch?.batch_id;

            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', (await supabase.auth.getUser()).data.user.id)
                .or(`batch_id.eq.${selectedMicroBatchId},batch_id.eq.${batchIdString}`)
                .order('created_at', { ascending: true }); // Ascending for charts

            if (error) throw error;
            return data || [];
        },
        enabled: !!selectedMicroBatchId,
        staleTime: 0 // Always fetch fresh
    });

    // 3. TARGETED QUERY: Fetch Logs for Selected Hydroponics System
    const { data: hydroLogs = [], isLoading: loadingHydroLogs } = useQuery({
        queryKey: ['logs', 'hydroponics', selectedHydroSystemId],
        queryFn: async () => {
            if (!selectedHydroSystemId) return [];
            console.log("Fetching logs for system:", selectedHydroSystemId);

            const system = hydroSystems.find(s => s.id === selectedHydroSystemId);
            const systemIdString = system?.system_id;

            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', (await supabase.auth.getUser()).data.user.id)
                .or(`target_id.eq.${selectedHydroSystemId},target_id.eq.${systemIdString},system_id.eq.${selectedHydroSystemId}`)
                .order('created_at', { ascending: true }); // Ascending for charts

            if (error) throw error;
            return data || [];
        },
        enabled: !!selectedHydroSystemId,
        staleTime: 0
    });

    // 4. ANALYTICS CALCULATION (Microgreens)
    const microAnalytics = useMemo(() => {
        if (!microLogs.length) return null;

        const humidityValues = microLogs.filter(l => l.humidity).map(l => parseFloat(l.humidity));
        const humidityTrend = analyzeTrend(humidityValues, 40, 60);

        const latest = microLogs[microLogs.length - 1];
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
            totalLogs: microLogs.length
        };
    }, [microLogs]);

    // 5. ANALYTICS CALCULATION (Hydroponics)
    const hydroAnalytics = useMemo(() => {
        if (!hydroLogs.length) return null;

        const phValues = hydroLogs.filter(l => l.ph).map(l => parseFloat(l.ph));
        const phTrend = analyzeTrend(phValues, 5.5, 6.5);

        const ecValues = hydroLogs.filter(l => l.ec).map(l => parseFloat(l.ec));
        const ecTrend = analyzeTrend(ecValues, 1.2, 2.0);

        // Chart Data (Last 20 points for readability)
        const recentLogs = hydroLogs.slice(-20);

        const phData = recentLogs.filter(l => l.ph).map(l => ({
            date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ph: parseFloat(l.ph),
            isEst: l.observation_tags && l.observation_tags.length > 0
        }));

        const ecData = recentLogs.filter(l => l.ec).map(l => ({
            date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ec: parseFloat(l.ec),
            waterLevel: l.water_level ? parseFloat(l.water_level) : null,
            isEst: l.observation_tags && l.observation_tags.length > 0 || l.nutrient_strength
        }));

        const tempData = recentLogs.filter(l => l.water_temp).map(l => ({
            date: new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            temp: parseFloat(l.water_temp)
        }));

        const latest = hydroLogs[hydroLogs.length - 1];
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
                message: `✅ pH stable (${phTrend.stability}%). If maintained, yield ↑ 15%.`,
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
            totalLogs: hydroLogs.length
        };
    }, [hydroLogs]);

    // VPD SRESS ANALYSIS
    const vpdStressAnalysis = useMemo(() => {
        if (!microLogs.length) return null;

        const vpdLogs = microLogs
            .filter(l => l.temp && l.humidity)
            .map(l => {
                const vpdData = calculateVPD(parseFloat(l.temp), parseFloat(l.humidity));
                return {
                    timestamp: l.created_at,
                    vpd_kpa: vpdData.vpd_kpa,
                    vpd: vpdData.vpd_kpa
                };
            });

        if (vpdLogs.length === 0) return null;
        return analyzeCumulativeVPDStress(vpdLogs);
    }, [microLogs]);

    // SMART ALERTS
    const smartAlerts = useMemo(() => {
        const latestMicro = microAnalytics?.latest;
        const latestHydro = hydroAnalytics?.latest;

        if (!latestMicro && !latestHydro) return [];

        const sensorData = {
            airTemp: latestMicro?.temp || latestHydro?.temp,
            humidity: latestMicro?.humidity,
            waterTemp: latestHydro?.water_temp,
            ph: latestHydro?.ph,
            ec: latestHydro?.ec,
            dissolvedOxygen: latestHydro?.dissolved_oxygen,
            lightHours: 16
        };

        const alerts = generateContextAwareAlerts(sensorData);
        return alerts.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH');
    }, [microAnalytics, hydroAnalytics]);


    if (loadingMicro || loadingHydro) {
        return <div className="p-8 flex items-center gap-2"><Activity className="animate-spin text-emerald-500" /> Loading analytics...</div>;
    }

    if (!microBatches.length && !hydroSystems.length) {
        return (
            <div className="p-8 text-center">
                <BarChart3 size={64} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">No Systems Active</h3>
                <p className="text-slate-600">Add a Microgreens Batch or Hydroponic System to see analytics.</p>
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
                    <p className="text-slate-600">Research-Based Intelligence & Historical Trends</p>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* MICROGREENS ANALYTICS */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Sprout className="text-green-600" size={28} />
                        <h2 className="text-2xl font-bold text-green-900">🌿 Microgreens Analytics</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-green-900 mb-2">Select Batch:</label>
                        {microBatches.length > 0 ? (
                            <>
                                <select
                                    className="p-2 border-2 border-green-300 rounded-lg w-full bg-white text-green-900 font-bold"
                                    value={selectedMicroBatchId || ''}
                                    onChange={(e) => setSelectedMicroBatchId(e.target.value)}
                                >
                                    {microBatches.map(batch => (
                                        <option key={batch.id} value={batch.id}>
                                            {batch.crop} ({batch.batch_id}) - {batch.status}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-xs text-green-700 mt-1 block h-4">
                                    {loadingMicroLogs ? 'Fetching logs...' : `${microLogs.length} logs recorded`}
                                </span>
                            </>
                        ) : (
                            <p className="text-sm text-green-700 italic">No microgreens batches found.</p>
                        )}
                    </div>

                    {microLogs.length > 0 && microAnalytics ? (
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
                                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${microAnalytics.humidityTrend.trend === 'Stable' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {microAnalytics.humidityTrend.trend}
                                </span>
                            </div>

                            {/* Disease Risk */}
                            {microAnalytics.diseaseRisk && (
                                <div className={`rounded-lg p-4 border-2 ${microAnalytics.diseaseRisk.level === 'Low' ? 'bg-green-100 border-green-300' : microAnalytics.diseaseRisk.level === 'Medium' ? 'bg-amber-100 border-amber-300' : 'bg-red-100 border-red-300'}`}>
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
                    ) : (
                        selectedMicroBatchId && !loadingMicroLogs && (
                            <div className="p-4 bg-white/50 rounded-lg text-center text-green-800">
                                <p>No logs found for this batch.</p>
                                <p className="text-xs">Go to Daily Tracker to add data.</p>
                            </div>
                        )
                    )}
                </div>

                {/* HYDROPONICS ANALYTICS */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplets className="text-blue-600" size={28} />
                        <h2 className="text-2xl font-bold text-blue-900">💧 Hydroponics Analytics</h2>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-blue-900 mb-2">Select System:</label>
                        {hydroSystems.length > 0 ? (
                            <>
                                <select
                                    className="p-2 border-2 border-blue-300 rounded-lg w-full bg-white text-blue-900 font-bold"
                                    value={selectedHydroSystemId || ''}
                                    onChange={(e) => setSelectedHydroSystemId(e.target.value)}
                                >
                                    {hydroSystems.map(sys => (
                                        <option key={sys.id} value={sys.id}>
                                            {sys.system_id} ({sys.crop || 'Unknown'})
                                        </option>
                                    ))}
                                </select>
                                <span className="text-xs text-blue-700 mt-1 block h-4">
                                    {loadingHydroLogs ? 'Fetching logs...' : `${hydroLogs.length} logs recorded`}
                                </span>
                            </>
                        ) : (
                            <p className="text-sm text-blue-700 italic">No hydroponic systems found.</p>
                        )}
                    </div>

                    {hydroLogs.length > 0 && hydroAnalytics ? (
                        <>
                            {/* pH Trend LINE CHART */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">pH Stability</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hydroAnalytics.phData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#0369a1" />
                                            <YAxis domain={[4, 8]} tick={{ fontSize: 10 }} stroke="#0369a1" />
                                            <Tooltip contentStyle={{ background: '#eff6ff', borderColor: '#0369a1' }} />
                                            <ReferenceLine y={5.5} stroke="#10b981" strokeDasharray="3 3" />
                                            <ReferenceLine y={6.5} stroke="#10b981" strokeDasharray="3 3" />
                                            <Line type="monotone" dataKey="ph" stroke="#0369a1" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* EC Trend LINE CHART */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">EC (Nutrient) Trend</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={hydroAnalytics.ecData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#0369a1" />
                                            <YAxis domain={[0, 3]} tick={{ fontSize: 10 }} stroke="#0369a1" />
                                            <Tooltip contentStyle={{ background: '#eff6ff', borderColor: '#0369a1' }} />
                                            <ReferenceLine y={1.2} stroke="#10b981" strokeDasharray="3 3" />
                                            <ReferenceLine y={2.0} stroke="#10b981" strokeDasharray="3 3" />
                                            <Line type="monotone" dataKey="ec" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Water Temp Area Chart */}
                            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-2">Water Temp (°C)</h3>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={hydroAnalytics.tempData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#0369a1" />
                                            <YAxis domain={[15, 30]} tick={{ fontSize: 10 }} stroke="#0369a1" />
                                            <Tooltip contentStyle={{ background: '#eff6ff', borderColor: '#0369a1' }} />
                                            <ReferenceLine y={24} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Max 24°C', fontSize: 10, fill: '#dc2626' }} />
                                            <Area type="monotone" dataKey="temp" stroke="#0369a1" fill="#e0f2fe" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    ) : (
                        selectedHydroSystemId && !loadingHydroLogs && (
                            <div className="p-4 bg-white/50 rounded-lg text-center text-blue-800">
                                <p>No logs found for this system.</p>
                                <p className="text-xs">Go to Daily Tracker to add data.</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Smart Alerts */}
            {smartAlerts.length > 0 && (
                <div className="mt-6 bg-red-50 rounded-xl p-6 border-2 border-red-200">
                    <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
                        <AlertTriangle /> Critical Alerts
                    </h2>
                    <div className="space-y-3">
                        {smartAlerts.map((alert, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                                <h3 className="font-bold text-red-800">{alert.title}</h3>
                                <p className="text-sm text-slate-700">{alert.immediate_action}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VPD Analysis */}
            {vpdStressAnalysis && selectedMicroBatchId && (
                <div className="mt-6 bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                    <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <Brain /> VPD Analysis
                    </h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-xs text-purple-600">Health Status</p>
                            <p className="font-bold text-lg">{vpdStressAnalysis.health_status}</p>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-xs text-purple-600">Key Issue</p>
                            <p className="font-bold text-lg">{vpdStressAnalysis.hours_too_low > vpdStressAnalysis.hours_too_high ? 'High Humidity' : 'Dry Air'}</p>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm">
                            <p className="text-xs text-purple-600">Yield Impact</p>
                            <p className="font-bold text-lg">{vpdStressAnalysis.predicted_yield_impact}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
