
import React, { useState } from 'react';
import { X, BookOpen, Activity, AlertTriangle, Droplets, Sun, Zap, Thermometer } from 'lucide-react';

const ScientificInfoModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

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
                            <p className="text-green-100 text-sm">Understanding the Science Behind Agri-OS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px - 6 py - 3 font - semibold transition ${activeTab === 'overview'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            } `}
                    >
                        System Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('vpd')}
                        className={`px - 6 py - 3 font - semibold transition ${activeTab === 'vpd'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            } `}
                    >
                        VPD Theory
                    </button>
                    <button
                        onClick={() => setActiveTab('gdd')}
                        className={`px - 6 py - 3 font - semibold transition ${activeTab === 'gdd'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            } `}
                    >
                        GDD Theory
                    </button>
                    <button
                        onClick={() => setActiveTab('antagonism')}
                        className={`px - 6 py - 3 font - semibold transition ${activeTab === 'antagonism'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            } `}
                    >
                        Nutrient Antagonism
                    </button>
                    <button
                        onClick={() => setActiveTab('logic')}
                        className={`px - 6 py - 3 font - semibold transition ${activeTab === 'logic'
                            ? 'bg-white text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-green-600'
                            } `}
                    >
                        Logic & DLI
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
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
