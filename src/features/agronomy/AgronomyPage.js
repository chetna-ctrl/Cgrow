import React, { useState } from 'react';
import AgronomyPanel from './components/AgronomyPanel';
import { Sprout, Calendar, Layers, MapPin, TrendingUp } from 'lucide-react';
import { recommendCrop } from '../../utils/agronomyAlgorithms';
import { SOIL_TYPES, SEASONS, CLIMATE_ZONES } from '../../data/agronomyDatabase';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const AgronomyPage = () => {
    const [planner, setPlanner] = useState({
        soil: 'loamy',
        season: 'Kharif',
        climate: 'subtropical'
    });

    const recommendedCrop = recommendCrop(planner.soil, planner.season, planner.climate);
    const selectedSoil = SOIL_TYPES[planner.soil];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                        <Sprout className="text-emerald-500" /> Agronomy Intelligence
                    </h1>
                    <p className="text-slate-600">Biological insights, VPD tracking, and Nutrient lockout monitoring.</p>
                </div>
            </div>

            {/* ADVANCED CROP PLANNER WIZARD (UPGRADED) */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 shadow-sm">
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="text-emerald-600" /> AI Crop Planner Wizard
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">Select your farm conditions to get personalized crop recommendations</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Soil Type Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                                <Layers size={14} /> Soil Type
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={planner.soil}
                                onChange={(e) => setPlanner({ ...planner, soil: e.target.value })}
                            >
                                {Object.entries(SOIL_TYPES).map(([key, soil]) => (
                                    <option key={key} value={key}>{soil.name}</option>
                                ))}
                            </select>
                            {selectedSoil && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {selectedSoil.texture} | {selectedSoil.drainage} drainage
                                </p>
                            )}
                        </div>

                        {/* Season Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                                <Calendar size={14} /> Season
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={planner.season}
                                onChange={(e) => setPlanner({ ...planner, season: e.target.value })}
                            >
                                {Object.entries(SEASONS).map(([key, season]) => (
                                    <option key={key} value={season.name}>{season.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Climate Zone Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                                <MapPin size={14} /> Climate Zone
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={planner.climate}
                                onChange={(e) => setPlanner({ ...planner, climate: e.target.value })}
                            >
                                {Object.entries(CLIMATE_ZONES).map(([key, climate]) => (
                                    <option key={key} value={key}>{climate.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Recommendation Result */}
                    <div className="bg-white p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-100 rounded-full">
                                <TrendingUp className="text-emerald-600" size={24} />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Crop</span>
                                <h3 className="text-3xl font-bold text-emerald-700">{recommendedCrop}</h3>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600">
                            Best suited for <strong>{selectedSoil?.name}</strong> during <strong>{planner.season}</strong> season in <strong>{CLIMATE_ZONES[planner.climate]?.name}</strong> climate.
                        </p>
                        {selectedSoil && (
                            <div className="mt-3 p-3 bg-slate-50 rounded border border-slate-200">
                                <p className="text-xs font-bold text-slate-700 mb-1">Soil Advice:</p>
                                <p className="text-xs text-slate-600">{selectedSoil.recommendation}</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <AgronomyPanel />
        </div>
    );
};

export default AgronomyPage;
