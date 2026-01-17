import React, { useState, useMemo } from 'react';
import { Sprout, CheckCircle, Package, DollarSign, Plus, X, Calendar, Calculator, Download, Edit, Trash2, Thermometer } from 'lucide-react';
import { useMicrogreens } from './hooks/useMicrogreens';
import { supabase } from '../../lib/supabase';
import StatCard from '../../components/ui/StatCard';
import { getCropData } from '../../utils/cropData';
import { determineQualityGrade } from '../../utils/predictions';
import EmptyState from '../../components/EmptyState';
import HelpIcon from '../../components/HelpIcon';
import { isDemoMode, loadSampleDataToLocalStorage } from '../../utils/sampleData';
import { predictHarvestByGDD, calculateDailyGDD } from '../../utils/agriUtils';
// Phase 3: GDD Harvest Predictions Active

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

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBlendCalc, setShowBlendCalc] = useState(false);
    const [showHarvestModal, setShowHarvestModal] = useState(false);
    const [newBatch, setNewBatch] = useState({ crop: '', sowDate: '', qty: 1 });
    const [editBatch, setEditBatch] = useState(null);
    const [harvestBatchData, setHarvestBatchData] = useState(null);
    const [harvestData, setHarvestData] = useState({ yield_grams: '', quality_grade: 'A', price_per_kg: '' });



    // Stats Math
    const activeBatches = batches.filter(b => b.status === 'Growing').length;
    const readyToHarvest = batches.filter(b => b.status === 'Harvest Ready').length;
    const totalHarvested = batches.filter(b => b.status === 'Harvested').length;
    const estRevenue = totalHarvested * 15;

    // ALGORITHM: Dynamic Blend Calculator Logic
    const [blendTarget, setBlendTarget] = useState('');
    const calculateBlend = (targetDate) => {
        if (!targetDate) return [];
        const date = new Date(targetDate);

        // Days to Maturity (DTM) Database
        const crops = [
            { name: 'Radish', dtm: 7 },
            { name: 'Sunflower', dtm: 10 },
            { name: 'Peas', dtm: 12 },
            { name: 'Cilantro', dtm: 21 }
        ];

        return crops.map(c => {
            const sowDate = new Date(date);
            sowDate.setDate(date.getDate() - c.dtm);
            return { ...c, sowDate: sowDate.toISOString().split('T')[0] };
        });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        addBatch(newBatch);
        setShowModal(false);
        setNewBatch({ crop: '', sowDate: '', qty: 1 });
    };

    // Harvest Functions
    const handleHarvestClick = (batch) => {
        setHarvestBatchData(batch);
        setShowHarvestModal(true);
        // Set default price based on crop
        const defaultPrices = {
            'Radish (Mooli)': 180,
            'Fenugreek (Methi)': 200,
            'Mustard (Sarson)': 160,
            'Coriander (Dhania)': 220,
            'Amaranth (Chaulai)': 190,
            'Sunflower': 250,
            'Peas': 150,
            'Broccoli': 300
        };
        setHarvestData({
            yield_grams: '',
            quality_grade: 'A',
            price_per_kg: defaultPrices[batch.crop] || 180
        });
    };

    const handleHarvestSubmit = async (e) => {
        e.preventDefault();

        // CRITICAL FIX #1: Validate harvest date
        const harvestDate = new Date().toISOString().split('T')[0];
        if (new Date(harvestDate) < new Date(harvestBatchData.sow_date)) {
            alert("Error: Cannot harvest before sowing date!");
            return;
        }

        const yield_kg = parseFloat(harvestData.yield_grams) / 1000; // Convert grams to kg

        // CRITICAL FIX #2: Auto-detect quality grade based on actual yield
        const autoGrade = determineQualityGrade(
            harvestBatchData.crop,
            parseFloat(harvestData.yield_grams),
            harvestBatchData.qty || 1
        );

        // Warn if user selected grade is higher than actual
        if ((harvestData.quality_grade === 'A' && autoGrade !== 'A') ||
            (harvestData.quality_grade === 'B' && autoGrade === 'C')) {
            const confirm = window.confirm(
                `Yield suggests Grade ${autoGrade}, but you selected ${harvestData.quality_grade}. Continue anyway?`
            );
            if (!confirm) return;
        }

        const totalRevenue = yield_kg * parseFloat(harvestData.price_per_kg);

        // Save to harvest records
        const harvestRecord = {
            id: `harvest-${Date.now()}`,
            source_type: 'microgreens',
            source_id: harvestBatchData.id || harvestBatchData.batch_id,
            crop: harvestBatchData.crop,
            harvest_date: harvestDate,
            yield_kg: yield_kg,
            quality_grade: harvestData.quality_grade,
            suggested_grade: autoGrade, // Track what the system recommended
            selling_price_per_kg: parseFloat(harvestData.price_per_kg),
            total_revenue: totalRevenue,
            user_id: 'demo-user'
        };

        // Save to localStorage (demo mode) or Supabase (real mode)
        const existingHarvests = JSON.parse(localStorage.getItem('demo_harvests') || '[]');
        existingHarvests.push(harvestRecord);
        localStorage.setItem('demo_harvests', JSON.stringify(existingHarvests));

        // Update batch status
        try {
            const { error } = await supabase
                .from('batches')
                .update({
                    status: 'Harvested',
                    harvest_date: harvestDate,
                    yield_grams: parseFloat(harvestData.yield_grams),
                    revenue: totalRevenue
                })
                .eq('id', harvestBatchData.id);

            if (error) throw error;
            setShowHarvestModal(false);
            alert(`Harvested ${harvestData.yield_grams}g (Grade ${autoGrade})! Revenue: ₹${totalRevenue.toLocaleString()}`);
            window.location.reload();
        } catch (err) {
            alert('Failed to harvest batch: ' + err.message);
        }
    };

    // NEW: Delete Function
    const handleDelete = async (batchId) => {
        if (!window.confirm('Are you sure you want to delete this batch?')) return;

        try {
            const { error } = await supabase
                .from('batches')
                .delete()
                .eq('id', batchId);

            if (error) throw error;
            window.location.reload();
        } catch (err) {
            alert('Failed to delete batch: ' + err.message);
        }
    };

    // NEW: Edit Function
    const handleEdit = (batch) => {
        setEditBatch(batch);
        setShowEditModal(true);
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('batches')
                .update({
                    crop: editBatch.crop,
                    sow_date: editBatch.sow_date,
                    harvest_date: editBatch.harvest_date
                })
                .eq('id', editBatch.id);

            if (error) throw error;
            setShowEditModal(false);
            window.location.reload();
        } catch (err) {
            alert('Failed to update batch: ' + err.message);
        }
    };

    // NEW: Export CSV Function
    const exportToCSV = () => {
        const headers = ['Batch ID', 'Crop', 'Sow Date', 'Harvest Date', 'Status', 'Days'];
        const rows = batches.map(b => [
            b.id,
            b.crop,
            b.sowingDate || b.sow_date,
            b.harvestDate || b.harvest_date || 'N/A',
            b.status,
            b.daysCurrent || 0
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `microgreens_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><div className="animate-spin text-emerald-500 mr-2"><Sprout size={32} /></div> Loading Batches...</div>;

    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"><X size={20} /> Error: {error}</div>;

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Microgreens Tracker</h1>
                    <p className="text-slate-600 text-sm">Real-time production monitoring</p>
                </div>
                <div className="flex gap-3">
                    {/* Export CSV Button */}
                    <button
                        onClick={exportToCSV}
                        className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all border border-slate-300 shadow-sm"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                    {/* Blend Calculator */}
                    <button
                        onClick={() => setShowBlendCalc(true)}
                        className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all border border-slate-300 shadow-sm"
                    >
                        <Calculator size={18} /> Blend Calc
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                    >
                        <Plus size={18} /> New Batch
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <StatCard title="Active Trays" value={activeBatches} icon={<Sprout size={20} />} subtext="Currently growing" trend="Stable" />
                <StatCard title="Harvest Ready" value={readyToHarvest} icon={<CheckCircle size={20} />} trend={readyToHarvest > 0 ? "+ Action Req" : "All Clear"} />
                <StatCard title="Total Harvested" value={totalHarvested} icon={<Package size={20} />} trend="+12%" />
                <StatCard title="Est. Revenue" value={`₹${estRevenue * 80}`} icon={<DollarSign size={20} />} subtext="Based on ₹1200/tray avg" />
            </div>

            {/* TABLE (Light Mode Adapted) */}
            {batches.length === 0 ? (
                <EmptyState
                    icon={<Sprout size={64} />}
                    title="No microgreens batches yet"
                    description="Start tracking your first batch to monitor growth, predict harvest dates, and calculate revenue automatically."
                    primaryAction={
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add First Batch
                        </button>
                    }
                    secondaryAction={
                        isDemoMode() ? null : (
                            <button
                                onClick={() => {
                                    loadSampleDataToLocalStorage();
                                    window.location.reload();
                                }}
                                className="bg-white hover:bg-slate-50 text-emerald-600 px-6 py-3 rounded-lg font-semibold border-2 border-emerald-600 transition-all"
                            >
                                Load Sample Data
                            </button>
                        )
                    }
                    learnMoreLink={
                        <a href="/guide" className="text-emerald-600 hover:text-emerald-500 font-medium">
                            Learn about microgreens →
                        </a>
                    }
                />
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Package size={18} className="text-slate-500" /> Batch Details
                        </h3>
                        <span className="text-xs text-slate-600 uppercase font-bold tracking-wider bg-slate-100 px-2 py-1 rounded border border-slate-200">{batches.length} Records</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Batch ID</th>
                                    <th className="p-4">Crop</th>
                                    <th className="p-4">Sowing Date</th>
                                    <th className="p-4">Days</th>
                                    <th className="p-4">GDD Progress</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm">
                                {batches.map((batch) => {
                                    // SCIENTIFIC INTELLIGENCE: Calculate GDD for this batch
                                    const tempLogs = Array.from({ length: batch.daysCurrent || 0 }, (_, i) => ({
                                        tMax: 26, // Assume 26°C max (can be made dynamic with real data)
                                        tMin: 20  // Assume 20°C min
                                    }));
                                    const gddPrediction = tempLogs.length > 0
                                        ? predictHarvestByGDD(tempLogs, batch.crop)
                                        : null;

                                    return (
                                        <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-mono text-slate-900">{batch.id}</td>
                                            <td className="p-4 font-medium text-slate-900">{batch.crop} <span className="text-slate-500">({batch.qty})</span></td>
                                            <td className="p-4 text-slate-600">{batch.sowingDate}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded font-bold text-xs ${batch.harvestStatus.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                                    batch.harvestStatus.color === 'red' ? 'bg-red-50 text-red-600' :
                                                        batch.harvestStatus.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {batch.daysCurrent}d
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {gddPrediction && batch.status !== 'Harvested' ? (
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
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${batch.status === 'Harvested' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                    batch.harvestStatus.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        batch.harvestStatus.color === 'amber' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            batch.harvestStatus.color === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-blue-100 text-blue-700 border-blue-200'
                                                    }`}>
                                                    {batch.harvestStatus.message}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {batch.status === 'Growing' && (
                                                        <button
                                                            onClick={() => handleHarvestClick(batch)}
                                                            className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded hover:bg-emerald-500 flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} /> Harvest
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleEdit(batch)}
                                                        className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-500 flex items-center gap-1"
                                                    >
                                                        <Edit size={14} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(batch.id)}
                                                        className="bg-red-600 text-white text-xs px-3 py-1.5 rounded hover:bg-red-500 flex items-center gap-1"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL 1: NEW BATCH (With Yield Predictor) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Start New Batch</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm flex items-center gap-1">
                                    Crop Variety
                                    <HelpIcon topic="crop" />
                                </label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                    value={newBatch.crop}
                                    onChange={e => setNewBatch({ ...newBatch, crop: e.target.value })}
                                >
                                    <option value="">Select Crop</option>
                                    {INDIAN_MICROGREENS.map(crop => (
                                        <option key={crop.value} value={crop.label}>{crop.label} ({crop.days} days)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-sm flex items-center gap-1">
                                        Trays
                                        <HelpIcon topic="batch" />
                                    </label>
                                    <input required type="number" min="1" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                        value={newBatch.qty} onChange={e => setNewBatch({ ...newBatch, qty: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm flex items-center gap-1">
                                        Sowing Date
                                        <HelpIcon topic="sow_date" />
                                    </label>
                                    <input required type="date" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                        value={newBatch.sowDate} onChange={e => setNewBatch({ ...newBatch, sowDate: e.target.value })} />
                                </div>
                            </div>

                            {/* NEW FEATURE: AI YIELD PREDICTION */}
                            {newBatch.crop && (
                                <div className="bg-emerald-900/20 border border-emerald-900/50 p-3 rounded-lg flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400"><Sprout size={16} /></div>
                                    <div>
                                        <p className="text-xs text-emerald-400 font-bold uppercase">AI Yield Prediction</p>
                                        <p className="text-sm text-emerald-100">
                                            Est. Harvest: <span className="font-bold">{predictYield(newBatch.crop, newBatch.qty)}g</span> based on history.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500">Start Production</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: BLEND CALCULATOR (New Feature) */}
            {showBlendCalc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calendar size={20} /> Blend Calculator</h3>
                            <button onClick={() => setShowBlendCalc(false)}><X className="text-slate-400" /></button>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">Select your harvest date to generate a "Spicy Mix" sowing schedule.</p>
                        <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg mb-4">
                            <p className="text-xs text-blue-300">
                                <strong>How it works:</strong> Each crop has different growth days.
                                The calculator works backwards from your target harvest date.
                                <br />
                                <strong>Example:</strong> Radish (7 days) for Jan 14 harvest → Sow on Jan 7
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm">Target Harvest Date</label>
                                <input type="date" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                    value={blendTarget} onChange={e => setBlendTarget(e.target.value)} />
                            </div>

                            {blendTarget && (
                                <div className="space-y-2 mt-4">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Sowing Schedule</p>
                                    {calculateBlend(blendTarget).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                                            <span className="text-white font-medium">{item.name}</span>
                                            <span className="text-emerald-400 font-mono text-sm">Sow on: {item.sowDate}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: EDIT BATCH (NEW) */}
            {showEditModal && editBatch && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Edit Batch</h3>
                            <button onClick={() => setShowEditModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateBatch} className="space-y-4">
                            <div>
                                <label className="text-slate-400 text-sm">Crop Variety</label>
                                <select
                                    required
                                    className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                    value={editBatch.crop}
                                    onChange={e => setEditBatch({ ...editBatch, crop: e.target.value })}
                                >
                                    <option value="">Select Crop</option>
                                    {INDIAN_MICROGREENS.map(crop => (
                                        <option key={crop.value} value={crop.label}>{crop.label} ({crop.days} days)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-sm">Sowing Date</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                        value={editBatch.sow_date || editBatch.sowingDate}
                                        onChange={e => setEditBatch({ ...editBatch, sow_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm">Harvest Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                        value={editBatch.harvest_date || editBatch.harvestDate || ''}
                                        onChange={e => setEditBatch({ ...editBatch, harvest_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500">Update Batch</button>
                        </form>
                    </div>
                </div>
            )}

            {/* HARVEST MODAL */}
            {showHarvestModal && harvestBatchData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Harvest Batch</h3>
                            <button onClick={() => setShowHarvestModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-sm text-slate-700"><strong>Batch:</strong> {harvestBatchData.id || harvestBatchData.batch_id}</p>
                            <p className="text-sm text-slate-700"><strong>Crop:</strong> {harvestBatchData.crop}</p>
                        </div>
                        <form onSubmit={handleHarvestSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Yield (grams)</label>
                                <input
                                    required
                                    type="number"
                                    step="1"
                                    min="0"
                                    placeholder="e.g., 150"
                                    className="w-full border border-slate-300 rounded-lg p-3 text-slate-900"
                                    value={harvestData.yield_grams}
                                    onChange={e => setHarvestData({ ...harvestData, yield_grams: e.target.value })}
                                />
                                <p className="text-xs text-slate-500 mt-1">= {(parseFloat(harvestData.yield_grams) / 1000 || 0).toFixed(2)} kg</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quality Grade</label>
                                <select
                                    required
                                    className="w-full border border-slate-300 rounded-lg p-3 text-slate-900"
                                    value={harvestData.quality_grade}
                                    onChange={e => setHarvestData({ ...harvestData, quality_grade: e.target.value })}
                                >
                                    <option value="A">Grade A (Premium)</option>
                                    <option value="B">Grade B (Good)</option>
                                    <option value="C">Grade C (Fair)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹/kg)</label>
                                <input
                                    required
                                    type="number"
                                    step="1"
                                    min="0"
                                    placeholder="e.g., 180"
                                    className="w-full border border-slate-300 rounded-lg p-3 text-slate-900"
                                    value={harvestData.price_per_kg}
                                    onChange={e => setHarvestData({ ...harvestData, price_per_kg: e.target.value })}
                                />
                            </div>
                            {harvestData.yield_grams && harvestData.price_per_kg && (
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm font-semibold text-emerald-700">
                                        Total Revenue: ₹{((parseFloat(harvestData.yield_grams) / 1000) * parseFloat(harvestData.price_per_kg)).toLocaleString()}
                                    </p>
                                </div>
                            )}
                            <button type="submit" className="w-full py-3 bg-emerald-600 rounded-lg text-white font-bold hover:bg-emerald-500">
                                Complete Harvest
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MicrogreensPage;
