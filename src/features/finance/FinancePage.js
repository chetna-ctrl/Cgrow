import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import {
    DollarSign, TrendingUp, TrendingDown, Plus, Calendar,
    PieChart, CreditCard, AlertCircle, Save, Trash2,
    Calculator, Settings, RefreshCw, Package, ChevronRight,
    Leaf, Droplets, Wind, Sun, Sprout, Hammer, Box, Zap
} from 'lucide-react';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useMicrogreens } from '../microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../hydroponics/hooks/useHydroponics';

// --- CHEAT SHEET CONSTANTS (Expanded for Precision) ---
// Note: These keys align with the refactored settings modal
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
    const { data: harvests = [], isLoading: loadingHarvests } = useQuery({ queryKey: ['harvests'], queryFn: async () => { const { data, error } = await supabase.from('harvests').select('*').order('harvest_date', { ascending: false }); if (error) throw error; return data || []; } });
    const { data: costs = [], isLoading: loadingCosts } = useQuery({ queryKey: ['costs'], queryFn: async () => { const { data, error } = await supabase.from('costs').select('*').order('date', { ascending: false }); if (error) return []; return data || []; } });
    const stats = useMemo(() => {
        const totalRevenue = harvests.reduce((sum, h) => sum + (h.revenue || 0), 0);
        const totalCosts = costs.reduce((sum, c) => sum + (c.amount || 0), 0);
        const netProfit = totalRevenue - totalCosts;
        const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
        return { totalRevenue, totalCosts, netProfit, margin };
    }, [harvests, costs]);
    const addCostMutation = useMutation({
        mutationFn: async (newCost) => { const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Not logged in"); const { error } = await supabase.from('costs').insert([{ ...newCost, user_id: user.id }]); if (error) throw error; },
        onSuccess: () => { queryClient.invalidateQueries(['costs']); setShowAddModal(false); }
    });
    if (loadingHarvests || loadingCosts) return <div className="p-10 text-center text-slate-400">Loading Finance Data...</div>;
    return (
        <div>
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div><h1 className="text-2xl font-black text-slate-800">{t("Farm Finance", "Financial Ledger")}</h1><p className="text-slate-500 text-sm font-bold">{t("Track every rupee in & out.", "Real-time P&L Statement")}</p></div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all"><Plus size={20} /> {t("Add Expense", "Log Cost")}</button>
            </div>
            {harvests.length === 0 && costs.length === 0 && (<div className="bg-slate-50 p-10 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center mb-6"><div className="p-4 bg-white rounded-full shadow-sm mb-4"><DollarSign size={32} className="text-slate-400" /></div><h3 className="text-lg font-bold text-slate-700">No Finance Data Yet</h3><p className="text-slate-500 max-w-xs mx-auto">Start by logging a harvest or adding an expense to see your profit analytics.</p></div>)}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100"><div className="flex justify-between items-start mb-2"><div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={24} /></div><span className="text-xs font-black uppercase text-emerald-400 tracking-wider">Income</span></div><div className="text-3xl font-black text-emerald-700">₹{stats.totalRevenue.toLocaleString()}</div><div className="text-xs text-emerald-600 font-bold mt-1">From {harvests.length} Harvests</div></div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100"><div className="flex justify-between items-start mb-2"><div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={24} /></div><span className="text-xs font-black uppercase text-red-400 tracking-wider">Expenses</span></div><div className="text-3xl font-black text-red-700">₹{stats.totalCosts.toLocaleString()}</div><div className="text-xs text-red-600 font-bold mt-1">{costs.length} Transactions</div></div>
                <div className={`p-6 rounded-2xl border ${stats.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}><div className="flex justify-between items-start mb-2"><div className={`p-2 rounded-lg ${stats.netProfit >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}><PieChart size={24} /></div><span className={`text-xs font-black uppercase tracking-wider ${stats.netProfit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>Net Profit</span></div><div className={`text-3xl font-black ${stats.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{stats.netProfit >= 0 ? '+' : ''}₹{stats.netProfit.toLocaleString()}</div><div className={`text-xs font-bold mt-1 ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{stats.margin}% Margin</div></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col"><div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-700">Recent Expenses</h3></div><div className="flex-1 overflow-auto max-h-[400px] p-2 space-y-2">{costs.map(cost => (<div key={cost.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-lg">{COST_CATEGORIES.find(c => c.label === cost.category)?.icon || '💸'}</div><div><p className="font-bold text-slate-700 text-sm">{cost.category}</p><p className="text-xs text-slate-400">{cost.description}</p></div></div><div className="text-right"><p className="font-black text-red-600">-₹{cost.amount}</p><p className="text-[10px] text-slate-400">{new Date(cost.date).toLocaleDateString()}</p></div></div>))}</div></div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col"><div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-700">Recent Income</h3></div><div className="flex-1 overflow-auto max-h-[400px] p-2 space-y-2">{harvests.map(h => (<div key={h.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">{h.quantity_weight >= 1000 ? `${(h.quantity_weight / 1000).toFixed(1)}kg` : `${h.quantity_weight}g`}</div><div><p className="font-bold text-slate-700 text-sm">{h.notes || 'Harvest'}</p><p className="text-xs text-slate-400">Sold</p></div></div><div className="text-right"><p className="font-black text-emerald-600">+₹{h.revenue}</p><p className="text-[10px] text-slate-400">{new Date(h.harvest_date).toLocaleDateString()}</p></div></div>))}</div></div>
            </div>
            {showAddModal && <AddCostModal onClose={() => setShowAddModal(false)} onSubmit={(d) => addCostMutation.mutate(d)} loading={addCostMutation.isLoading} />}
        </div>
    );
};

// ============================================
// 2. FEASIBILITY CALCULATOR V2
// ============================================
const FeasibilityCalculator = () => {
    const [config, setConfig] = useState({ areaSqft: 1000, layers: 1, isIndoor: true, cropType: 'Lettuce', hydroSubType: 'NFT', rentedSpace: false });
    const [prices, setPrices] = useState(DEFAULT_PRICES);
    const [businessType, setBusinessType] = useState('Hydroponics');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('agri_os_unit_prices_v3');
        if (saved) setPrices({ ...DEFAULT_PRICES, ...JSON.parse(saved) }); // Merge to ensure new keys exist
    }, []);

    const calculation = useMemo(() => {
        const effectiveArea = config.areaSqft * EFFICIENCY_FACTOR;
        let result = {};

        if (businessType === 'Hydroponics') {
            const subType = config.hydroSubType;
            const yieldPerPlant = 0.2; // kg per cycle
            const maxStands = Math.floor(effectiveArea / 50);
            const totalCapacity = maxStands * (8 * config.layers) * 18;

            // Common Hardware (Updated with Granular IoT)
            const commonHydro = (maxStands * prices.hydro_standFrame) +
                (maxStands * prices.hydro_waterPump) +
                prices.hydro_reservoirTank +
                prices.iot_controller +
                prices.iot_sensors;

            const electricOpex = ((maxStands * 80 * 24) * 30 / 1000 * prices.electricityRate); // Pumps running

            let specificHardware = 0;
            let mortality = 0;

            if (subType === 'NFT') {
                specificHardware = (totalCapacity / 18 * prices.nft_channelPer12ft) + (maxStands * prices.nft_plumbingKit);
                mortality = 0.15;
            } else if (subType === 'DWC') {
                specificHardware = (maxStands * 2 * prices.dwc_raftBoard) + (totalCapacity * prices.dwc_netCups) + (maxStands * prices.dwc_airPumpHeavy);
                mortality = 0.08;
            } else if (subType === 'EbbFlow') {
                specificHardware = (maxStands * prices.flood_trayTable) + (maxStands * 10 * prices.flood_lecaMedia) + (maxStands * prices.flood_siphonKit);
                mortality = 0.10;
            } else if (subType === 'Drip') {
                const bucketCount = totalCapacity;
                specificHardware = (bucketCount * prices.drip_bucket) + (bucketCount * prices.drip_mediaPerBucket) + (maxStands * prices.drip_irrigationKit);
                mortality = 0.05;
            } else if (subType === 'Aeroponics') {
                // Aeroponics Capex is High
                // High pressure pump replaces standard pump usually, but we keep common pump for circulation
                specificHardware = (maxStands * prices.aero_pumpHighPressure) +
                    (maxStands * 10 * prices.aero_nozzles) +
                    (maxStands * prices.aero_accumulator) +
                    prices.aero_cycleTimer;
                mortality = 0.20; // High risk of failure if power goes
            }

            const sellable = Math.floor(totalCapacity * (1 - mortality));
            // Enhanced Climate Control Costs
            const climateControl = config.isIndoor ?
                (Math.ceil(config.areaSqft / 400) * prices.acCost) +
                (Math.ceil(config.areaSqft / 200) * prices.exhaustFan) +
                prices.humidifier : 0;

            const lights = config.isIndoor ? (maxStands * config.layers * 2 * prices.hydro_growLights) : 0;

            const totalCapex = commonHydro + specificHardware + climateControl + lights;
            const labor = Math.ceil(config.areaSqft / 1500) * prices.laborSalary;
            const inputs = prices.hydro_nutrients * 2; // Rough monthly
            const totalOpex = electricOpex + labor + inputs + (config.rentedSpace ? config.areaSqft * prices.rentPerSqft : 0);
            const revenue = sellable * 0.8 * (CROP_PRICES[config.cropType] || 180);

            result = {
                capacity: totalCapacity, sellable, units: 'Plants', mortality,
                capex: { infra: climateControl, hardware: commonHydro + specificHardware, lights, total: totalCapex },
                opex: { electricity: electricOpex, labor, inputs, total: totalOpex },
                revenue,
                roi: ((revenue - totalOpex) * 12 / totalCapex * 100).toFixed(1),
                breakEven: (totalCapex / (revenue - totalOpex)).toFixed(1)
            };

        } else {
            // Microgreens Logic
            const maxRacks = Math.floor(effectiveArea / 25);
            const capacity = maxRacks * 4 * config.layers; // Trays
            const monthlyTrays = capacity * 3.5; // Cycles
            const sellable = Math.floor(monthlyTrays * 0.95);

            const hardware = (maxRacks * prices.mg_rackCost) + (capacity * 2 * prices.mg_trayCost);
            const ac = Math.ceil(config.areaSqft / 300) * prices.acCost;
            const totalCapex = hardware + ac;

            const labor = (Math.ceil(config.areaSqft / 1000) * prices.laborSalary);
            const inputs = (monthlyTrays * prices.mg_packaging) + (monthlyTrays * prices.mg_mediaKg / 20) + (monthlyTrays * prices.mg_seedsPerKg / 50); // Approx usage
            const totalOpex = labor + inputs + (config.rentedSpace ? config.areaSqft * prices.rentPerSqft : 0);
            const revenue = sellable * (CROP_PRICES[config.cropType] || 120);

            result = {
                capacity, sellable, units: 'Trays/mo', mortality: 0.05,
                capex: { infra: ac, hardware, lights: 0, total: totalCapex },
                opex: { electricity: 0, labor, inputs, total: totalOpex },
                revenue,
                roi: ((revenue - totalOpex) * 12 / totalCapex * 100).toFixed(1),
                breakEven: (totalCapex / (revenue - totalOpex)).toFixed(1)
            };
        }
        return result;
    }, [config, prices, businessType]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Feasibility Engine <span className="text-slate-400 text-sm font-normal ml-2">v2.0</span></h2>
                <div className="flex gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setBusinessType('Hydroponics')} className={`px-4 py-2 rounded-md text-sm font-bold ${businessType === 'Hydroponics' ? 'bg-white shadow' : 'text-slate-500'}`}>Hydroponics</button>
                        <button onClick={() => setBusinessType('Microgreens')} className={`px-4 py-2 rounded-md text-sm font-bold ${businessType === 'Microgreens' ? 'bg-white shadow' : 'text-slate-500'}`}>Microgreens</button>
                    </div>
                    <button onClick={() => setShowSettings(true)} className="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Edit Unit Prices"><Settings size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700">Inputs</h3>
                    <div><label className="text-xs font-bold text-slate-500">Area (sqft)</label><input type="range" min="100" max="5000" className="w-full accent-emerald-500" value={config.areaSqft} onChange={e => setConfig({ ...config, areaSqft: parseInt(e.target.value) })} /><div className="text-right font-bold">{config.areaSqft} sqft</div></div>
                    {businessType === 'Hydroponics' && (
                        <div>
                            <label className="text-xs font-bold text-slate-500">System Type</label>
                            <div className="grid grid-cols-4 gap-2 mt-1">
                                {['NFT', 'DWC', 'Drip', 'Aeroponics'].map(t => (
                                    <button key={t} onClick={() => setConfig({ ...config, hydroSubType: t })} className={`py-2 text-xs font-bold border rounded-lg ${config.hydroSubType === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600'}`}>{t}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div><label className="text-xs font-bold text-slate-500">Crop</label><select className="w-full p-2 border rounded" value={config.cropType} onChange={e => setConfig({ ...config, cropType: e.target.value })}>{Object.keys(CROP_PRICES).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-500 uppercase">CapEx Breakdown</p>
                            <div className="text-xs text-blue-800 mt-2 space-y-1">
                                <div className="flex justify-between"><span>Infra/AC:</span> <span>₹{Math.floor(calculation.capex.infra / 1000)}k</span></div>
                                <div className="flex justify-between"><span>Hardware:</span> <span>₹{Math.floor(calculation.capex.hardware / 1000)}k</span></div>
                                <div className="flex justify-between border-t border-blue-200 pt-1 font-bold"><span>Total:</span> <span>₹{(calculation.capex.total / 100000).toFixed(2)} Lakh</span></div>
                            </div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <p className="text-xs font-bold text-amber-500 uppercase">OpEx (Monthly)</p>
                            <div className="text-xs text-amber-800 mt-2 space-y-1">
                                <div className="flex justify-between"><span>Electricity:</span> <span>₹{Math.floor(calculation.opex.electricity)}</span></div>
                                <div className="flex justify-between"><span>Labor:</span> <span>₹{Math.floor(calculation.opex.labor)}</span></div>
                                <div className="flex justify-between border-t border-amber-200 pt-1 font-bold"><span>Total:</span> <span>₹{Math.floor(calculation.opex.total)}</span></div>
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <p className="text-xs font-bold text-emerald-500 uppercase">Net Profit</p>
                            <p className="text-3xl font-black text-emerald-700 mt-2">₹{Math.floor(calculation.revenue - calculation.opex.total).toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-600 font-bold">Monthly</p>
                        </div>
                    </div>
                </div>
            </div>

            {showSettings && <UnitPricesModal prices={prices} onSave={(newPrices) => { setPrices(newPrices); localStorage.setItem('agri_os_unit_prices_v3', JSON.stringify(newPrices)); setShowSettings(false); }} onClose={() => setShowSettings(false)} />}
        </div>
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
