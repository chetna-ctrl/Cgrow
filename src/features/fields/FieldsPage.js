import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CloudRain, Sprout, AlertTriangle, Droplets, Activity, TrendingUp, Leaf } from 'lucide-react';
import { analyzeWeatherImpact, getFertilizerRecommendation, checkIrrigation, calculateSoilHealth } from '../../utils/algorithms';
import { predictYield, calculateNutrientNeeds } from '../../utils/agronomyAlgorithms';
import { fetchAgriStats } from '../../services/weatherService';

// --- MOCK DATA (Connecting Field -> Crop) ---
const FIELD_DATA = {
    id: 'F-101',
    name: 'North Sector A',
    soil: { n: 30, p: 45, k: 50, ph: 5.8, moisture: 25 }, // Added Moisture
    currentCrop: {
        name: 'Tomato (Roma)',
        plantedDate: '2023-11-01',
        daysPlanted: 45,
        healthScore: 88
    },
    weather: { temp: 28, humidity: 65, rainForecast: 'None' },
    history: [
        { day: 10, growth: 5, projected: 6 },
        { day: 20, growth: 12, projected: 14 },
        { day: 30, growth: 25, projected: 24 },
        { day: 40, growth: 38, projected: 35 },
        { day: 50, growth: 48, projected: 45 },
    ]
};

const FieldsPage = () => {
    // eslint-disable-next-line no-unused-vars
    const [activeTab, setActiveTab] = useState('analytics');
    const [agriData, setAgriData] = useState({ moisture: 25, soilTemp: 24 });

    // Fetch Real Agri Data
    useEffect(() => {
        const loadRealData = async () => {
            const data = await fetchAgriStats();
            if (data) setAgriData({ moisture: data.soilMoisture * 100, soilTemp: data.soilTemp }); // Convert 0-1 to %
        };
        loadRealData();
    }, []);

    // 1. Run Logic Functions (Legacy)
    const weatherStatus = analyzeWeatherImpact(FIELD_DATA.weather.temp, FIELD_DATA.weather.humidity, FIELD_DATA.currentCrop.name);
    const soilRecommendations = getFertilizerRecommendation(FIELD_DATA.soil.n, FIELD_DATA.soil.p, FIELD_DATA.soil.k, FIELD_DATA.soil.ph);

    // 2. Run Contextual AI Logic (New)
    const irrigation = checkIrrigation(agriData.moisture, FIELD_DATA.weather.temp);
    const soilHealthScore = calculateSoilHealth(FIELD_DATA.soil.n, FIELD_DATA.soil.p, FIELD_DATA.soil.k, FIELD_DATA.soil.ph);

    // 3. NEW: Advanced Agronomy Algorithms
    const yieldPrediction = predictYield('tomato', FIELD_DATA.soil, FIELD_DATA.soil.ph, 2.5, FIELD_DATA.weather.temp);
    const nutrientNeeds = calculateNutrientNeeds('tomato', FIELD_DATA.soil, 'vegetative');

    return (
        <div className="w-full space-y-6">

            {/* HEADER: Connectivity Flow (Field -> Crop) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{FIELD_DATA.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                        <Sprout size={18} />
                        <span>Current Crop: <span className="font-semibold text-green-600 dark:text-green-400">{FIELD_DATA.currentCrop.name}</span></span>
                        <span className="text-gray-300 dark:text-slate-600">|</span>
                        <span>Day {FIELD_DATA.currentCrop.daysPlanted}</span>
                    </div>
                </div>
                {/* ACTION BAR (AI Powered) */}
                <div className="mt-4 md:mt-0 flex items-center gap-6">
                    {/* Irrigation Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${irrigation.color === 'red' ? 'bg-red-50 border-red-200 text-red-700' : irrigation.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                        <Droplets size={18} className={irrigation.color === 'red' ? 'animate-bounce' : ''} />
                        <span className="font-bold">{irrigation.action}</span>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Health Score</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{FIELD_DATA.currentCrop.healthScore}%</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Intelligence & Recommendations */}
                <div className="lg:col-span-1 space-y-6">

                    {/* YIELD PREDICTOR (NEW) */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <TrendingUp size={20} className="text-emerald-500" /> Yield Prediction
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-600">Expected Yield</span>
                            <span className={`text-3xl font-bold ${yieldPrediction.rating === 'Excellent' ? 'text-emerald-600' :
                                yieldPrediction.rating === 'Good' ? 'text-blue-600' :
                                    yieldPrediction.rating === 'Fair' ? 'text-amber-600' : 'text-red-600'
                                }`}>{yieldPrediction.predictedYield}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                            <div
                                className={`h-2 rounded-full transition-all ${yieldPrediction.rating === 'Excellent' ? 'bg-emerald-500' :
                                    yieldPrediction.rating === 'Good' ? 'bg-blue-500' :
                                        yieldPrediction.rating === 'Fair' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${yieldPrediction.predictedYield}%` }}
                            ></div>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mb-1">Rating: {yieldPrediction.rating}</p>
                        {yieldPrediction.limitingFactors.length > 0 && (
                            <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                                <p className="text-xs font-bold text-amber-700">Limiting Factors:</p>
                                <ul className="text-xs text-amber-600 mt-1 space-y-1">
                                    {yieldPrediction.limitingFactors.map((factor, idx) => (
                                        <li key={idx}>• {factor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* NUTRIENT CALCULATOR (NEW) */}
                    {Array.isArray(nutrientNeeds) && nutrientNeeds.length > 0 && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Leaf size={20} className="text-green-500" /> Nutrient Recommendations
                            </h3>
                            <div className="space-y-3">
                                {nutrientNeeds.map((need, idx) => (
                                    <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-bold text-red-700">{need.nutrient}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${need.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                }`}>{need.urgency}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2">
                                            Current: {need.current} | Required: {need.required} | Deficit: {need.deficit}
                                        </p>
                                        <p className="text-xs font-bold text-slate-900 bg-white p-2 rounded border border-slate-200">
                                            {need.action}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SOIL HEALTH PROGRESS BAR */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <Activity size={20} className="text-purple-500" /> Soil Health Score
                        </h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Overall Quality</span>
                            <span className="text-lg font-bold text-purple-600">{soilHealthScore}/100</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${soilHealthScore}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Calculated from NPK balance and pH levels.</p>
                    </div>


                    {/* Weather Intelligence Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-4">
                            <CloudRain size={20} className="text-blue-500" /> Weather Intelligence
                        </h3>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="text-3xl font-bold text-gray-800 dark:text-white">{FIELD_DATA.weather.temp}°C</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Humidity: {FIELD_DATA.weather.humidity}%</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${weatherStatus.status === 'Optimal' ? 'bg-green-100 text-green-700 dark:bg-green-900/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/10 dark:text-red-400'}`}>
                                {weatherStatus.status}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-3 rounded border-l-4 border-blue-400 dark:border-blue-500">
                            💡 {weatherStatus.message}
                        </p>
                    </div>

                    {/* Soil & Fertilizer Logic Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-4">
                            <Droplets size={20} className="text-amber-600" /> Soil Recommendations
                        </h3>

                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                            <div className="bg-gray-50 dark:bg-slate-900 p-2 rounded">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nitrogen</p>
                                <p className={`font-bold ${FIELD_DATA.soil.n < 40 ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{FIELD_DATA.soil.n}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-900 p-2 rounded">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Phos</p>
                                <p className="font-bold text-gray-800 dark:text-white">{FIELD_DATA.soil.p}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-900 p-2 rounded">
                                <p className="text-xs text-gray-500 dark:text-gray-400">pH Level</p>
                                <p className={`font-bold ${FIELD_DATA.soil.ph < 6 ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>{FIELD_DATA.soil.ph}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {soilRecommendations.map((rec, index) => (
                                <div key={index} className="flex gap-3 items-start bg-amber-50 dark:bg-amber-900/20 p-3 rounded border border-amber-100 dark:border-amber-900/30">
                                    <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">{rec.type} - {rec.urgency}</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Predictive Analytics Dashboard */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Growth vs. Prediction</h3>
                        <select className="text-sm border rounded-md p-1 bg-gray-50 dark:bg-slate-900 dark:border-slate-600 dark:text-white">
                            <option>Last 30 Days</option>
                            <option>Full Cycle</option>
                        </select>
                    </div>

                    {/* PREDICTIVE CHART */}
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={FIELD_DATA.history}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-slate-700" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} label={{ value: 'Days Since Planting', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} />

                                {/* Actual Growth Line */}
                                <Line
                                    type="monotone"
                                    dataKey="growth"
                                    name="Actual Growth (cm)"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                />

                                {/* Predictive AI Line (Dashed) */}
                                <Line
                                    type="monotone"
                                    dataKey="projected"
                                    name="AI Projection"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-4">
                        <div className="bg-white dark:bg-indigo-600 p-2 rounded-full text-indigo-600 dark:text-white font-bold">AI Insight</div>
                        <p className="text-sm text-indigo-900 dark:text-indigo-200">
                            Real-time Soil Moisture is <strong>{agriData.moisture.toFixed(1)}%</strong>. Projected yield updated based on Satellite indices.
                        </p>
                    </div>

                    {/* NEW: COMPREHENSIVE ANALYTICS SECTION */}
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Crop Health Prediction */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="text-emerald-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-900">Crop Health Prediction</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700">Current Health Score</span>
                                    <span className="text-2xl font-bold text-emerald-600">{FIELD_DATA.currentCrop.healthScore}/100</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700">Projected (7 days)</span>
                                    <span className="text-xl font-bold text-blue-600">92/100</span>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <p className="text-xs font-bold text-amber-900 mb-1">⚠️ Risk Factors</p>
                                    <ul className="text-xs text-amber-700 space-y-1">
                                        <li>• High humidity (65%) - Monitor for fungal issues</li>
                                        <li>• Nitrogen slightly low - Consider fertilization</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pest & Disease Risk */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="text-orange-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-900">Pest & Disease Risk</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-green-900">Aphids</span>
                                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded font-bold">LOW</span>
                                    </div>
                                    <p className="text-xs text-green-700">Temperature too low for outbreak</p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-amber-900">Powdery Mildew</span>
                                        <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded font-bold">MEDIUM</span>
                                    </div>
                                    <p className="text-xs text-amber-700">High humidity detected - Increase air circulation</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-green-900">Blight</span>
                                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded font-bold">LOW</span>
                                    </div>
                                    <p className="text-xs text-green-700">Conditions not favorable</p>
                                </div>
                            </div>
                        </div>

                        {/* Harvest Timeline */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sprout className="text-purple-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-900">Harvest Timeline</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Days Since Planting</span>
                                    <span className="text-lg font-bold text-slate-900">{FIELD_DATA.currentCrop.daysPlanted} days</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all"
                                        style={{ width: `${(FIELD_DATA.currentCrop.daysPlanted / 90) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Planted</span>
                                    <span>Harvest (90 days)</span>
                                </div>
                                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <p className="text-sm font-bold text-purple-900 mb-1">Estimated Harvest Date</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {new Date(new Date(FIELD_DATA.currentCrop.plantedDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">45 days remaining</p>
                                </div>
                            </div>
                        </div>

                        {/* Yield Forecast */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-cyan-600" size={24} />
                                <h3 className="text-lg font-bold text-slate-900">Yield Forecast</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                                    <p className="text-xs font-bold text-cyan-900 mb-1">Projected Yield</p>
                                    <p className="text-3xl font-bold text-cyan-600">{yieldPrediction.yield} kg</p>
                                    <p className="text-xs text-cyan-700 mt-1">Based on current growth rate</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Confidence</p>
                                        <p className="text-lg font-bold text-slate-900">{yieldPrediction.confidence}%</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Quality Grade</p>
                                        <p className="text-lg font-bold text-emerald-600">A</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-xs font-bold text-emerald-900 mb-1">💰 Estimated Revenue</p>
                                    <p className="text-2xl font-bold text-emerald-600">₹{(yieldPrediction.yield * 45).toLocaleString()}</p>
                                    <p className="text-xs text-emerald-700 mt-1">@ ₹45/kg market price</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FieldsPage;
