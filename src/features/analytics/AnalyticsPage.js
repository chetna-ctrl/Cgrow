import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus, Activity, Droplets, Thermometer, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { predictCropHealth } from '../../utils/cropHealthPredictor';
import { useMicrogreens } from '../microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../hydroponics/hooks/useHydroponics';
// import { isDemoMode } from '../../utils/sampleData';

const AnalyticsPage = () => {
    // Systems & Logs handled by React Query now
    const [selectedSystem, setSelectedSystem] = useState('');
    const [period, setPeriod] = useState(7); // Days

    // 1. USE CENTRAL HOOKS instead of custom queries
    const { batches } = useMicrogreens();
    const { systems: hydroSystems } = useHydroponics();

    const systems = useMemo(() => {
        const activeBatches = (batches || [])
            .filter(b => {
                const s = (b.status || '').toLowerCase();
                // Exclude if harvested, deleted, or missing status
                return s && !s.includes('harvest') && s !== 'deleted' && s !== 'inactive';
            })
            .map(b => ({
                id: `mg-${b.id}`,
                realId: b.id,
                name: `${b.crop || 'Active Batch'} - ${b.batch_id || b.id}`,
                type: 'Microgreens'
            }));

        const activeHydro = (hydroSystems || [])
            .filter(s => {
                const st = (s.status || '').toLowerCase();
                return st && !st.includes('harvest') && st !== 'deleted' && st !== 'inactive';
            })
            .map(s => ({
                id: `hydro-${s.id}`,
                realId: s.id,
                name: `${s.crop || 'Active System'} - ${s.system_id || s.id}`,
                type: 'Hydroponics'
            }));

        return [...activeBatches, ...activeHydro];
    }, [batches, hydroSystems]);

    const loadingSystems = false;

    // Auto-select first system if loaded and none selected OR if current selection is now invalid (harvested/deleted)
    useEffect(() => {
        if (systems.length > 0) {
            const currentIsValid = systems.some(sys => sys.id === selectedSystem);
            if (!selectedSystem || !currentIsValid) {
                setSelectedSystem(systems[0].id);
            }
        } else if (systems.length === 0 && selectedSystem) {
            setSelectedSystem('');
        }
    }, [systems, selectedSystem]);

    // 2. QUERY: Fetch Logs for Selected System
    const { data: logs = [], isLoading: loadingLogs } = useQuery({
        queryKey: ['daily_logs', selectedSystem, period],
        queryFn: async () => {
            if (!selectedSystem) return [];
            const [typePrefix, realId] = selectedSystem.split('-');
            if (!realId) return [];

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - period);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const column = typePrefix === 'mg' ? 'batch_id' : 'target_id';
                const { data } = await supabase
                    .from('daily_logs')
                    .select('id, system_id, batch_id, target_id, ph, ec, temp, humidity, created_at, notes')
                    .eq('user_id', user.id)
                    .eq(column, realId)
                    .gte('created_at', cutoffDate.toISOString())
                    .order('created_at', { ascending: true });
                return data || [];
            }
            return [];
        },
        enabled: !!selectedSystem
    });

    // Calculate Health stats safely (Derived State)
    const systemType = selectedSystem.startsWith('mg-') ? 'Microgreens' : 'Hydroponics';
    const healthData = React.useMemo(() => predictCropHealth(logs || [], systemType), [logs, systemType]);
    const loading = loadingSystems || loadingLogs;

    // Format data for charts
    const chartData = logs.map(log => ({
        date: new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        ph: parseFloat(log.ph) || null,
        ec: parseFloat(log.ec) || null,
        temp: parseFloat(log.temp) || null
    }));

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'Improving') return <TrendingUp className="text-emerald-500" />;
        if (trend === 'Declining') return <TrendingDown className="text-red-500" />;
        return <Minus className="text-slate-500" />;
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Activity className="animate-spin text-emerald-500" size={32} />
                <span className="ml-3 text-slate-600">Loading analytics...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
                <p className="text-slate-600">Crop health insights and trend analysis</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-700 mb-2">Select System</label>
                    <select
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                        value={selectedSystem}
                        onChange={(e) => setSelectedSystem(e.target.value)}
                    >
                        {systems.map(sys => (
                            <option key={sys.id} value={sys.id}>{sys.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-[150px]">
                    <label className="block text-xs font-bold text-slate-700 mb-2">Time Period</label>
                    <select
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                        value={period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>
                </div>
            </div>

            {healthData && (
                <>
                    {/* Health Score Card */}
                    <div className={`p-6 rounded-xl border-2 ${getScoreColor(healthData.score)}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider opacity-70">Crop Health Score</p>
                                <div className="flex items-baseline gap-3 mt-2">
                                    <span className="text-5xl font-bold">{healthData.score}</span>
                                    <span className="text-2xl opacity-70">/100</span>
                                </div>
                                <p className="mt-2 font-bold">{healthData.status}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-2">
                                    {getTrendIcon(healthData.trend)}
                                    <span className="font-bold">{healthData.trend}</span>
                                </div>
                                <p className="text-xs opacity-70">Based on {logs.length} logs</p>
                            </div>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Droplets size={18} className="text-blue-500" />
                                <span className="text-xs font-bold text-slate-600">pH Level</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">
                                {systemType === 'Microgreens' ? 'Soil Based' : (healthData.breakdown?.ph?.avg?.toFixed(1) || 'N/A')}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{systemType === 'Microgreens' ? 'Not Required' : (healthData.breakdown?.ph?.status || 'No Data')}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={18} className="text-purple-500" />
                                <span className="text-xs font-bold text-slate-600">EC Level</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">
                                {systemType === 'Microgreens' ? 'Soil Based' : (healthData.breakdown?.ec?.avg?.toFixed(1) || 'N/A')} {systemType !== 'Microgreens' && healthData.breakdown?.ec?.avg ? 'mS' : ''}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{systemType === 'Microgreens' ? 'Not Required' : (healthData.breakdown?.ec?.status || 'No Data')}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Thermometer size={18} className="text-orange-500" />
                                <span className="text-xs font-bold text-slate-600">Temperature</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">
                                {healthData.breakdown?.temp?.avg?.toFixed(1) || 'N/A'}{healthData.breakdown?.temp?.avg ? '°C' : ''}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{healthData.breakdown?.temp?.status || 'No Data'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={18} className="text-emerald-500" />
                                <span className="text-xs font-bold text-slate-600">Stability</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">
                                {logs.length < 3 ? (
                                    <span className="text-base text-slate-400">Not enough data</span>
                                ) : (
                                    <>{healthData.breakdown?.stability?.score || 0}/20</>
                                )}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {logs.length < 3 ? 'Log at least 3 days' : (healthData.breakdown?.stability?.status || 'No Data')}
                            </p>
                        </div>
                    </div>

                    {/* Charts */}
                    {chartData.length > 0 && (
                        <>
                            {/* pH Chart */}
                            {systemType === 'Microgreens' ? (
                                <div className="bg-slate-50 p-6 rounded-xl border border-dotted border-slate-300 text-center flex flex-col justify-center items-center h-[312px]">
                                    <Droplets size={32} className="text-slate-300 mb-2" />
                                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">pH Sensor Data Not Required</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Microgreens use soil/coco-peat. Health is linked to Humidity/Temp.</p>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4">pH Trend</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <YAxis domain={[4, 8]} stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <Tooltip />
                                            <Legend />
                                            <ReferenceLine y={5.5} stroke="#ef4444" strokeDasharray="3 3" label="Min" />
                                            <ReferenceLine y={6.5} stroke="#ef4444" strokeDasharray="3 3" label="Max" />
                                            <Line type="monotone" dataKey="ph" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* EC Chart */}
                            {systemType === 'Microgreens' ? (
                                <div className="bg-slate-50 p-6 rounded-xl border border-dotted border-slate-300 text-center flex flex-col justify-center items-center h-[312px]">
                                    <Activity size={32} className="text-slate-300 mb-2" />
                                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">EC Logic Not Required</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Nutrient strength is managed via pre-mixed media for Microgreens.</p>
                                </div>
                            ) : (
                                <div className="bg-white p-6 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4">EC Trend (mS)</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <YAxis domain={[0, 4]} stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <Tooltip />
                                            <Legend />
                                            <ReferenceLine y={1.2} stroke="#10b981" strokeDasharray="3 3" label="Min" />
                                            <ReferenceLine y={2.5} stroke="#10b981" strokeDasharray="3 3" label="Max" />
                                            <Line type="monotone" dataKey="ec" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* Temperature Chart */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-900 mb-4">Temperature Trend (°C)</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                                        <YAxis domain={[10, 35]} stroke="#64748b" style={{ fontSize: '12px' }} />
                                        <Tooltip />
                                        <Legend />
                                        <ReferenceLine y={18} stroke="#f59e0b" strokeDasharray="3 3" label="Min" />
                                        <ReferenceLine y={28} stroke="#f59e0b" strokeDasharray="3 3" label="Max" />
                                        <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}

                    {/* Recommendations */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={20} className="text-blue-500" />
                            Issues & Recommendations
                        </h3>
                        <div className="space-y-3">
                            {healthData.issues.map((issue, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <AlertCircle size={18} className="text-amber-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-bold text-amber-900">{issue}</p>
                                        <p className="text-sm text-amber-700 mt-1">{healthData.recommendations[idx]}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {logs.length === 0 && (
                <div className="bg-slate-50 p-12 rounded-xl border border-slate-200 text-center">
                    <Activity size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">No Data Available</h3>
                    <p className="text-slate-600">Start logging daily measurements in the Daily Tracker to see analytics here.</p>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
