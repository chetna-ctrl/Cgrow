import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, Sprout, Droplets, Wrench, Beaker, AlertTriangle,
    Shield, ChevronRight, Wind, Droplet, LayoutDashboard,
    Activity, BarChart2, Clock, DollarSign, Settings
} from 'lucide-react';

const FarmingGuidePage = () => {
    const [activeTab, setActiveTab] = useState('hydroponics');

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farming Guide</h1>
                    <p className="text-slate-600 font-medium tracking-tight">Complete technical manual for modern farming routines</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('hydroponics')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'hydroponics' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        Hydroponics
                    </button>
                    <button
                        onClick={() => setActiveTab('microgreens')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'microgreens' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        Microgreens
                    </button>
                    <button
                        onClick={() => setActiveTab('equipment')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'equipment' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        Equipment
                    </button>
                    <button
                        onClick={() => setActiveTab('nutrients')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'nutrients' ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        Nutrients
                    </button>
                </div>
            </div>

            {/* Quick Link Tabs (Enhanced Visuals) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => setActiveTab('hydroponics')}
                    className={`p-6 rounded-3xl border transition-all text-left group ${activeTab === 'hydroponics' ? 'bg-cyan-600 border-cyan-500 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-cyan-200 hover:bg-cyan-50/50'}`}
                >
                    <Droplets className={`mb-3 ${activeTab === 'hydroponics' ? 'text-white translate-y-[-2px]' : 'text-cyan-500 group-hover:animate-bounce'}`} size={32} />
                    <p className={`font-black text-lg tracking-tight ${activeTab === 'hydroponics' ? 'text-white' : 'text-slate-900 group-hover:text-cyan-600'}`}>Hydroponics</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 ${activeTab === 'hydroponics' ? 'text-cyan-100' : 'text-slate-400'}`}>System Selection</p>
                </button>

                <button
                    onClick={() => setActiveTab('microgreens')}
                    className={`p-6 rounded-3xl border transition-all text-left group ${activeTab === 'microgreens' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:bg-emerald-50/50'}`}
                >
                    <Sprout className={`mb-3 ${activeTab === 'microgreens' ? 'text-white translate-y-[-2px]' : 'text-emerald-500 group-hover:animate-bounce'}`} size={32} />
                    <p className={`font-black text-lg tracking-tight ${activeTab === 'microgreens' ? 'text-white' : 'text-slate-900 group-hover:text-emerald-600'}`}>Microgreens</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 ${activeTab === 'microgreens' ? 'text-emerald-100' : 'text-slate-400'}`}>Growth Rounds</p>
                </button>

                <button
                    onClick={() => setActiveTab('equipment')}
                    className={`p-6 rounded-3xl border transition-all text-left group ${activeTab === 'equipment' ? 'bg-orange-600 border-orange-500 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200 hover:bg-orange-50/50'}`}
                >
                    <Wrench className={`mb-3 ${activeTab === 'equipment' ? 'text-white translate-y-[-2px]' : 'text-orange-500 group-hover:animate-spin'}`} size={32} />
                    <p className={`font-black text-lg tracking-tight ${activeTab === 'equipment' ? 'text-white' : 'text-slate-900 group-hover:text-orange-600'}`}>Equipment</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 ${activeTab === 'equipment' ? 'text-orange-100' : 'text-slate-400'}`}>Budget & Setup</p>
                </button>

                <button
                    onClick={() => setActiveTab('nutrients')}
                    className={`p-6 rounded-3xl border transition-all text-left group ${activeTab === 'nutrients' ? 'bg-purple-600 border-purple-500 text-white shadow-xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-purple-200 hover:bg-purple-50/50'}`}
                >
                    <Beaker className={`mb-3 ${activeTab === 'nutrients' ? 'text-white translate-y-[-2px]' : 'text-purple-500 group-hover:animate-pulse'}`} size={32} />
                    <p className={`font-black text-lg tracking-tight ${activeTab === 'nutrients' ? 'text-white' : 'text-slate-900 group-hover:text-purple-600'}`}>Nutrients</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 ${activeTab === 'nutrients' ? 'text-purple-100' : 'text-slate-400'}`}>Mixing Logic</p>
                </button>
            </div>

            {/* Dynamic Content Sections */}
            <div className="min-h-[400px]">
                {activeTab === 'hydroponics' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div id="hydroponics-section" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-4 bg-cyan-100 text-cyan-600 rounded-3xl">
                                    <Droplets size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Hydroponic Systems</h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Select the best setup for your crop</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* NFT */}
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-blue-400 transition-all group">
                                    <h3 className="font-black text-lg mb-2 text-slate-800">🌊 NFT Solution</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">Leafy Greens / High Rotation</p>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"Ideal for Lettuce & Spinach. Requires constant circulation."</p>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                        <p className="font-black text-[10px] text-blue-600 uppercase mb-2">Setup Checklist</p>
                                        <ul className="text-xs text-slate-500 space-y-2 font-medium">
                                            <li className="flex items-center gap-2">✅ PVC NFT Channels</li>
                                            <li className="flex items-center gap-2">✅ 18W Submersible Pump</li>
                                            <li className="flex items-center gap-2">✅ Net pots & LECA</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* DWC */}
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 transition-all group">
                                    <h3 className="font-black text-lg mb-2 text-slate-800">🛁 DWC Deep Culture</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">Easiest / Low Maintenance</p>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"Plants floating on rafts. Best for beginners & large plants."</p>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                        <p className="font-black text-[10px] text-emerald-600 uppercase mb-2">Setup Checklist</p>
                                        <ul className="text-xs text-slate-500 space-y-2 font-medium">
                                            <li className="flex items-center gap-2">✅ Deep Reservoir Tank</li>
                                            <li className="flex items-center gap-2">✅ Floating Raft Boards</li>
                                            <li className="flex items-center gap-2">✅ High-Output Air Pump</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Ebb & Flow */}
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-orange-400 transition-all group">
                                    <h3 className="font-black text-lg mb-2 text-slate-800">⏳ Flood & Drain</h3>
                                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">Commercial / Heavy Feeders</p>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 italic">"Cycles of feeding & breathing. Best for automation."</p>
                                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                        <p className="font-black text-[10px] text-orange-600 uppercase mb-2">Setup Checklist</p>
                                        <ul className="text-xs text-slate-500 space-y-2 font-medium">
                                            <li className="flex items-center gap-2">✅ Flood Tray System</li>
                                            <li className="flex items-center gap-2">✅ Interval Timer Control</li>
                                            <li className="flex items-center gap-2">✅ Clay Pebble Media</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'microgreens' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div id="microgreens-section" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl">
                                    <Sprout size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Microgreens Setup</h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Quick cycles, high nutrition</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                                    <h3 className="font-black text-xl mb-4 flex items-center gap-3">
                                        <Clock className="text-emerald-400" />
                                        Phase-Wise Master Routine
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Days 0-3: Blackout</p>
                                            <p className="text-[10px] opacity-70 font-medium leading-relaxed italic">"Keep in total darkness with 1-2kg weights. Triggers stem stretch."</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Day 4: The Flip</p>
                                            <p className="text-[10px] opacity-70 font-medium leading-relaxed italic">"Remove weights. Introduce 16h LED lights. Chlorophyll starts."</p>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                            <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Day 7-10: Harvest</p>
                                            <p className="text-[10px] opacity-70 font-medium leading-relaxed italic">"Check for first true leaves. Stop watering 24h before cut."</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                                        <h4 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest">📦 Core Inventory</h4>
                                        <ul className="text-sm text-slate-600 space-y-3 font-bold">
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 10x20 Growing Trays</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Cocopeat / Hemp Mats</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 6500K Grow Lamps</li>
                                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Precision Spray Bottle</li>
                                        </ul>
                                    </div>
                                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                                        <h4 className="font-black text-slate-800 mb-4 uppercase text-xs tracking-widest">💡 Expert Insights</h4>
                                        <p className="text-[10px] text-blue-700 font-black leading-relaxed italic">
                                            "Mold is your biggest enemy. If you see white fuzz that isn't root hairs, increase circulation immediately. Bottom watering is mandatory after Day 4 to keep leaves dry."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'equipment' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div id="equipment-section" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-4 bg-orange-100 text-orange-600 rounded-3xl">
                                    <Wrench size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Equipment & Budget</h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] italic">Indian Market Price Guide (2026)</p>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-slate-100">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="p-6">Component</th>
                                            <th className="p-6 text-center">Price (Est.)</th>
                                            <th className="p-6">Technical Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white text-sm divide-y divide-slate-50 font-bold text-slate-600">
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-6">Cocopeat (5kg Block)</td>
                                            <td className="p-6 text-center text-emerald-600">₹120 - 180</td>
                                            <td className="p-6 opacity-60">High-CEC growing media for trays</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-6">LECA Clay Pebbles (10L)</td>
                                            <td className="p-6 text-center text-orange-600">₹450 - 650</td>
                                            <td className="p-6 opacity-60">Reusable aeration media for nets</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-6">Submersible Pump (18W)</td>
                                            <td className="p-6 text-center text-blue-600">₹400 - 850</td>
                                            <td className="p-6 opacity-60">Heart of NFT & Ebb/Flow systems</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-6">Precision pH/EC Tester</td>
                                            <td className="p-6 text-center text-purple-600">₹1,200 - 3,500</td>
                                            <td className="p-6 opacity-60">Critical for Nutrient Lockout check</td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 transition-colors">
                                            <td className="p-6">LED Grow Tubes (4ft / 20W)</td>
                                            <td className="p-6 text-center text-amber-600">₹600 - 1,100</td>
                                            <td className="p-6 opacity-60">6500K Color Temp for leafy growth</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'nutrients' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div id="nutrients-section" className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-4 bg-purple-100 text-purple-600 rounded-3xl">
                                    <Beaker size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Mixing & Chemistry</h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Mulder's Chart & Solution Prep</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-purple-900 text-white p-8 rounded-3xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all"></div>
                                        <h4 className="font-black text-lg mb-4 flex items-center gap-3">
                                            <Activity className="text-purple-400" />
                                            Standard Batch: 10L Mix
                                        </h4>
                                        <div className="space-y-4 relative z-10">
                                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <span className="text-xs font-bold opacity-60">Part A (Calcium Nitrate)</span>
                                                <span className="text-lg font-black text-purple-300 tracking-tight">15ml <span className="text-[10px]">Liquid</span></span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <span className="text-xs font-bold opacity-60">Part B (Macro/Micro Mix)</span>
                                                <span className="text-lg font-black text-purple-300 tracking-tight">15ml <span className="text-[10px]">Liquid</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                                        <h4 className="font-black text-red-900 mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
                                            <AlertTriangle size={16} /> The Golden Rule
                                        </h4>
                                        <p className="text-xs font-black text-red-700 leading-relaxed italic">
                                            "NEVER mix Part A and Part B directly. They will precipitate into calcium phosphate (white powder) which plants cannot eat. Add to water separately."
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                    <h4 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                                        🧪 Preparation Routine
                                    </h4>
                                    <div className="space-y-6">
                                        {[
                                            { s: 1, t: 'Source Clean Water', d: 'Use RO or Borewell water with TDS < 100.' },
                                            { s: 2, t: 'Dose Part A', d: 'Stir vigorously for 60 seconds.' },
                                            { s: 3, t: 'Dose Part B', d: 'Stir for another 60 seconds.' },
                                            { s: 4, t: 'Verify Metrics', d: 'Aim for pH 5.8-6.2 and EC 1.2-2.0.' }
                                        ].map(step => (
                                            <div key={step.s} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-xs shrink-0">{step.s}</div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{step.t}</p>
                                                    <p className="text-[11px] text-slate-400 font-bold leading-normal">{step.d}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Need Help Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 text-white relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                            <Activity className="text-emerald-400" />
                            Ready to start growing?
                        </h3>
                        <p className="text-slate-400 font-medium tracking-tight">Head back to your dashboard to manage your active systems.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link to="/dashboard" className="px-6 py-3 bg-white text-slate-900 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-sm font-bold transition-all transform hover:scale-105">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        <Link to="/hydroponics" className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 flex items-center gap-2 text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-cyan-900/20">
                            <Droplets size={18} /> Hydroponics
                        </Link>
                        <Link to="/microgreens" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 flex items-center gap-2 text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/20">
                            <Sprout size={18} /> Microgreens
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmingGuidePage;
