import React, { useState, useEffect, useMemo } from 'react';
import BlueprintReport from '../../components/BlueprintReport';
import { Ruler, MapPin, Maximize, Zap } from 'lucide-react';

const CLIMATE_ZONES = [
    { id: 'Delhi', label: 'Delhi (Heat Optimized)', description: 'Optimized for high thermal stress' },
    { id: 'Bangalore', label: 'Bangalore (Mild)', description: 'Optimized for mild tropical climate' }
];

const CommercialPlanningPage = () => {
    const [length, setLength] = useState(75);
    const [width, setWidth] = useState(30);
    const [climate, setClimate] = useState('Delhi');

    // Debounced dimensions for heavy blueprint rendering
    const [debouncedDims, setDebouncedDims] = useState({ length, width });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDims({ length, width });
        }, 400);
        return () => clearTimeout(timer);
    }, [length, width]);

    const area = useMemo(() => length * width, [length, width]);

    return (
        <div className="flex flex-col gap-6">
            {/* Input Header */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div className="flex-1 space-y-4">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Commercial Farm Planner</h1>
                        <p className="text-slate-500 font-medium">Enter your land dimensions to generate a professional engineering blueprint and ROI manual.</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Length (Ft)</label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="number"
                                    min="10"
                                    max="500"
                                    aria-label="Farm Length in Feet"
                                    value={length}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val)) setLength(val);
                                    }}
                                    className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700 w-32 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Width (Ft)</label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                <input
                                    type="number"
                                    min="10"
                                    max="500"
                                    aria-label="Farm Width in Feet"
                                    value={width}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (!isNaN(val)) setWidth(val);
                                    }}
                                    className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700 w-32 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Climate Zone</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <select
                                    value={climate}
                                    aria-label="Climate Zone"
                                    onChange={(e) => setClimate(e.target.value)}
                                    className="pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700 focus:border-indigo-500 outline-none transition-all appearance-none"
                                >
                                    {CLIMATE_ZONES.map(z => (
                                        <option key={z.id} value={z.id}>{z.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AREA HUD */}
                <div className="mt-8 flex items-center gap-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Maximize size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cultivation Area</p>
                            <p className="text-xl font-black text-indigo-700">{area.toLocaleString()} <span className="text-sm text-indigo-400">Sq.Ft</span></p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100"></div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planner Status</p>
                            <p className="text-xl font-black text-emerald-700 lowercase leading-none">
                                {length < 10 || width < 10 ? 'insufficient land' : 'ready to build'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blueprint Render */}
            <BlueprintReport length={debouncedDims.length} width={debouncedDims.width} climate={climate} />
        </div>
    );
};

export default CommercialPlanningPage;
