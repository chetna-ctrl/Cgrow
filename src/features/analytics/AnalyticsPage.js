import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Droplets, Thermometer, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '../../lib/supabase';
import { predictCropHealth } from '../../utils/cropHealthPredictor';
import { isDemoMode } from '../../utils/sampleData';

const AnalyticsPage = () => {
    const [systems, setSystems] = useState([]);
    const [selectedSystem, setSelectedSystem] = useState('');
    const [logs, setLogs] = useState([]);
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(7); // Days

    // Fetch available systems
    useEffect(() => {
        const fetchSystems = async () => {
            try {
                // Check if user is logged in first
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // LOGGED IN: Fetch from Supabase (same as Microgreens/Hydroponics pages)
                    const { data: batches, error: batchError } = await supabase
                        .from('batches')
                        .select('id, crop, batch_id, status')
                        .eq('user_id', user.id)
                        .neq('status', 'Harvested');

                    if (batchError) console.error('Batches fetch error:', batchError);

                    const { data: hydroSystems, error: sysError } = await supabase
                        .from('systems')
                        .select('id, system_id, crop, system_type, status')
                        .eq('user_id', user.id)
                        .not('status', 'ilike', '%harvested%');

                    if (sysError) console.error('Systems fetch error:', sysError);

                    const allSystems = [
                        ...(batches || []).map(b => ({
                            id: b.id,
                            name: `${b.crop || 'Unknown'} - Batch ${b.batch_id || b.id}`,
                            type: 'Microgreens'
                        })),
                        ...(hydroSystems || []).map(s => ({
                            id: s.id,
                            name: `${s.crop || 'Unknown'} - ${s.system_type || s.system_id || 'System'}`,
                            type: 'Hydroponics'
                        }))
                    ];

                    // DEBUG: Log what we're setting
                    console.log('📊 Analytics: Batches from DB:', batches);
                    console.log('📊 Analytics: Systems from DB:', hydroSystems);
                    console.log('📊 Analytics: Combined systems for dropdown:', allSystems);

                    setSystems(allSystems);
                    if (allSystems.length > 0) setSelectedSystem(allSystems[0].id);
                    setLoading(false);
                    return;
                }

                // NOT LOGGED IN: Check demo mode localStorage
                if (isDemoMode()) {
                    const demoBatches = JSON.parse(localStorage.getItem('demo_batches') || '[]');
                    const demoSystems = JSON.parse(localStorage.getItem('demo_systems') || '[]');

                    const allSystems = [
                        ...demoBatches
                            .filter(b => b.status?.toLowerCase() !== 'harvested')
                            .map(b => ({
                                id: b.id,
                                name: `${b.crop || 'Unknown'} - Batch ${b.batch_id || b.id}`,
                                type: 'Microgreens'
                            })),
                        ...demoSystems
                            .filter(s => s.status?.toLowerCase() !== 'harvested')
                            .map(s => ({
                                id: s.system_id || s.id,
                                name: `${s.crop || 'Unknown'} - ${s.system_type || s.system_id || 'System'}`,
                                type: 'Hydroponics'
                            }))
                    ];

                    setSystems(allSystems);
                    if (allSystems.length > 0) setSelectedSystem(allSystems[0].id);
                }
            } catch (err) {
                console.error('Failed to fetch systems:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSystems();
    }, []);

    // Fetch logs when system or period changes
    useEffect(() => {
        if (!selectedSystem) return;

        const fetchLogs = async () => {
            setLoading(true);
            try {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - period);

                // Check if user is logged in first
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // LOGGED IN: Fetch from Supabase
                    const { data } = await supabase
                        .from('daily_logs')
                        .select('id, system_id, ph, ec, temp, humidity, created_at, notes')
                        .eq('user_id', user.id)
                        .eq('system_id', selectedSystem)
                        .gte('created_at', cutoffDate.toISOString())
                        .order('created_at', { ascending: true });

                    setLogs(data || []);
                    const health = predictCropHealth(data || []);
                    setHealthData(health);
                    setLoading(false);
                    return;
                }

                // NOT LOGGED IN: Try demo_logs from localStorage
                const demoLogs = JSON.parse(localStorage.getItem('demo_logs') || '[]');
                const filteredLogs = demoLogs.filter(log => {
                    const logDate = new Date(log.created_at);
                    const systemMatch = String(log.system_id) === String(selectedSystem);
                    return systemMatch && logDate >= cutoffDate;
                }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                setLogs(filteredLogs);
                const health = predictCropHealth(filteredLogs);
                setHealthData(health);
            } catch (err) {
                console.error('Failed to fetch logs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [selectedSystem, period]);

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
                                {healthData.breakdown?.ph?.avg?.toFixed(1) || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{healthData.breakdown?.ph?.status || 'No Data'}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={18} className="text-purple-500" />
                                <span className="text-xs font-bold text-slate-600">EC Level</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900">
                                {healthData.breakdown?.ec?.avg?.toFixed(1) || 'N/A'} {healthData.breakdown?.ec?.avg ? 'mS' : ''}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{healthData.breakdown?.ec?.status || 'No Data'}</p>
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

                            {/* EC Chart */}
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
