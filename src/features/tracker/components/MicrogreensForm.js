/**
 * MicrogreensForm Component
 * Handles microgreens-specific logging form
 * Extracted from DailyTrackerPage
 */

import React from 'react';
import { Sprout } from 'lucide-react';
import { SmartAdviceCard } from './SmartAdviceCard';
import { LIGHTING_OPTIONS, WEATHER_CONDITIONS } from '../../../utils/agriUtils';

export const MicrogreensForm = ({
    entry,
    setEntry,
    activeBatches,
    smartAdvice,
    isAutoFilled,
    onSubmit,
    loading
}) => {
    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
                <Sprout className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-green-900">🌱 Microgreens Tracker</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                {/* Batch Selection */}
                <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Select Batch</label>
                    <select
                        className="w-full p-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        value={entry.batchId}
                        onChange={(e) => setEntry({ ...entry, batchId: e.target.value })}
                    >
                        <option value="">Choose a batch...</option>
                        {activeBatches.map(batch => (
                            <option key={batch.id} value={batch.id}>
                                {batch.crop} - Qty {batch.qty} (Day {batch.daysCurrent || 0})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Visual Health Check */}
                <div className="bg-white p-4 rounded-lg border-2 border-emerald-200 shadow-sm">
                    <label className="block text-sm font-bold text-green-900 mb-2">
                        📸 How do the leaves look today?
                    </label>
                    <select
                        required
                        className="w-full p-3 border-2 border-green-300 rounded-lg text-lg font-medium"
                        value={entry.visualCheck}
                        onChange={(e) => setEntry({ ...entry, visualCheck: e.target.value })}
                    >
                        <option value="">Select status...</option>
                        <option>Looking Perfect ✨</option>
                        <option>Slightly Yellowing 🟡</option>
                        <option>Mold/White Spots Detected 🍄</option>
                        <option>Wilting/Droopy 🥀</option>
                        <option>Ready for Harvest! ✂️</option>
                    </select>
                </div>

                {/* IoT Auto-fill Notification */}
                {isAutoFilled && (
                    <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-bounce">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Auto-filled from recent Sensor data 📡
                    </div>
                )}

                {/* Smart Advice */}
                <SmartAdviceCard advice={smartAdvice} />

                {/* Environment Inputs */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-green-900 mb-1">Temperature (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full p-2 border-2 border-green-300 rounded-lg"
                            value={entry.temperature}
                            onChange={(e) => setEntry({ ...entry, temperature: e.target.value })}
                            placeholder="e.g. 24"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-green-900 mb-1">Humidity (%)</label>
                        <input
                            type="number"
                            step="1"
                            className="w-full p-2 border-2 border-green-300 rounded-lg"
                            value={entry.humidity}
                            onChange={(e) => setEntry({ ...entry, humidity: e.target.value })}
                            placeholder="e.g. 65"
                        />
                    </div>
                </div>

                {/* Lighting */}
                <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Lighting Source</label>
                    <select
                        className="w-full p-2 border-2 border-green-300 rounded-lg"
                        value={entry.lightingSource}
                        onChange={(e) => setEntry({ ...entry, lightingSource: e.target.value })}
                    >
                        {LIGHTING_OPTIONS.MICROGREENS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-green-900 mb-1">Light Hours/Day</label>
                        <input
                            type="number"
                            step="0.5"
                            className="w-full p-2 border-2 border-green-300 rounded-lg"
                            value={entry.lightHours}
                            onChange={(e) => setEntry({ ...entry, lightHours: e.target.value })}
                            placeholder="16"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-green-900 mb-1">Weather</label>
                        <select
                            className="w-full p-2 border-2 border-green-300 rounded-lg"
                            value={entry.weatherCondition}
                            onChange={(e) => setEntry({ ...entry, weatherCondition: e.target.value })}
                        >
                            {WEATHER_CONDITIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-bold text-green-900 mb-1">Notes (Optional)</label>
                    <textarea
                        className="w-full p-2 border-2 border-green-300 rounded-lg"
                        rows="2"
                        value={entry.notes}
                        onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                        placeholder="Any observations..."
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Saving...' : '💾 Save Microgreens Log'}
                </button>
            </form>
        </div>
    );
};
