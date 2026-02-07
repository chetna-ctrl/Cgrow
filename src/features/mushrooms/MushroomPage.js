import React, { useState, useMemo } from 'react';
import {
    CloudRain, Thermometer, Wind, Zap, Box, ShoppingCart,
    Calendar, AlertTriangle, CheckCircle, Info, Calculator,
    Plus, Trash2, X, RefreshCcw, Layers, Droplet, Microscope,
    Target, Flame, Ghost, BookOpen, Hand
} from 'lucide-react';
import {
    MUSHROOM_LIBRARY,
    MUSHROOM_STAGES,
    calculateMushroomSubstrate
} from '../../utils/agriUtils';
import { useMushrooms } from './hooks/useMushrooms';

const MushroomPage = () => {
    // Backend Hook
    const { batches, loading: batchesLoading, addBatch, deleteBatch } = useMushrooms();

    const [showAddModal, setShowAddModal] = useState(false);

    // Calculator States
    const [calcBagCount, setCalcBagCount] = useState(10);
    const [bagCost, setBagCost] = useState(3);
    const [spawnCostPerKg, setSpawnCostPerKg] = useState(100);
    const [strawCostPerKg, setStrawCostPerKg] = useState(10);
    const [salePricePerKg, setSalePricePerKg] = useState(250);

    // ROI Logic
    const roiStats = useMemo(() => {
        const dryStrawPerBag = 0.8; // kg
        const spawnPerBag = 0.08; // 80g
        const yieldPerBag = 0.8; // 800g (Oyster)

        const totalStrawCost = calcBagCount * dryStrawPerBag * strawCostPerKg;
        const totalSpawnCost = calcBagCount * spawnPerBag * spawnCostPerKg;
        const totalBagCost = calcBagCount * bagCost;

        const totalInvestment = totalStrawCost + totalSpawnCost + totalBagCost;
        const estimatedYield = calcBagCount * yieldPerBag;
        const estimatedRevenue = estimatedYield * salePricePerKg;
        const netProfit = estimatedRevenue - totalInvestment;

        return {
            investment: Math.round(totalInvestment),
            revenue: Math.round(estimatedRevenue),
            profit: Math.round(netProfit),
            yield: estimatedYield.toFixed(1)
        };
    }, [calcBagCount, bagCost, spawnCostPerKg, strawCostPerKg, salePricePerKg]);

    const handleAddBatch = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        addBatch({
            type: data.get('type'),
            bags: parseInt(data.get('bags')),
            startDate: data.get('startDate')
        });
        setShowAddModal(false);
    };

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto p-2">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                        🍄 Mushroom <span className="text-indigo-600">Hub</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <BookOpen size={12} /> Digital Field Guide
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} /> New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: THE WORKBENCH (Calculators + Active Batches) */}
                <div className="space-y-8">

                    {/* 1. ROI Widget */}
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                            <Calculator size={100} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Calculator size={18} /></span>
                            Zero-to-Hero Profit Predictor 💰
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Bags</label>
                                <input type="number" value={calcBagCount} onChange={e => setCalcBagCount(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-black border-2 border-transparent focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Selling Rate (₹/kg)</label>
                                <input type="number" value={salePricePerKg} onChange={e => setSalePricePerKg(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-black border-2 border-transparent focus:border-indigo-500 outline-none" />
                            </div>
                        </div>

                        {/* Results Pill */}
                        <div className="bg-slate-900 rounded-3xl p-6 text-white grid grid-cols-3 gap-4 text-center shadow-2xl shadow-slate-900/20">
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Investment</p>
                                <p className="text-xl font-black text-rose-400">₹{roiStats.investment}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Est. Revenue</p>
                                <p className="text-xl font-black text-emerald-400">₹{roiStats.revenue}</p>
                            </div>
                            <div className="bg-emerald-600 rounded-2xl p-1 -my-2 flex flex-col justify-center">
                                <p className="text-[9px] uppercase text-emerald-100 font-bold">Net Profit</p>
                                <p className="text-2xl font-black text-white">₹{roiStats.profit}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-4 italic">
                            *Auto-calculated using Beginner Avg. Yields (800g per bag)
                        </p>
                    </div>

                    {/* 2. Active Batches List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                <Layers size={18} className="text-indigo-500" /> Active Operations
                            </h3>
                            <span className="text-xs font-bold text-slate-400">{batches.length} Running</span>
                        </div>

                        {batchesLoading ? (
                            <div className="p-12 text-center text-slate-400 animate-pulse">Syncing with field data...</div>
                        ) : batches.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                                <p className="text-slate-400 font-bold text-sm">No active batches.</p>
                                <p className="text-xs text-slate-300 mt-1">Start a new project to track growth.</p>
                            </div>
                        ) : (
                            batches.map(batch => (
                                <div key={batch.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                                    <div>
                                        <h4 className="font-black text-slate-800">{batch.name}</h4>
                                        <div className="flex gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase">{batch.mushroom_type}</span>
                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase">{batch.bag_count} Bags</span>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteBatch(batch.id)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-300 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: THE MANUAL (7-Step Expanded Guide) */}
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[800px]">
                    <div className="bg-slate-50 p-6 border-b border-slate-100">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            <BookOpen className="text-indigo-600" /> The Beginner's Handbook
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Step-by-Step Practical Field Guide (v2.0)</p>
                    </div>

                    <div className="overflow-y-auto p-8 space-y-12 custom-scrollbar">

                        {/* Step 1: Substrate Selection */}
                        <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 pb-8">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-black shadow-lg">1</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">Choose Your Soil (Substrate)</h3>
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">
                                Mushrooms don't grow in mud. They grow in rot.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-[10px] uppercase font-black text-amber-600">Wheat/Paddy Straw</p>
                                    <p className="text-xs text-slate-600">Best for **Oyster** & **Milky** mushrooms. Easy to find in India. 🌾</p>
                                </div>
                                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                                    <p className="text-[10px] uppercase font-black text-slate-500">Compost/Manure</p>
                                    <p className="text-xs text-slate-500">Best for **Button** mushrooms. Hard for beginners (smells bad). 💩</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Sterilization */}
                        <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 pb-8">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">2</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">The Golden Bath (Sterilization)</h3>
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">
                                We need to kill the "Bad Guys" (Mold) but keep the "Good Guys" (Bacteria).
                            </p>
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 space-y-2">
                                <div className="flex gap-3 items-center">
                                    <Flame size={18} className="text-amber-500 shrink-0" />
                                    <p className="text-xs font-bold text-slate-700">Action: Boil water to 80°C (Steam coming out, but not rolling boil).</p>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <Box size={18} className="text-amber-500 shrink-0" />
                                    <p className="text-xs font-bold text-slate-700">Dip: Put straw in gunny bag. Dip for 2 HOURS.</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Drying */}
                        <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 pb-8">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">3</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">The Squeeze Test (Drying)</h3>
                            <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-cyan-100 rounded-xl text-cyan-600">
                                        <Hand size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase text-cyan-600 mb-1">The Handshake Rule</p>
                                        <p className="text-xs text-slate-700 leading-relaxed mb-2">
                                            Pick a handful of straw and squeeze it TIGHT (like a firm handshake).
                                        </p>
                                        <ul className="text-[10px] font-bold space-y-1">
                                            <li className="text-rose-500 flex items-center gap-1"><X size={10} /> Water Stream = Too Wet</li>
                                            <li className="text-rose-500 flex items-center gap-1"><X size={10} /> No Drops = Too Dry</li>
                                            <li className="text-emerald-600 flex items-center gap-1"><CheckCircle size={10} /> 1-2 Drops = Perfect! ✅</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4: Spawning */}
                        <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 pb-8">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">4</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">The Layer Cake (Spawning)</h3>
                            <ul className="space-y-3 bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                                <li className="flex gap-3 text-xs text-slate-700 font-bold items-center">
                                    <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center border border-indigo-100">1</span>
                                    Sanitize hands with Spirit.
                                </li>
                                <li className="flex gap-3 text-xs text-slate-700 font-bold items-center">
                                    <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center border border-indigo-100">2</span>
                                    Layer: 3 inches Straw -> Sprinkle Spawn (Edges only) -> Repeat.
                                </li>
                                <li className="flex gap-3 text-xs text-slate-700 font-bold items-center">
                                    <span className="w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center border border-indigo-100">3</span>
                                    Tie bag TIGHT. Poke 10-15 holes with clean needle.
                                </li>
                            </ul>
                        </div>

                        {/* Step 5: Incubation */}
                        <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 pb-8">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg">5</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">The Dark Room (Incubation)</h3>
                            <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl">
                                <p className="text-[10px] uppercase font-black tracking-widest mb-2 text-indigo-400">Spawn Run (15-20 Days)</p>
                                <p className="text-xs leading-relaxed">
                                    Keep bags in PITCH DARKNESS. Temp 22-26°C.
                                    <br />
                                    <span className="text-white font-bold">Goal:</span> Bag should turn completely WHITE (Mycelium).
                                    <br />
                                    <span className="text-rose-400">Danger:</span> Green/Black spots = Contamination (Throw it!).
                                </p>
                            </div>
                        </div>

                        {/* Step 6: Harvesting */}
                        <div className="relative pl-8 border-l-2 border-dashed border-indigo-200 pb-8">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black shadow-lg">6</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">Shock & Harvest</h3>
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100">
                                <p className="text-xs leading-relaxed mb-2">
                                    1. **Shock**: Slit plastic. Spray water 3x/day. Give light.
                                    <br />
                                    2. **Harvest Sign**: Pick when edges curl **DOWNWARDS**.
                                </p>
                            </div>
                        </div>

                        {/* Step 7: Second Flush */}
                        <div className="relative pl-8 border-l-2 border-indigo-200 pb-2">
                            <div className="absolute -left-[15px] top-0 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-black shadow-lg">7</div>
                            <h3 className="text-xl font-black text-slate-800 mb-3">Bonus Round (2nd Flush)</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Don't throw the bag!
                                <br />
                                Scrape off the old stems. Immerse bag in cold water for 5 mins. Put back on shelf. You will get 50% more mushrooms in 7 days! ♻️
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* UNIVERSAL MASTER REFERENCE TABLE */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 mt-6 overflow-hidden">
                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Microscope className="text-indigo-600" /> Universal Mycology Reference
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="p-4 text-xs font-black uppercase text-slate-400">Species</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400">Best Substrate</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400">Spawn Temp (Dark)</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400">Fruit Temp (Light)</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400">Humidity</th>
                                <th className="p-4 text-xs font-black uppercase text-slate-400">Difficulty</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-medium text-slate-600 divide-y divide-slate-50">
                            <tr className="hover:bg-indigo-50/50 transition-colors">
                                <td className="p-4 font-black text-indigo-600">Oyster (Dhingri)</td>
                                <td className="p-4">Wheat/Paddy Straw</td>
                                <td className="p-4">22 - 26°C</td>
                                <td className="p-4">20 - 30°C</td>
                                <td className="p-4 text-cyan-500 font-bold">85-90%</td>
                                <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] uppercase font-black">Easy</span></td>
                            </tr>
                            <tr className="hover:bg-indigo-50/50 transition-colors">
                                <td className="p-4 font-black text-slate-800">Milky Mushroom</td>
                                <td className="p-4">Wheat Straw + Casing</td>
                                <td className="p-4">28 - 35°C</td>
                                <td className="p-4">30 - 38°C</td>
                                <td className="p-4 text-cyan-500 font-bold">80-85%</td>
                                <td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] uppercase font-black">Easy</span></td>
                            </tr>
                            <tr className="hover:bg-indigo-50/50 transition-colors">
                                <td className="p-4 font-black text-slate-800">Button (Agaricus)</td>
                                <td className="p-4">Composted Manure</td>
                                <td className="p-4">22 - 25°C</td>
                                <td className="p-4">14 - 18°C</td>
                                <td className="p-4 text-cyan-500 font-bold">85-90%</td>
                                <td className="p-4"><span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] uppercase font-black">Hard</span></td>
                            </tr>
                            <tr className="hover:bg-indigo-50/50 transition-colors">
                                <td className="p-4 font-black text-slate-800">Paddy Straw</td>
                                <td className="p-4">Rice Straw bundles</td>
                                <td className="p-4">30 - 35°C</td>
                                <td className="p-4">30 - 35°C</td>
                                <td className="p-4 text-cyan-500 font-bold">80-90%</td>
                                <td className="p-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] uppercase font-black">Medium</span></td>
                            </tr>
                            <tr className="hover:bg-indigo-50/50 transition-colors">
                                <td className="p-4 font-black text-slate-800">Lion's Mane</td>
                                <td className="p-4">Sawdust + Bran</td>
                                <td className="p-4">20 - 24°C</td>
                                <td className="p-4">15 - 21°C</td>
                                <td className="p-4 text-cyan-500 font-bold">90-95%</td>
                                <td className="p-4"><span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-[10px] uppercase font-black">Professional</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-800">Initialize Batch</h2>
                            <button onClick={() => setShowAddModal(false)}><X size={24} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAddBatch} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Mushroom Species</label>
                                <select name="type" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none">
                                    {Object.keys(MUSHROOM_LIBRARY).map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Total Grow Bags</label>
                                <input name="bags" type="number" required defaultValue={10} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Sowing Date</label>
                                <input name="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl font-bold" />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-indigo-100">Confirm & Sync</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MushroomPage;
