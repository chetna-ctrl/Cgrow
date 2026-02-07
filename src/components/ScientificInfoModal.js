
import React, { useState } from 'react';
import { X, BookOpen, Activity, AlertTriangle, Droplets, Sun, Zap, Thermometer, Cpu, ShoppingCart, CheckCircle2, ShieldCheck, Link } from 'lucide-react';

const ScientificInfoModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('beginner');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <BookOpen size={32} />
                        <div>
                            <h2 className="text-2xl font-bold">Scientific Intelligence Guide</h2>
                            <p className="text-green-100 text-sm">Understanding the Science Behind cGrow</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('beginner')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'beginner'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        Beginner Manual
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'overview'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        System Architecture
                    </button>
                    <button
                        onClick={() => setActiveTab('vpd')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'vpd'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        VPD Theory
                    </button>
                    <button
                        onClick={() => setActiveTab('gdd')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'gdd'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        Thermal Time (GDD)
                    </button>
                    <button
                        onClick={() => setActiveTab('logic')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'logic'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        Logic & DLI
                    </button>
                    <button
                        onClick={() => setActiveTab('antagonism')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'antagonism'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            }`}
                    >
                        Nutrient Alerts
                    </button>
                    <button
                        onClick={() => setActiveTab('hardware')}
                        className={`px-6 py-3 font-semibold transition whitespace-nowrap flex-shrink-0 ${activeTab === 'hardware'
                            ? 'bg-white text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-gray-600 hover:text-emerald-600'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            <Cpu size={16} /> Hardware Kit
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {activeTab === 'beginner' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">Welcome to cGrow</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    cGrow (Conscious Growth) is a <strong>Scientific Farm Operating System</strong>. It converts your daily sensor logs into
                                    actionable biophysics insights, helping you grow perfect crops with zero guesswork.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
                                        <Zap size={24} fill="currentColor" />
                                    </div>
                                    <h4 className="font-black text-slate-800 mb-2 tracking-tight uppercase text-sm">Website Purpose</h4>
                                    <p className="text-xs text-slate-600 font-bold leading-normal italic">
                                        To automate the "thinking" part of farming. We use formulas from Wageningen and Cornell to track heat, humidity, and nutrients so you don't have to be a scientist to grow like one.
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                                    <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                                        <Activity size={24} />
                                    </div>
                                    <h4 className="font-black text-slate-800 mb-2 tracking-tight uppercase text-sm">Procedure (Simple Steps)</h4>
                                    <ol className="text-[10px] text-slate-600 font-black space-y-2 list-decimal ml-4">
                                        <li>ADD: Register your batch in the Microgreens/Hydro tabs.</li>
                                        <li>LOG: Enter Daily Readings (Temp, pH, EC) in the Tracker.</li>
                                        <li>ACT: Follow the "Required Action" cards consistently.</li>
                                        <li>HARVEST: Cut only when the Maturity % reaches 90-100%.</li>
                                    </ol>
                                </div>
                            </div>

                            {/* Section A: Microgreens Phase Manual */}
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                        <BookOpen className="text-emerald-400" size={24} />
                                        Manual: Microgreens Phases
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                            <p className="font-black text-xs text-emerald-400 uppercase tracking-widest mb-2">Phase 1: Blackout 🌑</p>
                                            <p className="text-[10px] font-bold opacity-80 italic">Day 0-3. Theory: Darkness triggers Auxin hormone for stem elongation. Action: Trays ko cover rakhein aur 1-2kg weight rakhein.</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                            <p className="font-black text-xs text-blue-400 uppercase tracking-widest mb-2">Phase 2: Light Intro ☀️</p>
                                            <p className="text-[10px] font-bold opacity-80 italic">Day 4-Harvest. Theory: Chlorophyll development begins. Action: Covers hatayein aur 12-16 ghante LED Tubes dein.</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                            <p className="font-black text-xs text-orange-400 uppercase tracking-widest mb-2">Phase 3: Harvest Readiness ✂️</p>
                                            <p className="text-[10px] font-bold opacity-80 italic">Theory: Harvest when first "True Leaves" appear for peak nutrition. Use GDD targets for flavor peaks.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            </div>

                            {/* Section B: Hydroponics Phase Manual */}
                            <div className="bg-cyan-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                                        <Activity className="text-cyan-400" size={24} />
                                        Manual: Hydroponics Phases
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                            <p className="font-black text-xs text-cyan-400 uppercase tracking-widest mb-2">Phase 1: Seedling 🌱</p>
                                            <p className="text-[10px] font-bold opacity-80 italic">Week 1-2. Goal: Strong root system. Parameters: pH 5.8, EC 0.8-1.2. Light: 14-16 hours.</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                            <p className="font-black text-xs text-indigo-400 uppercase tracking-widest mb-2">Phase 2: Vegetative 🌿</p>
                                            <p className="text-[10px] font-bold opacity-80 italic">Goal: Biomass growth. Parameters: pH 6.0, EC 1.5-2.0. High Nitrogen requirements.</p>
                                        </div>
                                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                            <p className="font-black text-xs text-emerald-400 uppercase tracking-widest mb-2">Phase 3: Harvest Window 🌸</p>
                                            <p className="text-[10px] font-bold opacity-80 italic">Goal: Flavor profile. Action: EC badhayein aur water temperature 20°C ke aas-paas rakhein.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">System Architecture</h3>

                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                                <h4 className="font-bold text-lg mb-4 text-blue-900">Data Flow Diagram</h4>
                                <div className="font-mono text-sm space-y-2 text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Droplets className="text-blue-600" size={20} />
                                        <span className="font-bold">Sensors (Inputs)</span>
                                    </div>
                                    <div className="ml-8">↓ Temperature, Humidity, pH, EC, Water Level</div>

                                    <div className="flex items-center gap-2 mt-4">
                                        <Zap className="text-yellow-600" size={20} />
                                        <span className="font-bold">AgriUtils (Algorithms)</span>
                                    </div>
                                    <div className="ml-8">↓ VPD Calculation, GDD Tracking, Nutrient Analysis</div>

                                    <div className="flex items-center gap-2 mt-4">
                                        <AlertTriangle className="text-orange-600" size={20} />
                                        <span className="font-bold">Insights (Results)</span>
                                    </div>
                                    <div className="ml-8">↓ Real-time Alerts, Health Scores, Predictions</div>

                                    <div className="flex items-center gap-2 mt-4">
                                        <BookOpen className="text-green-600" size={20} />
                                        <span className="font-bold">Database (Memory)</span>
                                    </div>
                                    <div className="ml-8">↓ Stored for ML/AI Pattern Recognition</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h5 className="font-bold text-green-900 mb-2">Real-Time</h5>
                                    <p className="text-sm text-gray-700">Calculations happen as you type, providing instant feedback</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h5 className="font-bold text-blue-900 mb-2">Scientific</h5>
                                    <p className="text-sm text-gray-700">Based on research papers and proven agricultural formulas</p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <h5 className="font-bold text-purple-900 mb-2">AI-Ready</h5>
                                    <p className="text-sm text-gray-700">Data stored for future machine learning models</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vpd' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Droplets className="text-blue-600" />
                                VPD: The Transpiration Engine
                            </h3>

                            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                                <h4 className="font-bold text-lg mb-3 text-blue-900">What is VPD?</h4>
                                <p className="text-gray-700 mb-4">
                                    <strong>Vapor Pressure Deficit (VPD)</strong> is the difference between the amount of moisture
                                    the air can hold when saturated and the actual amount of moisture in the air.
                                </p>
                                <p className="text-gray-700">
                                    Think of it as the "thirst" of the air. High VPD = very thirsty air (pulls water from plants).
                                    Low VPD = saturated air (plants can't transpire).
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 p-6 rounded-lg border-2 border-gray-300">
                                <h4 className="font-bold text-lg mb-4">VPD Ranges</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 bg-red-500 rounded-full mt-1"></div>
                                        <div>
                                            <p className="font-bold text-red-900">&lt; 0.4 kPa: Fungal Risk</p>
                                            <p className="text-sm text-gray-700">Air is too humid. Transpiration stops. Calcium can't reach leaf tips. Risk of damping off and fungal diseases.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
                                        <div>
                                            <p className="font-bold text-green-900">0.8-1.2 kPa: Optimal</p>
                                            <p className="text-sm text-gray-700">Perfect balance. Transpiration and photosynthesis are maximized. Nutrients flow efficiently.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-4 h-4 bg-orange-500 rounded-full mt-1"></div>
                                        <div>
                                            <p className="font-bold text-orange-900">&gt; 1.6 kPa: Stomatal Closure</p>
                                            <p className="text-sm text-gray-700">Air is too dry. Plants close stomata to prevent water loss. Photosynthesis stops. Growth slows.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
                                <h5 className="font-bold text-yellow-900 mb-2">🔬 Formula Used</h5>
                                <code className="text-sm bg-white p-2 rounded block">
                                    VPD = SVP × (1 - RH/100)<br />
                                    SVP = 0.6108 × exp((17.27 × T) / (T + 237.3))
                                </code>
                                <p className="text-xs text-gray-600 mt-2">Tetens formula (Arrhenius equation variant)</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gdd' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Thermometer className="text-orange-600" />
                                GDD: The Biological Clock
                            </h3>

                            <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                                <h4 className="font-bold text-lg mb-3 text-orange-900">What is GDD?</h4>
                                <p className="text-gray-700 mb-4">
                                    <strong>Growing Degree Days (GDD)</strong> measure heat accumulation. Plants respond to
                                    thermal time, not calendar time.
                                </p>
                                <p className="text-gray-700">
                                    A crop might take 7 days at 25°C but 10 days at 18°C to reach the same maturity.
                                    GDD accounts for this by tracking accumulated heat units.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                                <h4 className="font-bold text-lg mb-4 text-purple-900">Why GDD is Better Than Calendar Days</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <p className="font-bold text-red-600 mb-2">❌ Calendar Days</p>
                                        <p className="text-sm text-gray-700">Lettuce: 30 days to harvest</p>
                                        <p className="text-xs text-gray-500 mt-2">Ignores temperature variations. Inaccurate in different seasons.</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg">
                                        <p className="font-bold text-green-600 mb-2">✅ GDD</p>
                                        <p className="text-sm text-gray-700">Lettuce: 700 GDD to harvest</p>
                                        <p className="text-xs text-gray-500 mt-2">Accounts for heat accumulation. Accurate year-round.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                                <h5 className="font-bold text-blue-900 mb-2">🔬 Formula Used</h5>
                                <code className="text-sm bg-white p-2 rounded block">
                                    GDD = ((Tmax + Tmin) / 2) - Tbase<br />
                                    Tbase = 4°C for leafy greens
                                </code>
                                <p className="text-xs text-gray-600 mt-2">Only positive values count. If result is negative, GDD = 0 for that day.</p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                                <h5 className="font-bold text-green-900 mb-2">📊 Crop-Specific GDD Targets</h5>
                                <ul className="text-sm space-y-1 text-gray-700">
                                    <li>• Radish (Mooli): 400 GDD</li>
                                    <li>• Fenugreek (Methi): 500 GDD</li>
                                    <li>• Lettuce: 700 GDD</li>
                                    <li>• Basil (Tulsi): 900 GDD</li>
                                    <li>• Tomato: 1750 GDD</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logic' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Zap className="text-yellow-600" />
                                Advanced Logic & DLI
                            </h3>

                            {/* DLI SECTION */}
                            <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
                                <h4 className="font-bold text-lg mb-3 text-yellow-900">What is DLI? (Daily Light Integral)</h4>
                                <p className="text-gray-700 mb-4">
                                    <strong>DLI</strong> is the total amount of light (photons) a plant receives in a day.
                                    Think of it as the "light dose" for your crop.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded border border-yellow-100">
                                    <div>
                                        <p className="font-bold text-sm">Formula:</p>
                                        <code className="text-xs bg-gray-100 p-1 rounded block mt-1">
                                            DLI = PPFD × Hours × 0.0036
                                        </code>
                                        <p className="text-[10px] text-gray-500 mt-1">PPFD = Light Intensity (μmol/m²/s)</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Targets:</p>
                                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                                            <li>• Microgreens: 6-12 mol/m²/d</li>
                                            <li>• Lettuce: 12-17 mol/m²/d</li>
                                            <li>• Tomato: 20-30 mol/m²/d</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* LIGHT PHYSICS SECTION (1ft Rule) */}
                            <div className="bg-gray-800 text-white p-6 rounded-lg border-2 border-gray-600">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <Sun className="text-yellow-400" />
                                    Light Physics: The 1ft Rule
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-bold text-blue-300 mb-1">Linear Decay (Tube LEDs)</p>
                                        <p className="text-sm text-gray-300">
                                            Unlike bulbs (Inverse Square Law), Tube LEDs lose intensity linearly.
                                            Doubling distance = ~50% light loss.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-300 mb-1">The Goldilocks Zone</p>
                                        <p className="text-sm text-gray-300">
                                            <span className="text-green-400 font-bold">&lt; 12 inches:</span> Sweet Spot (100% Intensity).<br />
                                            <span className="text-red-400 font-bold">&gt; 12 inches:</span> Weak Spot (Intensity drops 50%).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FARM HEALTH SCORE SECTION */}
                            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                                <h4 className="font-bold text-lg mb-3 text-green-900">Farm Health Score Logic</h4>
                                <p className="text-gray-700 mb-2">
                                    Your Score starts at <strong>100</strong> (Perfect Health). Points are deducted dynamically based on risks:
                                </p>
                                <ul className="text-sm space-y-2 text-gray-700 bg-white p-4 rounded border border-green-100">
                                    <li className="flex items-center gap-2">
                                        <span className="text-red-500 font-bold">-30 pts</span>
                                        Critical Alert (e.g., Root Rot Risk, Water Temp &gt; 25°C)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-orange-500 font-bold">-20 pts</span>
                                        High Disease Risk (e.g., Fungal Condition met)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-yellow-500 font-bold">-15 pts</span>
                                        Medium Alert (e.g., pH Drift)
                                    </li>
                                </ul>
                            </div>

                            {/* DISEASE RISK SECTION */}
                            <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                                <h4 className="font-bold text-lg mb-3 text-red-900">Disease Risk Calculation</h4>
                                <p className="text-gray-700 mb-2">
                                    We use the <strong>Disease Triangle</strong> principle (Host + Pathogen + Environment).
                                    Specific environmental triggers are monitored in real-time:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    <div className="bg-white p-3 rounded border border-red-100">
                                        <p className="font-bold text-sm text-red-800">🍄 Fungal Risk</p>
                                        <p className="text-xs text-gray-600">Trigger: Humidity &gt; 70% AND Temp 20-30°C</p>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-red-100">
                                        <p className="font-bold text-sm text-red-800">🦠 Bacterial Risk</p>
                                        <p className="text-xs text-gray-600">Trigger: Temp &gt; 30°C AND Humidity &gt; 80%</p>
                                    </div>
                                </div>
                            </div>

                            {/* SOLAR ACTIVITY SECTION */}
                            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                                <h4 className="font-bold text-lg mb-3 text-blue-900">Solar Activity Monitoring</h4>
                                <p className="text-gray-700">
                                    <strong className="text-blue-600">Live Data Source:</strong> Open-Meteo API
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    "High Solar Activity" is triggered when solar radiation exceeds <strong>400 W/m²</strong>.
                                    This indicates intense photosynthesis potential, meaning plants will drink more water and grow faster.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'antagonism' && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="text-red-600" />
                                Nutrient Antagonism: Ionic Warfare
                            </h3>

                            <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                                <h4 className="font-bold text-lg mb-3 text-red-900">What is Nutrient Antagonism?</h4>
                                <p className="text-gray-700 mb-4">
                                    Nutrients compete for the same uptake sites in plant roots. When one nutrient is in excess,
                                    it can <strong>block</strong> the absorption of another, even if that nutrient is present in the solution.
                                </p>
                                <p className="text-gray-700">
                                    This is called <strong>Mulder's Chart</strong> - a map of nutrient interactions discovered by Dutch scientist G.J. Mulder.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-lg">Common Antagonisms Detected:</h4>

                                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                    <p className="font-bold text-yellow-900">1. K-Ca Antagonism (Potassium blocks Calcium)</p>
                                    <p className="text-sm text-gray-700 mt-2">When K &gt; 300 ppm, Calcium uptake is blocked → Tip burn, blossom end rot</p>
                                    <p className="text-xs text-gray-600 mt-1"><strong>Solution:</strong> Reduce K concentration or increase Ca supplementation</p>
                                </div>

                                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                                    <p className="font-bold text-red-900">2. Deadly Crossover (Temperature + Oxygen)</p>
                                    <p className="text-sm text-gray-700 mt-2">Water temp &gt; 25°C AND DO &lt; 6 mg/L → Root hypoxia → Root rot</p>
                                    <p className="text-xs text-gray-600 mt-1"><strong>Solution:</strong> Cool water or increase aeration immediately</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                    <p className="font-bold text-purple-900">3. pH Lockout</p>
                                    <p className="text-sm text-gray-700 mt-2">pH &gt; 6.5: Iron, Zinc, Manganese precipitate (unavailable)</p>
                                    <p className="text-sm text-gray-700">pH &lt; 5.5: Manganese toxicity, Calcium/Magnesium lockout</p>
                                    <p className="text-xs text-gray-600 mt-1"><strong>Solution:</strong> Maintain pH 5.8-6.2 for optimal nutrient availability</p>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                    <p className="font-bold text-orange-900">4. P-Zn/Fe Lockout (Phosphorus blocks micronutrients)</p>
                                    <p className="text-sm text-gray-700 mt-2">When P &gt; 80 ppm, Zinc and Iron form insoluble compounds</p>
                                    <p className="text-xs text-gray-600 mt-1"><strong>Solution:</strong> Reduce phosphorus or chelate micronutrients</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <p className="font-bold text-blue-900">5. Temperature Differential</p>
                                    <p className="text-sm text-gray-700 mt-2">Air temp - Water temp &gt; 8°C → Root shock → Nutrient uptake stops</p>
                                    <p className="text-xs text-gray-600 mt-1"><strong>Solution:</strong> Balance air and water temperatures</p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                                    <p className="font-bold text-gray-900">6. EC Extremes</p>
                                    <p className="text-sm text-gray-700 mt-2">EC &lt; 0.8: Nutrient starvation | EC &gt; 2.5: Salt stress (osmotic shock)</p>
                                    <p className="text-xs text-gray-600 mt-1"><strong>Solution:</strong> Maintain EC 1.2-2.0 for most crops</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'hardware' && (
                        <div className="space-y-8 pb-8">
                            <div className="text-center bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Agri-OS Hardware Buy List</h3>
                                <p className="text-slate-500 font-medium max-w-lg mx-auto">
                                    Aapke dashboard ke features ko enable karne ke liye ye basic hardware components ki requirement hai.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Controller Group */}
                                <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-emerald-300 transition-all hover:shadow-xl shadow-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                            <Cpu size={24} />
                                        </div>
                                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Controllers & Power</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">ESP32 Dev Board (30-Pin)</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase leading-tight mt-1 italic">
                                                    "The Processor" - Agri-OS ke server se data transfer ke liye Wi-Fi board. (Need: 2 Units)
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">12V 2A Adapter + Buck Converter</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase leading-tight mt-1 italic">
                                                    "Power Unit" - 12V se pumps chalenge aur Buck Converter se ESP32 safely power hoga.
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Actuators Group */}
                                <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-cyan-300 transition-all hover:shadow-xl shadow-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-cyan-100 text-cyan-600 rounded-2xl">
                                            <Zap size={24} />
                                        </div>
                                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Pumps & Toggles</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <CheckCircle2 size={16} className="text-cyan-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">4-Channel 5V Relay Module</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase leading-tight mt-1 italic">
                                                    "Switches" - Isse Dashboard se Pump, Light aur Fans ko ON/OFF kijiye.
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <CheckCircle2 size={16} className="text-cyan-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">12V Water Pump + Fan Motor</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase leading-tight mt-1 italic">
                                                    "Actioners" - Hydroponics flow aur Microgreens air circulation ke liye zuri components.
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Sensors Group */}
                                <div className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-indigo-300 transition-all hover:shadow-xl shadow-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                            <Activity size={24} />
                                        </div>
                                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Sensor Suite</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <CheckCircle2 size={16} className="text-indigo-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">pH & TDS/EC Probes (BNC)</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase leading-tight mt-1 italic">
                                                    "The Eyes" - Real-time nutrient monitoring ke liye required probes.
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <CheckCircle2 size={16} className="text-indigo-500 mt-1 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">DHT22 + DS18B20 (Water Temp)</p>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase leading-tight mt-1 italic">
                                                    "Environment Check" - Air humidty aur root-zone temperature tracking.
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Accessories Group */}
                                <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-white/10 rounded-2xl">
                                            <ShoppingCart size={24} className="text-amber-400" />
                                        </div>
                                        <h4 className="font-black uppercase tracking-widest text-sm">Wiring & Accessories</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-slate-300">Basic Connectivity Kit:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-white/10">Jumper Wires (F-F)</div>
                                            <div className="p-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-white/10">Breadboard (Medium)</div>
                                            <div className="p-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-white/10">4.7k Resistor (or 5.1k/10k)</div>
                                            <div className="p-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 border border-white/10">Micro-USB Cable</div>
                                        </div>
                                        <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-[9px] font-black text-amber-400 uppercase mb-1">Resistor Alternatives (Hindi):</p>
                                            <p className="text-[10px] text-slate-300 leading-tight">
                                                4.7k nahi mil raha? Tension mat lijiye! 5.1k ya 10k bhi chalega. <br />
                                                Series: 5x 1k resistors line mein lagayein.<br />
                                                Parallel: 2x 10k resistors saath mein lagayein.
                                            </p>
                                        </div>
                                        <p className="text-[9px] text-emerald-400 font-black tracking-tighter mt-4 flex items-center gap-1">
                                            <Zap size={10} fill="currentColor" /> Pro Tip: Zero-Soldering connection ke liye Female Jumper wires use karein.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Wiring Schematic Section (New) */}
                            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[2.5rem] p-8 relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
                                            <Link size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-800 uppercase tracking-tight text-xl">Pump Connection Guide</h4>
                                            <p className="text-emerald-700 text-xs font-bold italic">Safe 12V DC Wiring for "Chota Pump"</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-emerald-100 pb-2">
                                            <span>Component</span>
                                            <span>Action / Pin</span>
                                        </div>

                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                                <span className="font-bold text-slate-700">ESP32 Pin 18</span>
                                            </div>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Relay IN1</span>
                                        </div>

                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                <span className="font-bold text-slate-700">12V Power (+)</span>
                                            </div>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Relay COM</span>
                                        </div>

                                        <div className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                <span className="font-bold text-slate-700">Pump (+) Wire</span>
                                            </div>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">Relay NO</span>
                                        </div>

                                        <div className="mt-4 p-4 bg-emerald-600 text-white rounded-2xl">
                                            <p className="text-[10px] font-black uppercase mb-1 opacity-70">Expert Advice (Hinglish)</p>
                                            <p className="text-sm font-bold leading-tight">
                                                Sir, chota pump connect karna bilkul easy hai! Bas relay ko ek switch ki tarah use karein. Pump ki plus wire ko relay se guzarein aur ground ko direct adapter se jod dein. No shock risk!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        📚 Based on research from Wageningen University, Cornell CEA, and NASA VEGGIE
                    </p>
                    <button
                        onClick={onClose}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScientificInfoModal;
