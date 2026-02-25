import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import {
    DollarSign, TrendingUp, TrendingDown, Plus, Calendar,
    PieChart, CreditCard, AlertCircle, Save, Trash2,
    Calculator, Settings, RefreshCw, Package, ChevronRight,
    Leaf, Droplets, Wind, Sun, Sprout, Hammer, Box, Zap, Brain
} from 'lucide-react';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useMicrogreens } from '../microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../hydroponics/hooks/useHydroponics';
import { calculateFeasibility } from '../../utils/financeEngine';
import { predictProfitability } from '../../utils/mlIntelligence';

// --- CHEAT SHEET CONSTANTS ---
const EFFICIENCY_FACTOR = 0.65;
const DEFAULT_PRICES = {
    // COMMON INFRASTRUCTURE
    electricityRate: 10, // ₹ per unit
    laborSalary: 15000, // Monthly per worker
    rentPerSqft: 40,
    waterRate: 0.10, // per liter

    // CLIMATE CONTROL
    acCost: 35000, // per 1.5 ton unit
    exhaustFan: 2000, // Heavy duty
    humidifier: 8000, // Industrial mist maker
    dehumidifier: 15000, // For closed rooms

    // MICROGREENS
    mg_rackCost: 4500,
    mg_trayCost: 120,
    mg_mediaKg: 50,
    mg_seedsPerKg: 4000,
    mg_packaging: 5,

    // HYDROPONICS COMMON
    hydro_standFrame: 3500, // Metal fabrication per rack
    hydro_reservoirTank: 5000, // 200-500L
    hydro_waterPump: 2000, // Reliable submersible
    hydro_growLights: 1200, // per tube/bar
    hydro_nutrients: 1500, // per month set

    // AUTOMATION (IOT)
    iot_controller: 1200, // ESP32 + Relays
    iot_sensors: 3500, // pH + EC + Temp probes

    // HYDRO - NFT SPECIFIC
    nft_channelPer12ft: 850,
    nft_plumbingKit: 3000, // Manifold + end caps

    // HYDRO - DWC SPECIFIC
    dwc_raftBoard: 1200, // XPS Sheet
    dwc_netCups: 2, // per cup
    dwc_airPumpHeavy: 4500, // High pressure pump

    // HYDRO - EBB & FLOW SPECIFIC
    flood_trayTable: 5000, // 4x8 Tray
    flood_lecaMedia: 800, // 50L bag of clay pebbles
    flood_siphonKit: 1200, // Bell siphon

    // HYDRO - DRIP (DUTCH BUCKET) SPECIFIC
    drip_bucket: 450, // Per bucket + 2 elbows + lid
    drip_mediaPerBucket: 150, // Perlite/Clay mix
    drip_irrigationKit: 2500, // Drip lines, stakes, manifold per rack

    // HYDRO - AEROPONICS (HIGH TECH)
    aero_nozzles: 150, // High pressure misting nozzle
    aero_pumpHighPressure: 6500, // 100 PSI+ Diaphragm pump
    aero_accumulator: 2000, // Pressure tank
    aero_cycleTimer: 1800 // Seconds ON/OFF timer
};

const CROP_PRICES = {
    'Lettuce': 180, 'Basil': 350, 'Tomato': 60, 'Spinach': 100, 'Cucumber': 50, 'Capsicum': 120,
    'Radish': 120, 'Sunflower': 150, 'Pea Shoots': 140, 'Mustard': 100, 'Wheatgrass': 80, 'Broccoli': 130
};

// ... (Cost Categories same as before)
const COST_CATEGORIES = [
    { id: 'seeds', label: 'Seeds / Spores', icon: '🌱' },
    { id: 'media', label: 'Grow Media (Soil/Coco)', icon: '🟫' },
    { id: 'nutrients', label: 'Nutrients / Fertilizer', icon: '🧪' },
    { id: 'electricity', label: 'Electricity (Bills)', icon: '⚡' },
    { id: 'labor', label: 'Labor / Wages', icon: '👨‍🌾' },
    { id: 'maintenance', label: 'Maintenance / Repairs', icon: '🔧' },
    { id: 'packaging', label: 'Packaging', icon: '📦' },
    { id: 'other', label: 'Other', icon: '📝' }
];

const FinancePage = () => {
    return (<ErrorBoundary><FinanceTabs /></ErrorBoundary>);
};

const FinanceTabs = () => {
    const [activeTab, setActiveTab] = useState('ledger');
    return (
        <div className="space-y-6 pb-20">
            <div className="flex p-1 bg-slate-100 rounded-xl mx-auto max-w-md">
                <button onClick={() => setActiveTab('ledger')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ledger' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><CreditCard size={16} /> Real Ledger</button>
                <button onClick={() => setActiveTab('calculator')} className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'calculator' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Calculator size={16} /> Feasibility Engine</button>
            </div>
            {activeTab === 'ledger' ? <FinanceLedger /> : <FeasibilityCalculator />}
        </div>
    );
};

// ... FinanceLedger Component (Kept same as previous version, omitted for brevity in this full re-write to focus on Calculator changes)
// I will include the full FinanceLedger code here to ensure the file is complete.

const FinanceLedger = () => {
    const { t } = useBeginnerMode();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);

    // 1. Fetch Microgreens Harvests
    const { data: microHarvests = [], isLoading: loadingMicro } = useQuery({
        queryKey: ['harvests'],
        queryFn: async () => {
            const { data, error } = await supabase.from('harvests').select('*').order('harvest_date', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    // 2. Fetch Hydroponics Harvests
    const { data: hydroHarvests = [], isLoading: loadingHydro } = useQuery({
        queryKey: ['harvest_records'],
        queryFn: async () => {
            const { data, error } = await supabase.from('harvest_records').select('*').order('harvest_date', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    // 3. Normalized Combine
    const allHarvests = useMemo(() => {
        const normalizedMicro = microHarvests.map(h => ({
            ...h,
            type: 'Microgreens',
            quantity_weight: h.quantity_weight || h.yield_grams || 0, // Handle both schemes
            revenue: h.revenue || h.total_revenue || 0,
            display_notes: h.notes || 'Microgreens Harvest'
        }));

        const normalizedHydro = hydroHarvests.map(h => ({
            ...h,
            type: h.source_type === 'microgreens' ? 'Microgreens' : 'Hydroponics',
            quantity_weight: (h.yield_kg || 0) * 1000, // KG to grams
            revenue: h.total_revenue || 0,
            display_notes: `${h.crop || 'Harvest'} (${h.quality_grade || 'A'})`
        }));

        return [...normalizedMicro, ...normalizedHydro].sort((a, b) => new Date(b.harvest_date) - new Date(a.harvest_date));
    }, [microHarvests, hydroHarvests]);

    const { data: costs = [], isLoading: loadingCosts } = useQuery({
        queryKey: ['costs'],
        queryFn: async () => {
            const { data, error } = await supabase.from('costs').select('*').order('date', { ascending: false });
            if (error) return [];
            return data || [];
        }
    });

    const stats = useMemo(() => {
        const totalRevenue = allHarvests.reduce((sum, h) => sum + (h.revenue || 0), 0);
        const totalCosts = costs.reduce((sum, c) => sum + (c.amount || 0), 0);
        const netProfit = totalRevenue - totalCosts;
        const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
        return { totalRevenue, totalCosts, netProfit, margin, count: allHarvests.length };
    }, [allHarvests, costs]);

    const addCostMutation = useMutation({
        mutationFn: async (newCost) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");
            const { error } = await supabase.from('costs').insert([{ ...newCost, user_id: user.id }]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['costs']);
            setShowAddModal(false);
        }
    });

    // --- AI PROJECTION LOGIC ---
    const { batches: activeBatches = [] } = useMicrogreens();
    const { systems: activeSystems = [] } = useHydroponics();

    const aiProjections = useMemo(() => {
        const microPredictions = activeBatches
            .filter(b => b.status !== 'Harvested')
            .map(batch => {
                const marketRate = CROP_PRICES[batch.crop] || 150;
                return predictProfitability({ healthScore: batch.healthScore || 90, weightGrams: (batch.qty || 1) * 200, totalCosts: 50 }, marketRate);
            });

        const hydroPredictions = activeSystems
            .filter(s => s.status !== 'Harvested')
            .map(system => {
                const marketRate = CROP_PRICES[system.crop] || 150;
                return predictProfitability({ healthScore: system.healthScore || 85, weightGrams: 5000, totalCosts: 1200 }, marketRate);
            });

        const all = [...microPredictions, ...hydroPredictions];
        const totalProjected = all.reduce((sum, p) => sum + parseFloat(p.projectedProfit), 0);
        const avgROI = all.length > 0 ? all.reduce((sum, p) => sum + parseFloat(p.roi), 0) / all.length : 0;

        return { totalProjected, avgROI, count: all.length };
    }, [activeBatches, activeSystems]);

    if (loadingMicro || loadingHydro || loadingCosts) return <div className="p-10 text-center text-slate-400">Loading Finance Data...</div>;

    return (
        <div>
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">{t("Farm Finance", "Financial Ledger")}</h1>
                    <p className="text-slate-500 text-sm font-bold">{t("Track every rupee in & out.", "Real-time P&L Statement")}</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all font-bold">
                    <Plus size={20} /> {t("Add Expense", "Log Cost")}
                </button>
            </div>

            {allHarvests.length === 0 && costs.length === 0 && (
                <div className="bg-slate-50 p-10 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center mb-6">
                    <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                        <DollarSign size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Finance Data Yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Start by logging a harvest or adding an expense to see your profit analytics.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={24} /></div>
                        <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Income</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-700">₹{stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">From {stats.count} Yields</div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={24} /></div>
                        <span className="text-xs font-black uppercase text-red-400 tracking-wider">Expenses</span>
                    </div>
                    <div className="text-3xl font-black text-red-700">₹{stats.totalCosts.toLocaleString()}</div>
                    <div className="text-xs text-red-600 font-bold mt-1">{costs.length} Transactions</div>
                </div>

                <div className={`p-6 rounded-2xl border ${stats.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${stats.netProfit >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            <PieChart size={24} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wider ${stats.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>Net Profit</span>
                    </div>
                    <div className={`text-3xl font-black ${stats.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {stats.netProfit >= 0 ? '+' : ''}₹{stats.netProfit.toLocaleString()}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{stats.margin}% Margin</div>
                </div>
            </div>

            {/* AI PROFIT PREDICTOR BLOCK */}
            {aiProjections.count > 0 && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-800 mb-6 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Brain size={120} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                <Brain size={20} />
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">ML Profit Forecast</h3>
                        </div>
                        <h2 className="text-xl font-bold mb-1">Potential Profit: <span className="text-emerald-400">₹{aiProjections.totalProjected.toLocaleString()}</span></h2>
                        <p className="text-xs text-slate-400 font-medium">Based on {aiProjections.count} active batches/systems and current market rates.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-center px-6 py-2 bg-slate-800 rounded-2xl border border-slate-700">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Avg. ROI</p>
                            <p className="text-xl font-black text-indigo-400">{aiProjections.avgROI.toFixed(1)}%</p>
                        </div>
                        <div className="text-center px-6 py-2 bg-slate-800 rounded-2xl border border-slate-700">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Status</p>
                            <p className="text-xl font-black text-emerald-400">OPT-IN</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col"><div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-700">Recent Expenses</h3></div><div className="flex-1 overflow-auto max-h-[400px] p-2 space-y-2">{costs.map(cost => (<div key={cost.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">{COST_CATEGORIES.find(c => c.label === cost.category)?.icon || '💸'}</div><div><p className="font-bold text-slate-700 text-sm">{cost.category}</p><p className="text-xs text-slate-400">{cost.description}</p></div></div><div className="text-right"><p className="font-black text-red-600">-₹{cost.amount}</p><p className="text-[10px] text-slate-400">{new Date(cost.date).toLocaleDateString()}</p></div></div>))}</div></div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                    <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-700">Recent Income</h3></div>
                    <div className="flex-1 overflow-auto max-h-[400px] p-2 space-y-2">
                        {allHarvests.map(h => (
                            <div key={`${h.type}-${h.id}`} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-[10px] flex-col">
                                        <span>{h.quantity_weight >= 1000 ? `${(h.quantity_weight / 1000).toFixed(1)}kg` : `${h.quantity_weight}g`}</span>
                                        <span className="opacity-50 scale-75">{h.type === 'Hydroponics' ? '💧' : '🌱'}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">{h.display_notes || 'Harvest'}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-black">{h.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-emerald-600">+₹{h.revenue}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(h.harvest_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {allHarvests.length === 0 && <p className="p-4 text-center text-slate-400 text-xs italic">No income logged yet</p>}
                    </div>
                </div>
            </div>
            {showAddModal && <AddCostModal onClose={() => setShowAddModal(false)} onSubmit={(d) => addCostMutation.mutate(d)} loading={addCostMutation.isLoading} />}
        </div>
    );
};

// ============================================
// 2. FEASIBILITY CALCULATOR V2
// ============================================
const FeasibilityCalculator = () => {
    const [config, setConfig] = useState({
        length: 50,
        width: 30,
        gutterHeight: 12,
        ridgeHeight: 16,
        layers: 4,
        isIndoor: true,
        climate: 'Delhi',
        cropType: 'Lettuce',
        businessType: 'Hydroponics',
        simulationMode: 'realistic',
        isConsultant: false,
        equipmentTier: 'Standard', // Budget | Standard | Premium
        rentedSpace: false,
        applySubsidy: false
    });

    // Sync businessType with config
    const setBusinessType = (type) => setConfig(prev => ({ ...prev, businessType: type, cropType: type === 'Hydroponics' ? 'Lettuce' : 'Radish' }));
    const businessType = config.businessType;

    const [prices, setPrices] = useState(DEFAULT_PRICES);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('agri_os_unit_prices_v2');
        if (saved) setPrices({ ...DEFAULT_PRICES, ...JSON.parse(saved) });
    }, []);

    // Fetch Market Rates from Supabase
    const { data: dbRates = {} } = useQuery({
        queryKey: ['market_rates'],
        queryFn: async () => {
            const { data, error } = await supabase.from('market_rates').select('crop_name, price_per_kg');
            if (error) return {};
            return data.reduce((acc, curr) => ({ ...acc, [curr.crop_name]: curr.price_per_kg }), {});
        }
    });

    const calculation = useMemo(() => {
        return calculateFeasibility(config, dbRates, prices);
    }, [config, dbRates, prices]);

    return (
        <div className="space-y-6">
            {/* 1. SENSITIVITY ALERTS / RISK SIMULATION (CONSULTANT ONLY) */}
            {config.isConsultant && (
                <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between text-white shadow-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle className={config.simulationMode === 'worst' ? 'text-red-400' : 'text-indigo-400'} size={20} />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Investor Simulation Mode</p>
                            <h4 className="font-bold text-sm">Now testing: <span className="text-indigo-400 capitalize">{config.simulationMode} Mode</span></h4>
                        </div>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                        {['worst', 'realistic', 'best'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setConfig({ ...config, simulationMode: mode })}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${config.simulationMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ERROR BOUNDARY WRAPPER FOR LOGIC (CONSULTANT ONLY) */}
            {config.isConsultant && (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-8">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detailed Project Breakdown</h4>
                        <div className="flex gap-6">
                            <div className="text-xs font-bold"><span className="text-slate-500">Structure:</span> ₹{Math.floor(calculation.capex.structure).toLocaleString()}</div>
                            <div className="text-xs font-bold"><span className="text-slate-500">Polyfilm:</span> ₹{Math.floor(calculation.capex.polyfilm).toLocaleString()}</div>
                            <div className="text-xs font-bold"><span className="text-slate-500">Cooling:</span> ₹{Math.floor(calculation.capex.cooling).toLocaleString()}</div>
                            <div className="text-xs font-bold"><span className="text-slate-500">IoT:</span> ₹{Math.floor(calculation.capex.automation).toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ENGINEERING WARNINGS */}
            {calculation.warnings && calculation.warnings.length > 0 && (
                <div className="space-y-2">
                    {calculation.warnings.map((w, i) => (
                        <div key={i} className={`p-4 rounded-xl border flex gap-3 items-center ${w.level === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <p className="text-sm font-bold">{w.message}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Engineering Planning OS <span className="text-slate-400 text-sm font-normal ml-2">v2.5</span></h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Efficiency: {calculation.efficiency}% (Location: {config.climate})</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black border border-slate-200 hover:bg-white transition-all flex items-center gap-2"
                    >
                        <PieChart size={14} /> EXPORT REPORT
                    </button>
                    <button
                        onClick={() => setConfig({ ...config, isConsultant: !config.isConsultant })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${config.isConsultant ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-inner' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                    >
                        <Hammer size={14} />
                        {config.isConsultant ? "CONSULTANT MODE: ON" : "GO PRO: CONSULTANT MODE"}
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setBusinessType('Hydroponics')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${businessType === 'Hydroponics' ? 'bg-white shadow border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Hydroponics</button>
                        <button onClick={() => setBusinessType('Microgreens')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${businessType === 'Microgreens' ? 'bg-white shadow border border-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Microgreens</button>
                    </div>
                    <button onClick={() => setShowSettings(true)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors" title="Edit Unit Prices"><Settings size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">Site & Logic</h3>
                        <div className="flex gap-1">
                            {['Delhi', 'Bangalore', 'Mumbai'].map(loc => (
                                <button key={loc} onClick={() => setConfig({ ...config, climate: loc })} className={`px-2 py-1 text-[10px] font-bold rounded ${config.climate === loc ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{loc}</button>
                            ))}
                        </div>
                    </div>

                    {/* EQUIPMENT TIER SELECTOR */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Build Quality / Tier</label>
                        <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                            {['Budget', 'Standard', 'Premium'].map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => setConfig({ ...config, equipmentTier: tier })}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${config.equipmentTier === tier ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Length (Ft)</label>
                            <input
                                type="number"
                                className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                                value={config.length}
                                onChange={e => setConfig({ ...config, length: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Width (Ft)</label>
                            <input
                                type="number"
                                className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                                value={config.width}
                                onChange={e => setConfig({ ...config, width: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {config.isConsultant && businessType === 'Hydroponics' && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Gutter Ht (Ft)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                                    value={config.gutterHeight}
                                    onChange={e => setConfig({ ...config, gutterHeight: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Ridge Ht (Ft)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                                    value={config.ridgeHeight}
                                    onChange={e => setConfig({ ...config, ridgeHeight: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    )}

                    {businessType === 'Microgreens' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Vertical Layers</label>
                            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border">
                                <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    className="flex-1 accent-indigo-600"
                                    value={config.layers || 4}
                                    onChange={e => setConfig({ ...config, layers: parseInt(e.target.value) })}
                                />
                                <span className="font-black text-slate-900 w-6 text-center">{config.layers || 4}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase">Selected Crop</label>
                        <select
                            className="w-full p-3 bg-slate-50 border rounded-xl font-bold mt-1"
                            value={config.cropType}
                            onChange={e => setConfig({ ...config, cropType: e.target.value })}
                        >
                            {Object.keys(dbRates).length > 0 ?
                                Object.keys(dbRates)
                                    .filter(c => businessType === 'Hydroponics' ? !['Radish', 'Sunflower', 'Pea Shoots', 'Mustard', 'Wheatgrass', 'Broccoli'].includes(c) : ['Radish', 'Sunflower', 'Pea Shoots', 'Mustard', 'Wheatgrass', 'Broccoli'].includes(c))
                                    .map(c => <option key={c} value={c}>{c} (₹{dbRates[c]}/kg)</option>) :
                                Object.keys(CROP_PRICES).map(c => <option key={c} value={c}>{c}</option>)
                            }
                        </select>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-700">Govt. Subsidy (40%)</p>
                                <p className="text-[10px] text-slate-400 font-medium">NHB/MIDH Guidelines</p>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, applySubsidy: !config.applySubsidy })}
                                className={`w-12 h-6 rounded-full transition-all relative ${config.applySubsidy ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.applySubsidy ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Project CapEx (Net)</p>
                            <p className="text-3xl font-black text-indigo-900 mt-2">₹{(calculation.capex.net / 100000).toFixed(2)}L</p>
                            {config.applySubsidy && (
                                <p className="text-[10px] text-indigo-600 font-bold mt-1">Saved ₹{(calculation.capex.subsidy / 100000).toFixed(2)}L via Govt.</p>
                            )}
                        </div>

                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Monthly Profit</p>
                            <p className="text-3xl font-black text-emerald-700 mt-2">₹{Math.floor(calculation.revenue - (calculation.opex.monthly)).toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-1">ROI: {calculation.tenYearROI}% (10-Yr Total)</p>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl text-white">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Break Even</p>
                            <p className="text-3xl font-black text-white mt-2">{calculation.breakEvenYears} Years</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">Capacity: {calculation.capacity} {calculation.units}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-4 pb-2 border-b">OpEx Breakdown (Monthly)</h4>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Power & Labor (80%)</span>
                                    <span className="font-bold">₹{Math.floor(calculation.opex.monthly * 0.8).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Inputs (20%)</span>
                                    <span className="font-bold">₹{Math.floor(calculation.opex.monthly * 0.2).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                showSettings && (
                    <UnitPricesModal
                        prices={prices}
                        onSave={(newPrices) => {
                            setPrices(newPrices);
                            localStorage.setItem('agri_os_unit_prices_v2', JSON.stringify(newPrices));
                            setShowSettings(false);
                        }}
                        onClose={() => setShowSettings(false)}
                    />
                )
            }
        </div >
    );
};

// --- SETTINGS COMPONENT V2 ---
const UnitPricesModal = ({ prices, onSave, onClose }) => {
    const [localPrices, setLocalPrices] = useState(prices);
    const [activeTab, setActiveTab] = useState('common'); // common | microgreens | hydro

    const handleChange = (key, value) => setLocalPrices({ ...localPrices, [key]: parseFloat(value) || 0 });

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-slate-800">Unit Price Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><Trash2 size={20} className="text-slate-400 rotate-45" /></button>
                </div>

                {/* TABS */}
                <div className="flex gap-2 bg-slate-50 p-1 rounded-xl mb-6 flex-shrink-0">
                    {['common', 'microgreens', 'hydro'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider ${activeTab === tab ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab === 'hydro' ? "Hydroponics" : tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {activeTab === 'common' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2"><Zap size={18} /> Global Rates</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-500 font-bold block">Electricity (₹/Unit)</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.electricityRate} onChange={e => handleChange('electricityRate', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Labor Salary (Mo)</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.laborSalary} onChange={e => handleChange('laborSalary', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Rent / sqft</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.rentPerSqft} onChange={e => handleChange('rentPerSqft', e.target.value)} /></div>
                            </div>
                            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2 mt-4"><Wind size={18} /> Climate & Infra</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-500 font-bold block">AC Unit (1.5 Ton)</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.acCost} onChange={e => handleChange('acCost', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Exhaust Fan</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.exhaustFan} onChange={e => handleChange('exhaustFan', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Humidifier</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.humidifier} onChange={e => handleChange('humidifier', e.target.value)} /></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'microgreens' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-emerald-700 border-b border-emerald-100 pb-2 flex items-center gap-2"><Leaf size={18} /> Microgreens Equipment</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-slate-500 font-bold block">Rack Cost</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.mg_rackCost} onChange={e => handleChange('mg_rackCost', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Tray Cost</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.mg_trayCost} onChange={e => handleChange('mg_trayCost', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Media (Coco) / kg</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.mg_mediaKg} onChange={e => handleChange('mg_mediaKg', e.target.value)} /></div>
                                <div><label className="text-xs text-slate-500 font-bold block">Avg Seeds / kg</label><input type="number" className="w-full p-2 bg-slate-50 rounded-lg font-bold" value={localPrices.mg_seedsPerKg} onChange={e => handleChange('mg_seedsPerKg', e.target.value)} /></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hydro' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl">
                                <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2"><Droplets size={18} /> Common Hydro Hardware</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs text-blue-600 font-bold block">Stand/Rack Frame</label><input type="number" className="w-full p-2 bg-white rounded-lg font-bold" value={localPrices.hydro_standFrame} onChange={e => handleChange('hydro_standFrame', e.target.value)} /></div>
                                    <div><label className="text-xs text-blue-600 font-bold block">Reservoir (500L)</label><input type="number" className="w-full p-2 bg-white rounded-lg font-bold" value={localPrices.hydro_reservoirTank} onChange={e => handleChange('hydro_reservoirTank', e.target.value)} /></div>
                                    <div><label className="text-xs text-blue-600 font-bold block">Grow Lights / tube</label><input type="number" className="w-full p-2 bg-white rounded-lg font-bold" value={localPrices.hydro_growLights} onChange={e => handleChange('hydro_growLights', e.target.value)} /></div>
                                    <div className="col-span-2 border-t pt-2 mt-2">
                                        <p className="text-[10px] font-black uppercase text-blue-400 mb-2">Automation & IoT</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="text-xs text-blue-600 font-bold block">IoT Controller</label><input type="number" className="w-full p-2 bg-white rounded-lg font-bold" value={localPrices.iot_controller} onChange={e => handleChange('iot_controller', e.target.value)} /></div>
                                            <div><label className="text-xs text-blue-600 font-bold block">Sensor Kit</label><input type="number" className="w-full p-2 bg-white rounded-lg font-bold" value={localPrices.iot_sensors} onChange={e => handleChange('iot_sensors', e.target.value)} /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border p-4 rounded-xl">
                                    <h4 className="font-bold text-slate-700 mb-2">NFT Specifics</h4>
                                    <div className="space-y-2">
                                        <div><label className="text-xs text-slate-500 block">PVC Channel (12ft)</label><input type="number" className="w-full p-1 bg-slate-50 rounded font-bold text-sm" value={localPrices.nft_channelPer12ft} onChange={e => handleChange('nft_channelPer12ft', e.target.value)} /></div>
                                        <div><label className="text-xs text-slate-500 block">Plumbing Kit / Rack</label><input type="number" className="w-full p-1 bg-slate-50 rounded font-bold text-sm" value={localPrices.nft_plumbingKit} onChange={e => handleChange('nft_plumbingKit', e.target.value)} /></div>
                                    </div>
                                </div>
                                <div className="border p-4 rounded-xl">
                                    <h4 className="font-bold text-slate-700 mb-2">DWC Specifics</h4>
                                    <div className="space-y-2">
                                        <div><label className="text-xs text-slate-500 block">Raft Board (XPS)</label><input type="number" className="w-full p-1 bg-slate-50 rounded font-bold text-sm" value={localPrices.dwc_raftBoard} onChange={e => handleChange('dwc_raftBoard', e.target.value)} /></div>
                                        <div><label className="text-xs text-slate-500 block">Heavy Air Pump</label><input type="number" className="w-full p-1 bg-slate-50 rounded font-bold text-sm" value={localPrices.dwc_airPumpHeavy} onChange={e => handleChange('dwc_airPumpHeavy', e.target.value)} /></div>
                                    </div>
                                </div>

                                {/* Aeroponics Box */}
                                <div className="border p-4 rounded-xl border-cyan-100 bg-cyan-50 col-span-1 md:col-span-2">
                                    <h4 className="font-bold text-cyan-800 mb-2">High-Tech Aeroponics</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs text-cyan-600 block">High Pressure Pump</label><input type="number" className="w-full p-1 bg-white rounded font-bold text-sm" value={localPrices.aero_pumpHighPressure} onChange={e => handleChange('aero_pumpHighPressure', e.target.value)} /></div>
                                        <div><label className="text-xs text-cyan-600 block">Misting Nozzles</label><input type="number" className="w-full p-1 bg-white rounded font-bold text-sm" value={localPrices.aero_nozzles} onChange={e => handleChange('aero_nozzles', e.target.value)} /></div>
                                        <div><label className="text-xs text-cyan-600 block">Accumulator</label><input type="number" className="w-full p-1 bg-white rounded font-bold text-sm" value={localPrices.aero_accumulator} onChange={e => handleChange('aero_accumulator', e.target.value)} /></div>
                                        <div><label className="text-xs text-cyan-600 block">Cycle Timer</label><input type="number" className="w-full p-1 bg-white rounded font-bold text-sm" value={localPrices.aero_cycleTimer} onChange={e => handleChange('aero_cycleTimer', e.target.value)} /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-6 mt-4 border-t flex-shrink-0">
                    <button onClick={() => setLocalPrices(DEFAULT_PRICES)} className="px-4 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl flex items-center gap-2"><RefreshCw size={18} /> Reset</button>
                    <div className="flex-1"></div>
                    <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button onClick={() => onSave(localPrices)} className="px-8 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 shadow-lg">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const AddCostModal = ({ onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({ amount: '', category: 'other', description: '', date: new Date().toISOString().split('T')[0] });
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                <h2 className="text-xl font-black text-slate-800 mb-4">Add Expense</h2>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...formData, amount: parseFloat(formData.amount) }); }} className="space-y-4">
                    <input type="number" required autoFocus className="w-full text-3xl font-black bg-slate-50 rounded-xl p-4" placeholder="₹0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                    <div className="grid grid-cols-2 gap-2">{COST_CATEGORIES.map(cat => <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, category: cat.id })} className={`p-2 rounded-lg text-xs font-bold border ${formData.category === cat.id ? 'bg-slate-800 text-white' : 'bg-white'}`}>{cat.icon} {cat.label.split(' ')[0]}</button>)}</div>
                    <input type="text" className="w-full p-3 bg-slate-50 rounded-xl" placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    <input type="date" required className="w-full p-3 bg-slate-50 rounded-xl" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                    <div className="flex gap-3 pt-4"><button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 bg-slate-50 rounded-xl">Cancel</button><button type="submit" disabled={loading} className="flex-1 py-4 bg-red-500 text-white font-black rounded-xl hover:bg-red-600">{loading ? 'Saving...' : 'Log Expense'}</button></div>
                </form>
            </div>
        </div>
    );
};

export default FinancePage;
