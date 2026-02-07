// src/components/VPDWidget.js
// Interactive VPD Calculator Widget for Dashboard

import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Info } from 'lucide-react';
import { calculateVPD, getVpdStatus } from '../utils/agronomyLogic';
import { useBeginnerMode } from '../context/BeginnerModeContext';

const VPDWidget = ({ initialTemp, initialHumidity, compact = false, isLive = false }) => {
    const [temp, setTemp] = useState(initialTemp || '');
    const [humidity, setHumidity] = useState(initialHumidity || '');
    const [vpd, setVpd] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const { isBeginnerMode, t } = useBeginnerMode();

    // Sync props to state when they change (critical for Dashboard updates)
    useEffect(() => {
        if (initialTemp !== undefined && initialTemp !== null) setTemp(initialTemp);
        if (initialHumidity !== undefined && initialHumidity !== null) setHumidity(initialHumidity);
    }, [initialTemp, initialHumidity]);

    useEffect(() => {
        if (temp && humidity) {
            const val = calculateVPD(parseFloat(temp), parseFloat(humidity));
            setVpd(val);
        } else {
            setVpd(null);
        }
    }, [temp, humidity]);

    const vpdInfo = getVpdStatus(vpd);

    // Compact mode for sidebar/small spaces
    if (compact) {
        return (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Wind className="text-emerald-600" size={18} />
                    <span className="font-bold text-slate-700 text-sm">{t("Air Comfort", "VPD Analysis")}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <input
                        type="number"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                        placeholder="°C"
                        className="p-2 border rounded-lg text-sm text-center"
                    />
                    <input
                        type="number"
                        value={humidity}
                        onChange={(e) => setHumidity(e.target.value)}
                        placeholder="%RH"
                        className="p-2 border rounded-lg text-sm text-center"
                    />
                </div>
                {vpd !== null && (
                    <div className={`p-2 rounded-lg text-center text-sm font-bold ${vpdInfo.color === 'green' ? 'bg-emerald-100 text-emerald-700' :
                        vpdInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                            vpdInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                        }`}>
                        {vpdInfo.icon} {!isBeginnerMode && `${vpd} kPa`} {isBeginnerMode && vpdInfo.label}
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 rounded-2xl border-2 border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                        <Wind className="text-white" size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-800">{t("Air Comfort", "VPD Analysis")}</h3>
                            {isLive && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200 shadow-sm animate-pulse">
                                    Live
                                </span>
                            )}
                            {!isLive && (temp || humidity) && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200 shadow-sm" title="Estimated from local weather data">
                                    Estimated
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{t("How comfortable the air is", "Vapor Pressure Deficit")}</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <Info size={18} className="text-slate-400" />
                </button>
            </div>

            {showInfo && (
                <div className="bg-white/70 p-4 rounded-xl mb-4 text-sm text-slate-600">
                    <p className="font-bold mb-2">What is Air Comfort (VPD)?</p>
                    <p className="mb-2">
                        This measures how "thirsty" the air is. It's the difference between how much
                        moisture the air <em>can</em> hold vs. how much it <em>does</em> hold.
                    </p>
                    <p className="font-bold mb-1">Target Ranges:</p>
                    <ul className="list-disc list-inside text-xs space-y-1">
                        <li><span className="text-blue-600">0.4-0.8 kPa:</span> Seedlings/Clones</li>
                        <li><span className="text-emerald-600">0.8-1.2 kPa:</span> Vegetative Growth ✓</li>
                        <li><span className="text-amber-600">1.2-1.6 kPa:</span> Flowering/Fruiting</li>
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-600 mb-2">
                        <Thermometer size={14} /> Temperature
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={temp}
                            onChange={(e) => setTemp(e.target.value)}
                            placeholder="24"
                            className="w-full p-3 pr-10 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">°C</span>
                    </div>
                </div>
                <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-slate-600 mb-2">
                        <Droplets size={14} /> Humidity
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={humidity}
                            onChange={(e) => setHumidity(e.target.value)}
                            placeholder="60"
                            className="w-full p-3 pr-10 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                    </div>
                </div>
            </div>

            {/* VPD Result */}
            <div className={`p-5 rounded-xl transition-all ${vpd === null ? 'bg-slate-100 border-2 border-dashed border-slate-300' :
                vpdInfo.color === 'green' ? 'bg-emerald-500 text-white' :
                    vpdInfo.color === 'blue' ? 'bg-blue-500 text-white' :
                        vpdInfo.color === 'red' ? 'bg-red-500 text-white' :
                            vpdInfo.color === 'yellow' ? 'bg-amber-500 text-white' :
                                vpdInfo.color === 'cyan' ? 'bg-cyan-500 text-white' :
                                    'bg-slate-500 text-white'
                }`}>
                {vpd === null ? (
                    <p className="text-center text-slate-400">
                        Enter temperature & humidity to see Air Comfort
                    </p>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-3xl font-black">{!isBeginnerMode ? `${vpd} kPa` : vpdInfo.label}</span>
                            <span className="text-4xl drop-shadow-lg">{vpdInfo.icon}</span>
                        </div>
                        {!isBeginnerMode && <p className="font-black mb-1 text-xs opacity-70 uppercase tracking-widest">{vpdInfo.label}</p>}
                        <p className="text-sm font-medium opacity-90">{vpdInfo.recommendation}</p>
                    </>
                )}
            </div>

            {/* Quick Presets */}
            <div className="mt-4 flex gap-2">
                <span className="text-xs text-slate-500">Quick:</span>
                {[
                    { label: 'Cool', temp: 20, hum: 70 },
                    { label: 'Ideal', temp: 24, hum: 60 },
                    { label: 'Hot', temp: 30, hum: 50 }
                ].map(preset => (
                    <button
                        key={preset.label}
                        onClick={() => { setTemp(preset.temp); setHumidity(preset.hum); }}
                        className="text-xs px-2 py-1 bg-white/50 hover:bg-white rounded-lg border border-slate-200"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default VPDWidget;
