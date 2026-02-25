import React, { useState, useMemo } from 'react';
import {
    Sprout,
    Layers,
    Maximize,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Zap,
    Users,
    Home,
    Trash2,
    PieChart,
    ArrowRight,
    Leaf,
    Ruler
} from 'lucide-react';
import { generateMicrogreensPlan } from './microgreensCalculator';
import { MG_DEFAULTS, MG_CROPS } from './microgreensDefaults';
import { useBeginnerMode } from '../../context/BeginnerModeContext';

const MicrogreensPlanningPage = () => {
    const { isBeginner, setBeginnerMode } = useBeginnerMode();
    const [config, setConfig] = useState(MG_DEFAULTS);

    const calculation = useMemo(() => {
        const selectedCrop = MG_CROPS.find(c => c.value === config.cropType) || MG_CROPS[0];
        return generateMicrogreensPlan({
            ...config,
            seedCostTray: selectedCrop.seedCostTray,
            cycleDays: selectedCrop.cycleDays
        });
    }, [config]);

    const stats = [
        { label: 'Total Tray Capacity', value: calculation.capacity, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Trays per Month', value: calculation.monthlyTrays, icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Annual Production', value: Math.floor(calculation.monthlyTrays * 12).toLocaleString(), icon: Leaf, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Leaf size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Microgreens Farm Planner</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest font-black flex items-center gap-2">
                                Professional Modeling Engine <span className="w-1 h-1 bg-slate-300 rounded-full"></span> Tier 1 Analytics
                            </p>
                            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Consultant Mode</span>
                                <button
                                    onClick={() => setBeginnerMode(!isBeginner)}
                                    className={`w-8 h-4 rounded-full transition-all relative ${!isBeginner ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${!isBeginner ? 'left-4.5' : 'left-0.5'}`} style={{ left: !isBeginner ? '18px' : '2px' }}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
                >
                    <PieChart size={18} /> EXPORT DPR
                </button>
            </div>

            {/* 2. STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`p-8 rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all`}>
                        <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                        <stat.icon className={`${stat.color} mb-4`} size={32} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-900 leading-none">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* 3. MAIN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: INPUTS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Maximize size={20} className="text-emerald-500" />
                            Site & Infrastructure
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-black pl-1 flex items-center gap-1">
                                    <Ruler size={10} className="text-slate-400" /> Length (Ft)
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={config.length}
                                    onChange={e => setConfig({ ...config, length: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-black pl-1 flex items-center gap-1">
                                    <Ruler size={10} className="text-slate-400 rotate-90" /> Width (Ft)
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={config.width}
                                    onChange={e => setConfig({ ...config, width: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Floor Area</span>
                            <span className="text-sm font-black text-emerald-400">{config.length * config.width} Sqft</span>
                        </div>

                        <div className="space-y-4 mt-6">

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rack Vertical Layers</label>
                                <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-2">
                                    {[3, 4, 5, 6].map(l => (
                                        <button
                                            key={l}
                                            onClick={() => setConfig({ ...config, layers: l })}
                                            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${config.layers === l ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Leaf size={20} className="text-emerald-500" />
                            Crop Selection
                        </h2>

                        <div className="space-y-4">
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none"
                                value={config.cropType}
                                onChange={e => setConfig({ ...config, cropType: e.target.value })}
                            >
                                {MG_CROPS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>

                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                                <AlertCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-emerald-800 uppercase tracking-wider leading-none">Crop Intelligence</p>
                                    <p className="text-[10px] font-bold text-emerald-600/80 mt-1 leading-normal">
                                        Estimated cycle for {config.cropType} is {MG_CROPS.find(c => c.value === config.cropType)?.cycleDays} days. Modeling uses {calculation.cycles} cycles/mo with cleaning buffer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-500" />
                            Financial Inputs
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sell Price/Tray</label>
                                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-slate-700" value={config.pricePerTray} onChange={e => setConfig({ ...config, pricePerTray: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Loss Safety %</label>
                                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-slate-700" value={config.lossPercent} onChange={e => setConfig({ ...config, lossPercent: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Rent / Mo</label>
                                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-slate-700" value={config.rent} onChange={e => setConfig({ ...config, rent: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Labor / Mo</label>
                                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-slate-700" value={config.labor} onChange={e => setConfig({ ...config, labor: parseInt(e.target.value) || 0 })} />
                            </div>
                            {!isBeginner && (
                                <>
                                    <div className="col-span-2 mt-4 pt-4 border-t border-slate-100 italic text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                        Advanced Engineering Parameters
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Electricity Rate (₹/Unit)</label>
                                        <input type="number" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.electricityRate} onChange={e => setConfig({ ...config, electricityRate: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Setup CapEx (Lakhs)</label>
                                        <input type="number" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.capex / 100000} onChange={e => setConfig({ ...config, capex: (parseFloat(e.target.value) * 100000) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Usable Area %</label>
                                        <input type="number" step="0.05" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.usableAreaRatio} onChange={e => setConfig({ ...config, usableAreaRatio: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sqft per Tray</label>
                                        <input type="number" step="0.1" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.sqftPerTray} onChange={e => setConfig({ ...config, sqftPerTray: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Power Load (kW/1000sqft)</label>
                                        <input type="number" step="0.5" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.powerDrawFactor} onChange={e => setConfig({ ...config, powerDrawFactor: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Daily Photoperiod (Hrs)</label>
                                        <input type="number" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.photoperiod} onChange={e => setConfig({ ...config, photoperiod: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Media Cost / Tray</label>
                                        <input type="number" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.mediaCostPerTray} onChange={e => setConfig({ ...config, mediaCostPerTray: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Pkg Cost / Tray</label>
                                        <input type="number" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.packagingCostPerTray} onChange={e => setConfig({ ...config, packagingCostPerTray: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Other OpEx % (Sales/Mkt)</label>
                                        <input type="number" className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-black text-slate-700" value={config.otherOpexPercent} onChange={e => setConfig({ ...config, otherOpexPercent: parseFloat(e.target.value) || 0 })} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: RESULTS & ANALYSIS */}
                <div className="lg:col-span-2 space-y-8">
                    {/* FINANCIAL SUMMARY CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1e293b] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                            <TrendingUp className="text-emerald-400 mb-4" size={32} />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Monthly Net Profit</p>
                            <h3 className="text-5xl font-black tracking-tight text-white mb-6">₹{Math.floor(calculation.profit).toLocaleString()}</h3>
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-700/50">
                                <div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Monthly Revenue</p>
                                    <p className="text-sm font-black text-emerald-400">₹{Math.floor(calculation.revenue).toLocaleString()}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">OpEx Margin</p>
                                    <p className="text-sm font-black text-slate-300">{((calculation.opex.total / calculation.revenue) * 100).toFixed(1)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Break-Even Projection</p>
                                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                                        {calculation.breakEvenYears} Years
                                        <span className="text-sm text-slate-400 font-bold ml-2">({calculation.breakEvenMonths} Mo)</span>
                                    </h4>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Setup CapEx Estimate</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-black text-slate-900">₹{(config.capex / 100000).toFixed(1)}L</span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Estimated</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OPEX BREAKDOWN TABLE */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                            <PieChart size={24} className="text-emerald-500" />
                            Operating Expense Breakdown
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end group">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">Electricity (Est.)</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                            <h4 className="font-black text-slate-700">₹{Math.floor(calculation.opex.electricity).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{((calculation.opex.electricity / calculation.opex.total) * 100).toFixed(0)}%</span>
                                </div>

                                <div className="flex justify-between items-end group">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Seeds & Inputs</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                            <h4 className="font-black text-slate-700">₹{Math.floor(calculation.opex.inputs).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{((calculation.opex.inputs / calculation.opex.total) * 100).toFixed(0)}%</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end group">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">Rent & Fixed</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                                            <h4 className="font-black text-slate-700">₹{Math.floor(calculation.opex.rent).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{((calculation.opex.rent / calculation.opex.total) * 100).toFixed(0)}%</span>
                                </div>

                                <div className="flex justify-between items-end group">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-pink-600 transition-colors">Labor Ops</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                            <h4 className="font-black text-slate-700">₹{Math.floor(calculation.opex.labor).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{((calculation.opex.labor / calculation.opex.total) * 100).toFixed(0)}%</span>
                                </div>

                                <div className="flex justify-between items-end group">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-600 transition-colors">Marketing & Dist.</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                            <h4 className="font-black text-slate-700">₹{Math.floor(calculation.opex.incidentals).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{((calculation.opex.incidentals / calculation.opex.total) * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* PROGRESS BAR TOTAL */}
                        <div className="mt-12 h-4 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex shadow-inner">
                            <div className="h-full bg-cyan-400" style={{ width: `${(calculation.opex.electricity / calculation.opex.total) * 100}%` }}></div>
                            <div className="h-full bg-amber-400" style={{ width: `${(calculation.opex.inputs / calculation.opex.total) * 100}%` }}></div>
                            <div className="h-full bg-indigo-400" style={{ width: `${(calculation.opex.rent / calculation.opex.total) * 100}%` }}></div>
                            <div className="h-full bg-pink-400" style={{ width: `${(calculation.opex.labor / calculation.opex.total) * 100}%` }}></div>
                            <div className="h-full bg-orange-400" style={{ width: `${(calculation.opex.incidentals / calculation.opex.total) * 100}%` }}></div>
                        </div>

                        <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] flex items-center justify-between shadow-xl">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Monthly OpEx</p>
                            <h4 className="text-2xl font-black text-white">₹{Math.floor(calculation.opex.total).toLocaleString()}</h4>
                        </div>
                    </div>

                    {/* DISCLAIMER SECTION */}
                    <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
                        <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
                        <div>
                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Commercial Disclaimer</h4>
                            <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
                                Ye results mathematical projections hain based on Indian market averages. Asli performance market demand (B2B vs B2C), actual crop loss aur operational management pe depend karegi. Modeling assume karti hai successful seed-to-harvest cycles. DPR (Detailed Project Report) ke liye professional audit recommend kiya jata hai.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MicrogreensPlanningPage;
