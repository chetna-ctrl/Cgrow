
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHarvestStats } from '../../utils/harvestData';
import {
    Activity, Droplets, Thermometer, Plus, Wind, Zap, X, Sun,
    Loader, Download, Edit, Trash2, CheckCircle, Calculator,
    Calendar, TrendingUp, DollarSign, Package, Sprout, Beaker, HelpCircle, AlertTriangle, Cpu
} from 'lucide-react';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import { useHydroponics } from './hooks/useHydroponics';
import ActiveCropHealth from '../../components/ActiveCropHealth';
import { supabase } from '../../lib/supabaseClient';
import StatCard from '../../components/ui/StatCard';
import ScientificInfoModal from '../../components/ScientificInfoModal';
import { determineQualityGrade } from '../../utils/predictions';
import MaintenanceChecklist from './components/MaintenanceChecklist';
import NutrientCalculator from './components/NutrientCalculator';
import CropDoctorModal from './components/CropDoctorModal';
import SystemGuideModal from './components/SystemGuideModal';
import DeviceManagerModal from './components/DeviceManagerModal';
import HydroSensorGuideModal from './components/HydroSensorGuideModal';
import HydroHarvestLabelModal from './components/HydroHarvestLabelModal';
import { CROP_LIBRARY, SYSTEM_TYPES } from '../../data/hydroponicCrops';
import { detectThermalStress } from '../../utils/agronomyAlgorithms';


const HYDRO_CROPS = Object.keys(CROP_LIBRARY).map(key => ({
    value: key,
    label: CROP_LIBRARY[key].name,
    days: CROP_LIBRARY[key].growth_days
}));

const HydroponicsPage = () => {
    const { systems: hydroSystems, addSystem, stats: systemStats, updateSystem, harvestSystem, loading, deleteSystem } = useHydroponics();
    const { isBeginnerMode, t } = useBeginnerMode();

    const [activeTab, setActiveTab] = useState('monitor');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHarvestModal, setShowHarvestModal] = useState(false);
    const [showDoctor, setShowDoctor] = useState(false);
    const [showBlendCalc, setShowBlendCalc] = useState(false);

    const [newSys, setNewSys] = useState({ id: '', type: 'NFT', crop: '', ph: 6.0, ec: 1.5, temp: 20, plantDate: new Date().toISOString().split('T')[0] });
    const [editSys, setEditSys] = useState(null);
    const [harvestSys, setHarvestSys] = useState(null);
    const [harvestData, setHarvestData] = useState({ yield_kg: '', quality_grade: 'A', price_per_kg: '' });
    const [labelSys, setLabelSys] = useState(null); // For Label Modal

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showSensorGuide, setShowSensorGuide] = useState(false);
    const [showSystemModal, setShowSystemModal] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState(null);
    const [showExpertScience, setShowExpertScience] = useState(false); // Progressive Disclosure Fix
    const [showDeviceManager, setShowDeviceManager] = useState(false);

    // IoT Hardware States (Simulated)
    const [hwState, setHwState] = useState({
        pump: true,
        lights: true,
        air: true,
        alarm: true,
        powerDraw: 45 // Watts
    });

    const toggleHw = React.useCallback((key) => {
        setHwState(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            // Simulate power draw change
            let draw = 5; // Idle
            if (newState.pump) draw += 15;
            if (newState.lights) draw += 20;
            if (newState.air) draw += 5;
            return { ...newState, powerDraw: draw };
        });
    }, []);

    const [blendTarget, setBlendTarget] = useState('');
    const calculateBlend = (targetDate) => {
        if (!targetDate) return [];
        const date = new Date(targetDate);
        return HYDRO_CROPS.map(c => {
            const sowDate = new Date(date);
            sowDate.setDate(date.getDate() - c.days);
            return { ...c, sowDate: sowDate.toISOString().split('T')[0] };
        });
    };

    // 1. QUERY: Fetch Harvest Data for Stats (Synced)
    const { data: globalHarvestStats = { byType: { hydroponics: 0 }, totalRevenue: 0 } } = useQuery({
        queryKey: ['harvest_records', 'stats'],
        queryFn: getHarvestStats,
        staleTime: 1000 * 60 * 5
    });

    const revenueStats = useMemo(() => {
        // Active Revenue (Projected) from current systems
        const activeRevenue = hydroSystems
            .filter(s => s.status !== 'Harvested')
            .reduce((sum, s) => {
                let estYield = ['Lettuce', 'Spinach (Palak)', 'Basil (Tulsi)', 'Mint (Pudina)'].includes(s.crop) ? 4 : 10;
                let estPrice = ['Lettuce', 'Spinach (Palak)', 'Basil (Tulsi)', 'Mint (Pudina)'].includes(s.crop) ? 200 : 80;
                return sum + (estYield * estPrice);
            }, 0);

        return {
            totalHarvests: globalHarvestStats.byType.hydroponics,
            activeRevenue: Math.round(activeRevenue)
        };
    }, [hydroSystems, globalHarvestStats]);



    const handleAdd = React.useCallback((e) => {
        e.preventDefault();
        // Ensure numeric inputs are numbers to prevent DB errors
        addSystem({
            ...newSys,
            ph: parseFloat(newSys.ph),
            ec: parseFloat(newSys.ec),
            temp: parseFloat(newSys.temp)
        });
        setShowModal(false);
        setNewSys({ id: '', type: 'NFT', crop: '', ph: 6.0, ec: 1.5, temp: 20, plantDate: new Date().toISOString().split('T')[0] });
    }, [addSystem, newSys]);

    const handleDelete = React.useCallback(async (systemId) => {
        if (!window.confirm('Are you sure you want to delete this system?')) return;
        deleteSystem(systemId);
    }, [deleteSystem]);

    const handleHarvestClick = React.useCallback((system) => {
        setHarvestSys(system);
        setShowHarvestModal(true);
        const defaultPrices = {
            'Lettuce': 200, 'Tomato': 80, 'Cucumber': 60, 'Spinach (Palak)': 150,
            'Capsicum (Shimla Mirch)': 100, 'Strawberry': 400, 'Basil (Tulsi)': 300, 'Mint (Pudina)': 250
        };
        setHarvestData({ yield_kg: '', quality_grade: 'A', price_per_kg: defaultPrices[system.crop] || 100 });
    }, []);

    const handleHarvestSubmit = React.useCallback(async (e) => {
        e.preventDefault();
        const harvestDate = new Date().toISOString().split('T')[0];

        await harvestSystem(harvestSys.id || harvestSys.system_id, {
            harvest_date: harvestDate,
            yield_kg: parseFloat(harvestData.yield_kg),
            quality_grade: harvestData.quality_grade,
            price_per_kg: parseFloat(harvestData.price_per_kg)
        });

        setShowHarvestModal(false);
    }, [harvestSystem, harvestSys, harvestData]);

    if (loading) return <div className="flex h-64 items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t("Water Farm Monitor", "Hydroponics Operations")}</h1>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">IoT Linked</span>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium">{t("Real-time nutrient tracking", "System performance telemetry")}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSensorGuide(true)}
                        className="bg-white text-slate-500 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:border-slate-300 flex items-center gap-2"
                    >
                        <Cpu size={16} className="text-cyan-500" />
                        Sensor Kit
                    </button>
                    <button
                        onClick={() => setShowExpertScience(!showExpertScience)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl border transition-all font-bold ${showExpertScience ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                    >
                        {showExpertScience ? <Zap size={18} /> : <Zap size={18} className="text-slate-400" />}
                        {showExpertScience ? "Expert Mode: ON" : "View Expert Science"}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title={t("Pipes in Use", "Active Systems")}
                    value={systemStats?.totalSystems || 0}
                    icon={Droplets}
                    color="blue"
                />
                <StatCard
                    title={t("Water Quality", "Operational Health")}
                    value={t("Good ✨", "Stable")}
                    icon={Beaker}
                    color="cyan"
                />
                <StatCard
                    title={t("Harvests Done", "Total Yields")}
                    value={revenueStats.totalHarvests}
                    icon={CheckCircle}
                    color="emerald"
                />
                <StatCard
                    title={t("Possible Sales", "Projected Revenue")}
                    value={`₹${revenueStats.activeRevenue}`}
                    icon={DollarSign}
                    color="indigo"
                />
            </div>

            {/* Operations Center (Calculator + Actions) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1">
                    <NutrientCalculator />
                </div>
                <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black mb-2">🚀 Hydro Operations</h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-md">
                            Manage your nutrient targets, flush cycles, and daily maintenance tasks from here. Use the calculator on the left for precise mixing.
                        </p>

                        {/* FLUSH REMINDERS (Centralized) */}
                        {/* Operations Checklist Removed */}

                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => setShowDoctor(true)}
                                className="px-5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-rose-900/50"
                            >
                                <Activity size={18} /> Open Crop Doctor
                            </button>
                            <button
                                onClick={() => setShowInfoModal(true)}
                                className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2 transition border border-slate-600"
                            >
                                <Beaker size={18} /> Nutrient Guide
                            </button>
                        </div>

                        {/* HARDWARE HUB (Simulated IoT) */}
                        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-cyan-400" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">Hardware Hub</h4>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400">
                                    Power: <span className="text-cyan-400">{hwState.powerDraw}W</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => toggleHw('pump')}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hwState.pump ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Droplets size={14} />
                                        <span className="text-[10px] font-bold uppercase">Pump</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hwState.pump ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                                </button>
                                <button
                                    onClick={() => toggleHw('lights')}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hwState.lights ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Sun size={14} />
                                        <span className="text-[10px] font-bold uppercase">Lights</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hwState.lights ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                                </button>
                                <button
                                    onClick={() => toggleHw('air')}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hwState.air ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Wind size={14} />
                                        <span className="text-[10px] font-bold uppercase">Aerator</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hwState.air ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                </button>
                                <button
                                    onClick={() => toggleHw('alarm')}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hwState.alarm ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Zap size={14} />
                                        <span className="text-[10px] font-bold uppercase">Alarm</span>
                                    </div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${hwState.alarm ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'}`} />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowDeviceManager(true)}
                                className="w-full mt-4 py-2 border border-slate-700 hover:border-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors"
                            >
                                Provision New Device +
                            </button>
                        </div>
                    </div>
                    {/* Decorative Background Icon */}
                    <div className="absolute -bottom-4 -right-4 opacity-10">
                        <Calculator size={140} />
                    </div>
                </div>
            </div>

            {/* Active Systems Header (Mirrors Microgreens Page) */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {t("My Active Systems", "Live Hydroponic Units")}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowGuide(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-emerald-600 rounded-xl border border-emerald-200 shadow-sm font-bold hover:shadow-md transition-all"
                    >
                        <HelpCircle size={18} /> {t("Farming Guide", "Guide")}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-cyan-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-700 transition-all shadow-md shadow-cyan-100"
                    >
                        <Plus size={18} /> {t("New Tank", "Add System")}
                    </button>
                </div>
            </div>


            {/* Systems Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hydroSystems.filter(s => s.status !== 'Harvested').map((system) => (
                    <div key={system.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors uppercase">{system.id}</h3>
                                <p className="text-xs text-slate-400 font-bold tracking-widest mt-1">{system.crop}</p>
                            </div>
                            <div className="flex gap-2">
                                {system.needsCatchup && (
                                    <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 animate-pulse">
                                        Gap Detected
                                    </div>
                                )}
                                <div className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {system.type}
                                </div>
                            </div>
                        </div>

                        {/* NEW: Active Crop Health Component - Progressive Disclosure */}
                        {showExpertScience && (
                            <div className="mb-4">
                                <ActiveCropHealth
                                    healthScore={system.healthScore}
                                    lastLogDate={system.lastLogDate}
                                    details={system.healthDetails}
                                    reasons={system.healthReasons}
                                    subType={system.system_type}
                                />
                            </div>
                        )}

                        {/* Harvest Readiness (Maturity %) */}
                        {system.status !== 'Harvested' && (
                            <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harvest Readiness</span>
                                    <span className="text-[10px] font-black text-slate-600">
                                        {system.maturityPercentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${system.maturityPercentage >= 90 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                                        style={{ width: `${Math.min(100, system.maturityPercentage)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}



                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setLabelSys(system)}
                                className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 hover:text-slate-700 transition-all border border-slate-200"
                                title="Print Label"
                            >
                                <Package size={18} />
                            </button>
                            <button onClick={() => handleHarvestClick(system)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-slate-900/20">
                                {t("Harvest", "Harvest")}
                            </button>
                            <button onClick={() => handleDelete(system.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Label Modal */}
            <HydroHarvestLabelModal
                isOpen={!!labelSys}
                onClose={() => setLabelSys(null)}
                system={labelSys}
            />

            {/* New System Modal */}
            {/* Modals */}
            {showGuide && <SystemGuideModal onClose={() => setShowGuide(false)} />}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">{t("Add New System", "System Config")}</h2>
                            <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">ID</label>
                                <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={newSys.id} onChange={e => setNewSys({ ...newSys, id: e.target.value })} placeholder="e.g. TRAY-A" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">System Type</label>
                                <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-cyan-500 outline-none" value={newSys.type} onChange={e => setNewSys({ ...newSys, type: e.target.value })}>
                                    {Object.keys(SYSTEM_TYPES).map(key => (
                                        <option key={key} value={key}>{SYSTEM_TYPES[key].label}</option>
                                    ))}
                                </select>
                                {/* SMART ADVICE BOX */}
                                <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-xs rounded-xl flex gap-2 items-start">
                                    <HelpCircle size={14} className="shrink-0 mt-0.5" />
                                    <span>
                                        <strong>Advisor:</strong> {SYSTEM_TYPES[newSys.type]?.tip}
                                        <br />
                                        <span className="opacity-75">Recommended: {SYSTEM_TYPES[newSys.type]?.best_for?.join(', ')}</span>
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Select Compatible Crop</label>
                                <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-cyan-500 outline-none" value={newSys.crop} onChange={e => {
                                    const selectedCrop = e.target.value;
                                    // Auto-Set Targets "Green Zone" Logic
                                    const cropKey = HYDRO_CROPS.find(c => c.value === selectedCrop)?.value;
                                    if (cropKey && CROP_LIBRARY[cropKey]) {
                                        const params = CROP_LIBRARY[cropKey];
                                        const stage = 'Vegetative';
                                        const targets = params.stages[stage] || params.stages['all'];
                                        setNewSys({
                                            ...newSys,
                                            crop: selectedCrop,
                                            ph: targets.ph_min + 0.5,
                                            ec: targets.ec_min + 0.2, // Aim for middle
                                            temp: params.temp.optimal
                                        });
                                    } else {
                                        setNewSys({ ...newSys, crop: selectedCrop });
                                    }
                                }}>
                                    <option value="">-- Choose Compatible Crop --</option>

                                    {/* Recommended Crops */}
                                    <optgroup label="✅ Recommended">
                                        {HYDRO_CROPS.filter(c => {
                                            const cropData = CROP_LIBRARY[c.value];
                                            return SYSTEM_TYPES[newSys.type]?.best_for?.includes(cropData.type);
                                        }).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </optgroup>

                                    {/* Other Crops (Warning) */}
                                    <optgroup label="⚠️ Not Recommended (High Risk)">
                                        {HYDRO_CROPS.filter(c => {
                                            const cropData = CROP_LIBRARY[c.value];
                                            return !SYSTEM_TYPES[newSys.type]?.best_for?.includes(cropData.type);
                                        }).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </optgroup>
                                </select>
                            </div>
                            <div className="mt-2 flex gap-2 text-[10px] text-slate-400 font-medium">
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded">Auto-Target: {newSys.ec} EC</span>
                                <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded">pH {newSys.ph}</span>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Planting Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold"
                                    value={newSys.plantDate || ''}
                                    onChange={e => setNewSys({ ...newSys, plantDate: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-black text-lg">Initialize</button>
                        </form>
                    </div>
                </div >
            )}

            {/* Harvest Modal */}
            {
                showHarvestModal && harvestSys && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-800">Harvest {harvestSys.system_id || harvestSys.id}</h2>
                                <button onClick={() => setShowHarvestModal(false)}><X size={24} className="text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleHarvestSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-2">Total Yield (kg)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-200 focus:border-cyan-500 outline-none"
                                        value={harvestData.yield_kg}
                                        onChange={e => {
                                            setHarvestData({ ...harvestData, yield_kg: e.target.value });
                                        }}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Quality</label>
                                        <select
                                            className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-200"
                                            value={harvestData.quality_grade}
                                            onChange={e => setHarvestData({ ...harvestData, quality_grade: e.target.value })}
                                        >
                                            <option value="A">Grade A (Premium)</option>
                                            <option value="B">Grade B (Standard)</option>
                                            <option value="C">Grade C (Low)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase mb-2">Price/kg (₹)</label>
                                        <input
                                            type="number" required
                                            className="w-full p-4 bg-slate-50 rounded-2xl font-bold border border-slate-200"
                                            value={harvestData.price_per_kg}
                                            onChange={e => setHarvestData({ ...harvestData, price_per_kg: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 transition-all">
                                    Confirm Harvest Strategy
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Crop Doctor Modal */}
            <CropDoctorModal
                isOpen={showDoctor}
                onClose={() => setShowDoctor(false)}
                initialCategory={hydroSystems[0]?.crop in CROP_LIBRARY ? CROP_LIBRARY[hydroSystems[0].crop].type : 'Leafy Greens'}
            />

            <ScientificInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
            <DeviceManagerModal isOpen={showDeviceManager} onClose={() => setShowDeviceManager(false)} />
            {showSensorGuide && <HydroSensorGuideModal onClose={() => setShowSensorGuide(false)} />}
        </div >
    );
};

export default HydroponicsPage;
