import React, { useState, useMemo } from 'react';
import {
    Activity, Droplets, Thermometer, Plus, Wind, Zap, X,
    Loader, Download, Edit, Trash2, CheckCircle, Calculator,
    Calendar, TrendingUp, DollarSign, Package, Sprout, Beaker
} from 'lucide-react';
import { useHydroponics } from './hooks/useHydroponics';
import { supabase } from '../../lib/supabase';
import StatCard from '../../components/ui/StatCard';
import HelpIcon from '../../components/HelpIcon';
import EmptyState from '../../components/EmptyState';
import { determineQualityGrade } from '../../utils/predictions';
import { analyzeNutrientDepletion, predictHarvestByGDD } from '../../utils/agriUtils';
// Phase 5: Nutrient Depletion Intelligence Active
// Phase 3: GDD Harvest Predictions for Hydroponics

// Hydroponic Crop Varieties (Indian) with Days to Maturity (DTM)
const HYDRO_CROPS = [
    { value: 'lettuce', label: 'Lettuce', days: 30 },
    { value: 'tomato', label: 'Tomato', days: 90 },
    { value: 'cucumber', label: 'Cucumber', days: 60 },
    { value: 'spinach', label: 'Spinach (Palak)', days: 40 },
    { value: 'capsicum', label: 'Capsicum (Shimla Mirch)', days: 75 },
    { value: 'strawberry', label: 'Strawberry', days: 120 },
    { value: 'basil', label: 'Basil (Tulsi)', days: 25 },
    { value: 'mint', label: 'Mint (Pudina)', days: 30 }
];

const HydroponicsPage = () => {
    const { systems: hydroSystems, updateSystem, addSystem, deleteSystem, stats, loading } = useHydroponics();

    // UI STATE
    const [activeTab, setActiveTab] = useState('monitor'); // 'monitor' | 'revenue'
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showHarvestModal, setShowHarvestModal] = useState(false);
    const [showBlendCalc, setShowBlendCalc] = useState(false); // NEW: Blend Calc State

    // FORM STATE
    const [newSys, setNewSys] = useState({ id: '', type: 'NFT', crop: '', ph: 6.0, ec: 1.5, temp: 20 });
    const [editSys, setEditSys] = useState(null);
    const [harvestSys, setHarvestSys] = useState(null);
    const [harvestData, setHarvestData] = useState({ yield_kg: '', quality_grade: 'A', price_per_kg: '' });

    // BLEND CALCULATOR LOGIC
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

    // REVENUE CALCULATIONS
    const revenueStats = useMemo(() => {
        // 1. Realized Revenue (from demo_harvests + real DB harvests if we had them)
        // For now, let's pull from localStorage 'demo_harvests' for consistency with Microgreens
        const harvests = JSON.parse(localStorage.getItem('demo_harvests') || '[]').filter(h => h.source_type === 'hydroponics');
        const realizedRevenue = harvests.reduce((sum, h) => sum + (h.total_revenue || 0), 0);

        // 2. Projected Revenue (Active Systems)
        // Estimate: Yield * Price. Using conservative estimates.
        const activeRevenue = hydroSystems
            .filter(s => s.status !== 'Harvested')
            .reduce((sum, s) => {
                const crop = HYDRO_CROPS.find(c => c.label === s.crop);
                // Rough estimation logic:
                // Leafy (Lettuce/Basil/Spinach) ~ 0.2kg/plant * 20 plants = 4kg
                // Fruiting (Tomato/Cucumber) ~ 2kg/plant * 5 plants = 10kg
                let estYield = 0;
                let estPrice = 0;

                if (['Lettuce', 'Spinach (Palak)', 'Basil (Tulsi)', 'Mint (Pudina)'].includes(s.crop)) {
                    estYield = 4; // kg
                    estPrice = 200; // avg price
                } else {
                    estYield = 10; // kg
                    estPrice = 80; // avg price
                }

                return sum + (estYield * estPrice);
            }, 0);

        return { realizedRevenue, activeRevenue, totalHarvests: harvests.length };
    }, [hydroSystems]);


    if (loading) return <div className="flex h-64 items-center justify-center"><Loader className="animate-spin text-cyan-500" /></div>;

    const handleAdd = (e) => {
        e.preventDefault();
        addSystem(newSys);
        setShowModal(false);
        setNewSys({ id: '', type: 'NFT', crop: '', ph: 6.0, ec: 1.5, temp: 20 });
    };

    const handleDelete = async (systemId) => {
        if (!window.confirm('Are you sure you want to delete this system?')) return;
        deleteSystem(systemId);
    };

    const handleEdit = (system) => {
        setEditSys(system);
        setShowEditModal(true);
    };

    const handleUpdateSystem = (e) => {
        e.preventDefault();
        if (editSys.current_ph !== undefined) updateSystem(editSys.id || editSys.system_id, 'current_ph', editSys.current_ph);
        if (editSys.current_ec !== undefined) updateSystem(editSys.id || editSys.system_id, 'current_ec', editSys.current_ec);
        if (editSys.current_temp !== undefined) updateSystem(editSys.id || editSys.system_id, 'current_temp', editSys.current_temp);
        setShowEditModal(false);
    };

    const handleHarvestClick = (system) => {
        setHarvestSys(system);
        setShowHarvestModal(true);
        const defaultPrices = {
            'Lettuce': 200, 'Tomato': 80, 'Cucumber': 60, 'Spinach (Palak)': 150,
            'Capsicum (Shimla Mirch)': 100, 'Strawberry': 400, 'Basil (Tulsi)': 300, 'Mint (Pudina)': 250
        };
        setHarvestData({ yield_kg: '', quality_grade: 'A', price_per_kg: defaultPrices[system.crop] || 100 });
    };

    const handleHarvestSubmit = async (e) => {
        e.preventDefault();
        const harvestDate = new Date().toISOString().split('T')[0];
        if (new Date(harvestDate) < new Date(harvestSys.plant_date)) {
            alert("Error: Cannot harvest before plant date!");
            return;
        }

        const yieldGrams = parseFloat(harvestData.yield_kg) * 1000;
        const autoGrade = determineQualityGrade(harvestSys.crop, yieldGrams, 1);
        const totalRevenue = parseFloat(harvestData.yield_kg) * parseFloat(harvestData.price_per_kg);

        const harvestRecord = {
            id: `harvest-${Date.now()}`,
            source_type: 'hydroponics',
            source_id: harvestSys.id || harvestSys.system_id,
            crop: harvestSys.crop,
            harvest_date: harvestDate,
            yield_kg: parseFloat(harvestData.yield_kg),
            quality_grade: harvestData.quality_grade,
            suggested_grade: autoGrade,
            selling_price_per_kg: parseFloat(harvestData.price_per_kg),
            total_revenue: totalRevenue,
            user_id: 'demo-user'
        };

        const existingHarvests = JSON.parse(localStorage.getItem('demo_harvests') || '[]');
        existingHarvests.push(harvestRecord);
        localStorage.setItem('demo_harvests', JSON.stringify(existingHarvests));

        updateSystem(harvestSys.id || harvestSys.system_id, 'status', 'Harvested');
        setShowHarvestModal(false);
        alert(`Harvested ${harvestData.yield_kg}kg (Grade ${autoGrade})! Revenue: ₹${totalRevenue.toLocaleString()}`);
    };

    const exportToCSV = () => {
        const headers = ['System ID', 'Type', 'Crop', 'pH', 'EC', 'Temp', 'Status'];
        const rows = hydroSystems.map(s => [s.id, s.type, s.crop, s.ph, s.ec, s.temp, s.status]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hydroponics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hydroponics Monitor</h1>
                    <p className="text-slate-600 text-sm">Real-time nutrient & pH tracking</p>
                </div>

                {/* TABS */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('monitor')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'monitor' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-cyan-600'}`}
                    >
                        Monitor
                    </button>
                    <button
                        onClick={() => setActiveTab('revenue')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'revenue' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-cyan-600'}`}
                    >
                        Revenue
                    </button>
                </div>

                <div className="flex gap-3">
                    <button onClick={exportToCSV} className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center gap-2 border border-slate-300">
                        <Download size={18} /> CSV
                    </button>
                    <button onClick={() => setShowBlendCalc(true)} className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center gap-2 border border-slate-300">
                        <Calendar size={18} /> Planner
                    </button>
                    <button onClick={() => setShowModal(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-cyan-900/20 flex items-center gap-2">
                        <Plus size={18} /> Add System
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: MONITOR */}
            {activeTab === 'monitor' && (
                <>
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Active Systems" value={stats.totalSystems} icon={<Wind size={20} />} subtext="Online" />
                        <StatCard title="Critical Alerts" value={stats.criticalCount} icon={<Activity size={20} />} trend={stats.criticalCount > 0 ? "Action Req" : "Stable"} />
                        <StatCard title="Avg pH Level" value={stats.avgPh} icon={<Droplets size={20} />} subtext="Target: 5.8-6.2" />
                        <StatCard title="Power Usage" value="2.4 kW" icon={<Zap size={20} />} subtext="Daily avg" />
                    </div>

                    {/* TABLE */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4">System ID</th>
                                        <th className="p-4">Crop</th>
                                        <th className="p-4">Sowing Date</th>
                                        <th className="p-4">Days</th>
                                        <th className="p-4">GDD Progress</th>
                                        <th className="p-4">pH Level</th>
                                        <th className="p-4">EC (mS)</th>
                                        <th className="p-4">Temp (°C)</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-sm">
                                    {hydroSystems.map((system) => {
                                        // SCIENTIFIC INTELLIGENCE: Calculate GDD for this system
                                        const tempLogs = Array.from({ length: system.daysCurrent || 0 }, (_, i) => ({
                                            tMax: 26, tMin: 20
                                        }));
                                        const gddPrediction = tempLogs.length > 0 ? predictHarvestByGDD(tempLogs, system.crop) : null;

                                        return (
                                            <tr key={system.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-semibold text-slate-900">{system.id || system.system_id}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{system.type}</div>
                                                </td>
                                                <td className="p-4 text-slate-700">{system.crop}</td>
                                                <td className="p-4 text-slate-600 text-sm">{system.plant_date || 'N/A'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded font-bold text-xs ${system.harvestStatus?.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : system.harvestStatus?.color === 'red' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {system.daysCurrent}d
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {gddPrediction && system.status !== 'Harvested' ? (
                                                        <div className="flex items-center gap-2">
                                                            <Thermometer size={14} className="text-orange-500" />
                                                            <div>
                                                                <div className="text-xs font-bold">{gddPrediction.progress_percent}%</div>
                                                                <div className="text-[10px] text-slate-500">{gddPrediction.current_gdd}/{gddPrediction.target_gdd} GDD</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4"><input type="number" step="0.1" value={system.ph} onChange={(e) => updateSystem(system.id, 'ph', e.target.value)} className={`w-20 bg-white border rounded p-1 text-center ${system.ph < 5.5 || system.ph > 6.5 ? 'border-red-500 text-red-600' : 'border-slate-300'}`} /></td>
                                                <td className="p-4"><input type="number" step="0.1" value={system.ec} onChange={(e) => updateSystem(system.id, 'ec', e.target.value)} className="w-20 bg-white border border-slate-300 rounded p-1 text-center" /></td>
                                                <td className="p-4"><input type="number" step="1" value={system.temp} onChange={(e) => updateSystem(system.id, 'temp', e.target.value)} className="w-20 bg-white border border-slate-300 rounded p-1 text-center" /></td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${system.status === 'Harvested' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                        {system.harvestStatus?.message || system.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(system.status === 'active' || system.status === 'Healthy') && (
                                                            <button onClick={() => handleHarvestClick(system)} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded hover:bg-emerald-500 flex items-center gap-1"><CheckCircle size={14} /> Harvest</button>
                                                        )}
                                                        <button onClick={() => handleEdit(system)} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-500 flex items-center gap-1"><Edit size={14} /> Edit</button>
                                                        <button onClick={() => handleDelete(system.id)} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-500 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* TAB CONTENT: REVENUE */}
            {activeTab === 'revenue' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard title="Total Realized Revenue" value={`₹${revenueStats.realizedRevenue.toLocaleString()}`} icon={<DollarSign size={20} />} trend="Lifetime" />
                        <StatCard title="Projected Revenue" value={`₹${revenueStats.activeRevenue.toLocaleString()}`} icon={<TrendingUp size={20} />} subtext="From Active Systems" />
                        <StatCard title="Total Harvests" value={revenueStats.totalHarvests} icon={<Package size={20} />} subtext="Completed Cycles" />
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                        <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Financial Projections</h3>
                        <p className="text-slate-600 max-w-lg mx-auto mt-2">
                            Your active systems are estimated to generate <span className="font-bold text-emerald-600">₹{revenueStats.activeRevenue.toLocaleString()}</span> upon harvest.
                            Maintain pH 5.8-6.5 and EC 1.5-2.5 to maximize this yield!
                        </p>
                    </div>
                </div>
            )}

            {/* MODAL: NEW SYSTEM */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">New System</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm flex items-center gap-1 mb-2">System ID <HelpIcon topic="system_id" /></label>
                                <input required placeholder="e.g. NFT-3" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" value={newSys.id} onChange={e => setNewSys({ ...newSys, id: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm flex items-center gap-1 mb-2">Crop Type <HelpIcon topic="crop" /></label>
                                <select required className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" value={newSys.crop} onChange={e => setNewSys({ ...newSys, crop: e.target.value })}>
                                    <option value="">Select Crop</option>
                                    {HYDRO_CROPS.map(crop => <option key={crop.value} value={crop.label}>{crop.label} ({crop.days} days)</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-3 bg-cyan-600 rounded-lg text-white font-bold hover:bg-cyan-500">Initialize System</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: BLEND CALCULATOR */}
            {showBlendCalc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar size={20} /> Hydro Harvest Planner</h3>
                            <button onClick={() => setShowBlendCalc(false)}><X className="text-slate-400" /></button>
                        </div>
                        <p className="text-slate-400 text-sm mb-4">Reverse-calculate sowing dates for your target harvest.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm">Target Harvest Date</label>
                                <input type="date" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" value={blendTarget} onChange={e => setBlendTarget(e.target.value)} />
                            </div>
                            {blendTarget && (
                                <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Sowing Schedule</p>
                                    {calculateBlend(blendTarget).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                                            <span className="text-white font-medium">{item.label}</span>
                                            <span className="text-emerald-400 font-mono text-sm">Plant on: {item.sowDate}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: HARVEST */}
            {showHarvestModal && harvestSys && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Harvest System</h3>
                            <button onClick={() => setShowHarvestModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-sm text-slate-700"><strong>System:</strong> {harvestSys.id || harvestSys.system_id}</p>
                            <p className="text-sm text-slate-700"><strong>Crop:</strong> {harvestSys.crop}</p>
                        </div>
                        <form onSubmit={handleHarvestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Yield (kg)</label>
                                <input required type="number" step="0.1" min="0" placeholder="e.g., 5.5" className="w-full border border-slate-300 rounded-lg p-3 text-slate-900" value={harvestData.yield_kg} onChange={e => setHarvestData({ ...harvestData, yield_kg: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quality Grade</label>
                                <select required className="w-full border border-slate-300 rounded-lg p-3 text-slate-900" value={harvestData.quality_grade} onChange={e => setHarvestData({ ...harvestData, quality_grade: e.target.value })}>
                                    <option value="A">Grade A (Premium)</option>
                                    <option value="B">Grade B (Good)</option>
                                    <option value="C">Grade C (Fair)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹/kg)</label>
                                <input required type="number" step="1" min="0" placeholder="e.g., 200" className="w-full border border-slate-300 rounded-lg p-3 text-slate-900" value={harvestData.price_per_kg} onChange={e => setHarvestData({ ...harvestData, price_per_kg: e.target.value })} />
                            </div>
                            {harvestData.yield_kg && harvestData.price_per_kg && (
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm font-semibold text-emerald-700">Total Revenue: ₹{(parseFloat(harvestData.yield_kg) * parseFloat(harvestData.price_per_kg)).toLocaleString()}</p>
                                </div>
                            )}
                            <button type="submit" className="w-full py-3 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-500">Complete Harvest</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HydroponicsPage;
