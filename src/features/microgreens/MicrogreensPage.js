import React, { useState, useMemo } from 'react';
import { Sprout, CheckCircle, Package, DollarSign, Plus, X, Calendar, Calculator, Download, Edit, Trash2, Thermometer, Zap, HelpCircle, Wind, Droplets, Sun, Wifi, Cpu, AlertTriangle } from 'lucide-react';
import { useMicrogreens } from './hooks/useMicrogreens';
import { supabase } from '../../lib/supabaseClient';
import StatCard from '../../components/ui/StatCard';
import DeviceManagerModal from '../hydroponics/components/DeviceManagerModal';
import ScientificInfoModal from '../../components/ScientificInfoModal';
import { getCropData } from '../../utils/cropData';
import { determineQualityGrade } from '../../utils/predictions';
import EmptyState from '../../components/EmptyState';
import HelpIcon from '../../components/HelpIcon';
// import { isDemoMode, loadSampleDataToLocalStorage } from '../../utils/sampleData';
// Removed Demo Logic
import { predictHarvestByGDD, calculateDailyGDD, GDD_TARGETS, checkSeedingDensity, OPTIMAL_SEED_DENSITY, getMicrogreensAction } from '../../utils/agriUtils';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import ActiveCropHealth from '../../components/ActiveCropHealth';
import MicrogreensGuide from './components/MicrogreensGuide';
import DailyRoutine from './components/DailyRoutine';
import SensorGuideModal from './components/SensorGuideModal';
import HarvestLabelModal from './components/HarvestLabelModal';

// Indian Microgreens Database
const INDIAN_MICROGREENS = [
    { value: 'radish', label: 'Radish (Mooli)', days: 7 },
    { value: 'fenugreek', label: 'Fenugreek (Methi)', days: 10 },
    { value: 'mustard', label: 'Mustard (Sarson)', days: 8 },
    { value: 'coriander', label: 'Coriander (Dhania)', days: 12 },
    { value: 'amaranth', label: 'Amaranth (Chaulai)', days: 9 },
    { value: 'sunflower', label: 'Sunflower', days: 10 },
    { value: 'peas', label: 'Peas', days: 12 },
    { value: 'broccoli', label: 'Broccoli', days: 10 }
];

const MicrogreensPage = () => {
    const { batches, harvestBatch, addBatch, predictYield, loading, error } = useMicrogreens();
    const { t } = useBeginnerMode();

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showSensorGuide, setShowSensorGuide] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBlendCalc, setShowBlendCalc] = useState(false);
    const [showHarvestModal, setShowHarvestModal] = useState(false);
    const [showLabelModal, setShowLabelModal] = useState(false); // New: For Label
    const [showDeviceManager, setShowDeviceManager] = useState(false);
    const [newBatch, setNewBatch] = useState({
        crop: '',
        sowDate: new Date().toISOString().split('T')[0], // Auto-fill today
        qty: 1,
        seedWeight: ''
    });
    const [densityAudit, setDensityAudit] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Harvest Data Handling
    const [harvestBatchData, setHarvestBatchData] = useState({});

    // DENSITY AUDITOR: Run check when inputs change
    // DENSITY AUDITOR: Run check when inputs change
    React.useEffect(() => {
        if (newBatch.crop && newBatch.seedWeight) {
            const audit = checkSeedingDensity(newBatch.crop, parseFloat(newBatch.seedWeight), parseFloat(newBatch.qty) || 1);
            setDensityAudit(audit);
        } else {
            setDensityAudit(null);
        }
    }, [newBatch.crop, newBatch.seedWeight, newBatch.qty]);

    const [editBatch, setEditBatch] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [expandedCards, setExpandedCards] = useState({});

    const toggleCard = React.useCallback((id) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    // IoT Hardware States (Simulated)
    const [hwState, setHwState] = useState({
        fan: true,
        lights: true,
        mister: false,
        powerDraw: 28 // Watts
    });

    const toggleHw = React.useCallback((key) => {
        setHwState(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            let draw = 2; // Idle
            if (newState.fan) draw += 8;
            if (newState.lights) draw += 15;
            if (newState.mister) draw += 3;
            return { ...newState, powerDraw: draw };
        });
    }, []);


    // Stats Math
    const activeBatches = batches.filter(b => b.status === 'Growing').length;
    const readyToHarvest = batches.filter(b => b.status === 'Harvest Ready').length;
    const totalHarvested = batches.filter(b => b.status === 'Harvested').length;
    const estRevenue = totalHarvested * 15;

    const handleAdd = React.useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await addBatch(newBatch);
            if (result.success) {
                setShowModal(false);
                setNewBatch({
                    crop: '',
                    sowDate: new Date().toISOString().split('T')[0],
                    qty: 1,
                    seedWeight: ''
                });
                setDensityAudit(null);
            }
        } catch (err) {
            console.error("Add Batch Error:", err);
            alert("Failed to add batch. Please check console.");
        } finally {
            setIsSubmitting(false);
        }
    }, [addBatch, newBatch]);

    const handleHarvestClick = React.useCallback((batch) => {
        console.log("✂️ Harvest Clicked. Batch Data:", batch);
        if (!batch.id) {
            alert("Error: This batch is missing a system ID. Please delete and recreate it.");
            return;
        }
        setHarvestBatchData(batch);
        setShowHarvestModal(true);
    }, []);

    const handleHarvestSubmit = React.useCallback(async (e) => {
        e.preventDefault();
        const harvestDate = new Date().toISOString().split('T')[0];
        // rating is not fully implemented in state, defaulting to 5 for now in logic below if needed, 
        // but here we just take what's in harvestBatchData or default.
        // However, harvestBatchData might not have updated rating from UI if we don't handle it.
        // Assuming the form updates harvestBatchData directly.

        // Extract and validate values
        const yieldKg = parseFloat(harvestBatchData.yield);
        const revenue = parseFloat(harvestBatchData.revenue);

        if (!yieldKg || !revenue) {
            alert("Please enter valid yield and revenue!");
            return;
        }

        await harvestBatch(harvestBatchData.id, {
            harvestDate,
            yield_kg: yieldKg,
            revenue: revenue,
            rating: harvestBatchData.rating || 5
        });

        setShowHarvestModal(false);
        setHarvestBatchData({});
    }, [harvestBatch, harvestBatchData]);



    if (loading) return <div className="flex h-64 items-center justify-center">Loading...</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title={t("Trays in Use", "Active Batches")}
                    value={activeBatches}
                    icon={Sprout}
                    color="green"
                />
                <StatCard
                    title={t("Ready to Cut", "Harvest Ready")}
                    value={readyToHarvest}
                    icon={CheckCircle}
                    color="amber"
                />
                <StatCard
                    title={t("Total Sold", "Total Harvested")}
                    value={totalHarvested}
                    icon={Package}
                    color="blue"
                />
                <StatCard
                    title={t("Est. Earnings", "Projected Revenue")}
                    value={`₹${estRevenue}`}
                    icon={DollarSign}
                    color="emerald"
                />
            </div>

            <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        {t("My Active Trays", "Current Inventory")}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-white text-emerald-600 rounded-xl border border-emerald-200 shadow-sm font-bold hover:shadow-md transition-all"
                        >
                            <HelpCircle size={18} /> {t("Farming Guide", "Guide")}
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100"
                        >
                            <Plus size={18} /> {t("Add New Seed", "Register Batch")}
                        </button>
                    </div>
                </div>

                {/* Daily Checklist */}
                {/* Daily Checklist Removed */}

                {/* HARDWARE HUB (Simulated IoT for Microgreens) */}
                <div className="mt-2 bg-slate-900 rounded-[2rem] p-6 shadow-2xl shadow-slate-200 relative overflow-hidden group">
                    {/* Glow Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                <Wifi className="text-emerald-400" />
                                IoT Hardware Hub
                            </h3>
                            <p className="text-slate-400 font-medium">Live ESP32 telemetry & controls</p>
                        </div>
                        <button
                            onClick={() => setShowSensorGuide(true)}
                            className="bg-white/10 px-4 py-2 rounded-xl text-white hover:bg-white/20 flex items-center gap-2 text-sm font-bold transition-all border border-white/5 hover:border-emerald-500/50"
                        >
                            <Cpu size={16} className="text-emerald-400" />
                            Sensor Kit Guide
                        </button>
                        {/* <button className="bg-white/10 p-2 rounded-xl text-white hover:bg-white/20 ml-2">
                        <Settings size={20} />
                    </button> */}
                    </div>

                    <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700">
                                <Zap size={24} className="text-cyan-400 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                    Hardware Hub
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] rounded-full border border-emerald-500/30">IoT Linked</span>
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] rounded-full border border-amber-500/30 font-bold">SIMULATION MODE</span>
                                </h4>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-black text-white">{hwState.powerDraw}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Watts Consumption</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full md:w-auto">
                            <button
                                onClick={() => toggleHw('fan')}
                                className={`flex items-center justify-between gap-4 p-3 pr-4 rounded-2xl border transition-all ${hwState.fan ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Wind size={16} className={hwState.fan ? 'animate-spin-slow' : ''} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Circulation Fan</span>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${hwState.fan ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-slate-700'}`} />
                            </button>

                            <button
                                onClick={() => toggleHw('lights')}
                                className={`flex items-center justify-between gap-4 p-3 pr-4 rounded-2xl border transition-all ${hwState.lights ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Sun size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Growth Lights</span>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${hwState.lights ? 'bg-amber-400 shadow-[0_0_8px_orange]' : 'bg-slate-700'}`} />
                            </button>

                            <button
                                onClick={() => toggleHw('mister')}
                                className={`flex items-center justify-between gap-4 p-3 pr-4 rounded-2xl border transition-all ${hwState.mister ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800/50 border-slate-700 text-slate-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Droplets size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">Auto-Mister</span>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${hwState.mister ? 'bg-indigo-400 shadow-[0_0_8px_indigo]' : 'bg-slate-700'}`} />
                            </button>

                            <button
                                onClick={() => setShowDeviceManager(true)}
                                className="flex items-center justify-center p-3 rounded-2xl border border-slate-700 bg-slate-800/30 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:border-slate-500 hover:text-slate-200 transition-all border-dashed"
                            >
                                Provision Hub +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Batches Table/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {batches.filter(b => b.status !== 'Harvested').map(batch => {
                    // DENSITY AUDITOR: Calculate context for Priority Hierarchy
                    const audit = checkSeedingDensity(batch.crop, batch.seedWeight || 0, batch.qty || 1);

                    // Pass audit to getMicrogreensAction for Priority Rules
                    const actionNeeded = getMicrogreensAction(batch.daysCurrent || 0, batch.crop, audit);

                    // Backwards compatibility for old batches without Health Score
                    if (!batch.healthScore) {
                        batch.healthScore = 95;
                        batch.healthDetails = { nutrient: 'OK' };
                    }

                    // Attach action for display
                    batch.actionNeeded = actionNeeded;

                    return (
                        <div key={batch.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-500 transition-colors">{batch.crop}</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                        {t("Sown on:", "Registration:")} {new Date(batch.sowingDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {batch.needsCatchup && (
                                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600 animate-pulse">
                                            {t("Catch-up", "Gap Detected")}
                                        </div>
                                    )}
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${batch.status === 'Harvest Ready' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {t(batch.status === 'Harvest Ready' ? 'Ready to Cut' : 'Growing', batch.status)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1 bg-slate-50 p-3 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{t("Tray Count", "Quantity")}</span>
                                    <span className="text-lg font-black text-slate-700">{batch.qty}</span>
                                </div>
                                <div className="flex-1 bg-slate-50 p-3 rounded-2xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{t("Current Age", "Growth Day")}</span>
                                    <span className="text-lg font-black text-slate-700">{batch.daysCurrent || 0}</span>
                                </div>
                                {(expandedCards[batch.id] || !t(true, false)) && (
                                    <div className="flex-1 bg-slate-50 p-3 rounded-2xl animate-in fade-in slide-in-from-right-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GDD Score</span>
                                        <span className="text-lg font-black text-emerald-600">
                                            {batch.gddAccumulated || 0} <span className="text-xs text-slate-400">/ {GDD_TARGETS[batch.crop] || 200}</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {t(true, false) && (
                                <button
                                    onClick={() => toggleCard(batch.id)}
                                    className="w-full mb-4 py-1.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-dashed border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    <Zap size={12} className={expandedCards[batch.id] ? 'text-amber-500' : ''} />
                                    {expandedCards[batch.id] ? 'Hide Science' : 'View Scientific Details'}
                                </button>
                            )}

                            {/* Action Needed Badge */}
                            {batch.actionNeeded && (
                                <div className={`mb-4 p-4 rounded-[2rem] border flex items-start gap-4 transition-all hover:shadow-md ${batch.actionNeeded.priority === 'CRITICAL' ? 'bg-red-50 border-red-100 shadow-red-100/50' :
                                    batch.actionNeeded.priority === 'HIGH' ? 'bg-orange-50 border-orange-100 shadow-orange-100/50' :
                                        'bg-blue-50 border-blue-100 shadow-blue-100/50'
                                    }`}>
                                    <div className={`p-3 rounded-2xl ${batch.actionNeeded.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                        batch.actionNeeded.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest block mb-1 opacity-60">
                                            {t("Required Action", "Next Step")}
                                        </span>
                                        <p className="text-sm font-black text-slate-800 leading-tight">{batch.actionNeeded.action}</p>
                                        <p className="text-[10px] text-slate-500 font-bold leading-normal mt-1 italic">
                                            {batch.actionNeeded.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Active Crop Health Status */}
                            <div className="mb-4">
                                <ActiveCropHealth
                                    healthScore={batch.healthScore}
                                    lastLogDate={batch.lastLogDate}
                                    details={batch.healthDetails}
                                />
                            </div>

                            {/* Maturity Progress */}
                            {batch.status !== 'Harvested' && (
                                <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harvest Readiness</span>
                                        <span className="text-[10px] font-black text-slate-600">
                                            {batch.maturityPercentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${batch.maturityPercentage >= 90 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                                            style={{ width: `${Math.min(100, batch.maturityPercentage)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => handleHarvestClick(batch)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-black text-xs hover:bg-emerald-500 transition-all shadow-lg shadow-slate-900/20">
                                {t("Harvest", "Harvest")}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* HARVEST MODAL (Enhanced) */}
            {
                showHarvestModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Package size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    {t("Harvest Records", "Finalize Production")}
                                </h2>
                            </div>
                            <p className="text-slate-500 font-medium mb-6 text-center">Recording results for <span className="text-emerald-600 font-bold">{harvestBatchData.crop}</span></p>

                            <form onSubmit={handleHarvestSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Yield (kg)", "Weight")}</label>
                                    <input
                                        type="number" step="0.1" required
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-2xl"
                                        value={harvestBatchData.yield}
                                        onChange={(e) => setHarvestBatchData({ ...harvestBatchData, yield: e.target.value })}
                                        placeholder="0.0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Revenue (₹)", "Sales Value")}</label>
                                    <input
                                        type="number" required
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-noneStartAdornment text-2xl"
                                        value={harvestBatchData.revenue}
                                        onChange={(e) => setHarvestBatchData({ ...harvestBatchData, revenue: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>

                                {/* NEW: Harvest Success Rating (AI Foundation) */}
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Success Rating", "Batch Quality")}</label>
                                    <div className="flex gap-2 justify-center p-4 bg-slate-50 rounded-2xl">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setHarvestBatchData({ ...harvestBatchData, rating: star })}
                                                className={`text-3xl transition-transform hover:scale-110 ${(harvestBatchData.rating || 5) >= star ? 'text-amber-400' : 'text-slate-200'
                                                    }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-center text-xs font-bold text-slate-400 mt-2">
                                        {(harvestBatchData.rating || 5) === 5 ? "Perfect Crop! 🌟" :
                                            (harvestBatchData.rating || 5) >= 3 ? "Good Harvest 👍" : "Needs Improvement ⚠️"}
                                    </p>
                                </div>

                                <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all mt-4">
                                    {t("Confirm Harvest", "Complete Batch")}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* New Batch Modal */}
            {
                showModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t("New Batch", "Plant Seeds")}</h2>
                                <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Batch ID", "Tracking ID")}</label>
                                    <input
                                        required
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={newBatch.id}
                                        onChange={(e) => setNewBatch({ ...newBatch, id: e.target.value })}
                                        placeholder="e.g. A1, TRAY-5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Crop Type", "Variety")}</label>
                                    <select
                                        required
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                                        value={newBatch.crop}
                                        onChange={(e) => setNewBatch({ ...newBatch, crop: e.target.value })}
                                    >
                                        <option value="">{t("Select One...", "Choose Variety")}</option>
                                        {Object.keys(OPTIMAL_SEED_DENSITY).sort().map(crop => (
                                            <option key={crop} value={crop}>{crop}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <input
                                        type="date" required
                                        className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={newBatch.sowDate}
                                        onChange={(e) => setNewBatch({ ...newBatch, sowDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Trays", "Tray Count")}</label>
                                        <input
                                            type="number" required min="1"
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={newBatch.qty}
                                            onChange={(e) => setNewBatch({ ...newBatch, qty: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t("Total Seed (g)", "Seed Weight")}</label>
                                        <input
                                            type="number" required
                                            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={newBatch.seedWeight}
                                            onChange={(e) => setNewBatch({ ...newBatch, seedWeight: e.target.value })}
                                            placeholder="e.g. 40"
                                        />
                                    </div>
                                </div>

                                {/* DENSITY AUDITOR ALERT UI */}
                                {densityAudit && (
                                    <div className={`p-4 rounded-xl border-l-4 animate-in slide-in-from-top-2 ${densityAudit.status === 'OPTIMAL' ? 'bg-green-50 border-green-500' :
                                        densityAudit.status === 'CRITICAL_OVER' ? 'bg-red-50 border-red-500' :
                                            'bg-orange-50 border-orange-500'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            {densityAudit.status === 'CRITICAL_OVER' ? <AlertTriangle className="text-red-500 shrink-0" /> :
                                                densityAudit.status === 'WARNING_UNDER' ? <AlertTriangle className="text-orange-500 shrink-0" /> :
                                                    <CheckCircle className="text-green-500 shrink-0" />}

                                            <div>
                                                <h4 className={`font-black text-sm uppercase ${densityAudit.color === 'red' ? 'text-red-800' :
                                                    densityAudit.color === 'orange' ? 'text-orange-800' : 'text-green-800'
                                                    }`}>
                                                    {densityAudit.message}
                                                </h4>
                                                <p className="text-xs font-medium text-slate-600 mt-1">{densityAudit.detail}</p>
                                                {densityAudit.financial_impact && (
                                                    <p className="text-xs font-black mt-2 bg-white/50 p-1.5 rounded inline-block border border-slate-200">
                                                        💸 {densityAudit.financial_impact}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all mt-4 flex items-center justify-center gap-2 ${isSubmitting
                                        ? 'bg-emerald-400 cursor-not-allowed opacity-80'
                                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                                        } text-white`}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-spin text-xl">⏳</span>
                                            {t("Saving...", "Planting...")}
                                        </>
                                    ) : (
                                        t("Start Growing! 🌱", "Create Batch")
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Microgreens Farming Guide */}
            <MicrogreensGuide isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
            <DeviceManagerModal isOpen={showDeviceManager} onClose={() => setShowDeviceManager(false)} />
            {showSensorGuide && <SensorGuideModal onClose={() => setShowSensorGuide(false)} />}

            {/* Harvest Label Modal */}
            <HarvestLabelModal
                isOpen={showLabelModal}
                onClose={() => setShowLabelModal(false)}
                batch={harvestBatchData}
            />
        </div >
    );
};

export default MicrogreensPage;
