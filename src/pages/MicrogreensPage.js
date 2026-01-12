import React, { useState } from 'react';
import { Sprout, CheckCircle, Package, DollarSign, Plus, X, Calendar, Calculator } from 'lucide-react';
import { useMicrogreens } from '../hooks/useMicrogreens';
import StatCard from '../components/StatCard';

const MicrogreensPage = () => {
    const { batches, harvestBatch, addBatch, predictYield } = useMicrogreens();

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showBlendCalc, setShowBlendCalc] = useState(false); // New Algorithm Modal
    const [newBatch, setNewBatch] = useState({ crop: '', sowDate: '', qty: 1 });

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
        addBatch(newBatch); // Status is handled in hook now
        setShowModal(false);
        setNewBatch({ crop: '', sowDate: '', qty: 1 });
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Microgreens Tracker</h1>
                    <p className="text-slate-400 text-sm">Real-time production monitoring</p>
                </div>
                <div className="flex gap-3">
                    {/* NEW BUTTON: Blend Calculator */}
                    <button
                        onClick={() => setShowBlendCalc(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all border border-slate-700"
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
                <StatCard title="Est. Revenue" value={`$${estRevenue}`} icon={<DollarSign size={20} />} subtext="Based on $15/tray avg" />
            </div>

            {/* TABLE (Dark Mode Adapted) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Package size={18} className="text-slate-400" /> Batch Details
                    </h3>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider bg-slate-950 px-2 py-1 rounded border border-slate-800">{batches.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">Batch ID</th>
                                <th className="p-4">Crop</th>
                                <th className="p-4">Sowing Date</th>
                                <th className="p-4">Days</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {batches.map((batch) => (
                                <tr key={batch.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-mono text-white">{batch.id}</td>
                                    <td className="p-4 font-medium text-slate-200">{batch.crop} <span className="text-slate-500">({batch.qty})</span></td>
                                    <td className="p-4 text-slate-400">{batch.sowingDate}</td>
                                    <td className="p-4"><span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded font-bold text-xs">{batch.daysCurrent}d</span></td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${batch.status === 'Growing' ? 'bg-blue-900/20 text-blue-400 border-blue-900' :
                                                batch.status === 'Harvest Ready' ? 'bg-amber-900/20 text-amber-400 border-amber-900' : 'bg-slate-800 text-slate-500 border-slate-700'
                                            }`}>{batch.status}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {batch.status === 'Harvest Ready' && (
                                            <button onClick={() => harvestBatch(batch.id)} className="bg-emerald-600 text-white text-xs px-3 py-1 rounded hover:bg-emerald-500">Harvest</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
                                <label className="text-slate-400 text-sm">Crop Variety</label>
                                <input required className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                    value={newBatch.crop} onChange={e => setNewBatch({ ...newBatch, crop: e.target.value })} placeholder="e.g. Sunflower" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-400 text-sm">Trays</label>
                                    <input required type="number" min="1" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white"
                                        value={newBatch.qty} onChange={e => setNewBatch({ ...newBatch, qty: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="text-slate-400 text-sm">Sowing Date</label>
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
                        <p className="text-slate-400 text-sm mb-4">Select your harvest date to generate a "Spicy Mix" sowing schedule.</p>

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

        </div>
    );
};

export default MicrogreensPage;
