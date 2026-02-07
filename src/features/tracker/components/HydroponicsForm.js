/**
 * HydroponicsForm Component
 * Handles hydroponics-specific logging form
 * Extracted from DailyTrackerPage
 */

import React from 'react';
import { Droplets } from 'lucide-react';
import { LIGHTING_OPTIONS, WEATHER_CONDITIONS } from '../../../utils/agriUtils';

export const HydroponicsForm = ({
    entry,
    setEntry,
    activeSystems,
    nutrientWarnings,
    onSubmit,
    loading
}) => {
    return (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border-2 border-cyan-200">
            <div className="flex items-center gap-2 mb-4">
                <Droplets className="text-cyan-600" size={24} />
                <h2 className="text-xl font-bold text-cyan-900">💧 Hydroponics Tracker</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                {/* System Selection */}
                <div>
                    <label className="block text-sm font-bold text-cyan-900 mb-1">Select System</label>
                    <select
                        className="w-full p-2 border-2 border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        value={entry.targetId}
                        onChange={(e) => setEntry({ ...entry, targetId: e.target.value })}
                    >
                        <option value="">Choose a system...</option>
                        {activeSystems.map(system => (
                            <option key={system.id} value={system.id}>
                                {system.crop} - {system.system_type} (Day {system.daysCurrent || 0})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Visual Health Check */}
                <div className="bg-white p-4 rounded-lg border-2 border-cyan-200 shadow-sm">
                    <label className="block text-sm font-bold text-cyan-900 mb-2">
                        📸 How does the system look?
                    </label>
                    <select
                        required
                        className="w-full p-3 border-2 border-cyan-300 rounded-lg text-lg font-medium"
                        value={entry.visualCheck}
                        onChange={(e) => setEntry({ ...entry, visualCheck: e.target.value })}
                    >
                        <option value="">Select status...</option>
                        <option>Crystal Clear & Green ✨</option>
                        <option>Slightly Cloudy Water 🌫️</option>
                        <option>Yellowing Leaves 🟡</option>
                        <option>Root Browning/Slime 🟤</option>
                        <option>Algae Growth 🟢</option>
                    </select>
                </div>

                {/* Water Chemistry */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">pH</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.ph}
                            onChange={(e) => setEntry({ ...entry, ph: e.target.value })}
                            placeholder="6.0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">EC (mS/cm)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.ec}
                            onChange={(e) => setEntry({ ...entry, ec: e.target.value })}
                            placeholder="1.8"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Water Temp (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.waterTemp}
                            onChange={(e) => setEntry({ ...entry, waterTemp: e.target.value })}
                            placeholder="20"
                        />
                    </div>
                </div>

                {/* Nutrient Warnings */}
                {nutrientWarnings && nutrientWarnings.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="font-bold text-red-800 text-sm mb-2">⚠️ Nutrient Warnings:</p>
                        {nutrientWarnings.map((warning, idx) => (
                            <div key={idx} className="text-xs text-red-700 mb-1">
                                • {warning.title}: {warning.diagnosis}
                            </div>
                        ))}
                    </div>
                )}

                {/* Environment */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Air Temp (°C)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.temperature}
                            onChange={(e) => setEntry({ ...entry, temperature: e.target.value })}
                            placeholder="24"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Humidity (%)</label>
                        <input
                            type="number"
                            step="1"
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.humidity}
                            onChange={(e) => setEntry({ ...entry, humidity: e.target.value })}
                            placeholder="60"
                        />
                    </div>
                </div>

                {/* Lighting */}
                <div>
                    <label className="block text-sm font-bold text-cyan-900 mb-1">Lighting Source</label>
                    <select
                        className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                        value={entry.lightingSource}
                        onChange={(e) => setEntry({ ...entry, lightingSource: e.target.value })}
                    >
                        {LIGHTING_OPTIONS.HYDROPONICS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Light Hours/Day</label>
                        <input
                            type="number"
                            step="0.5"
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.lightHours}
                            onChange={(e) => setEntry({ ...entry, lightHours: e.target.value })}
                            placeholder="16"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Weather</label>
                        <select
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.weatherCondition}
                            onChange={(e) => setEntry({ ...entry, weatherCondition: e.target.value })}
                        >
                            {WEATHER_CONDITIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* System Status */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Pump Status</label>
                        <select
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.pumpStatus}
                            onChange={(e) => setEntry({ ...entry, pumpStatus: e.target.value })}
                        >
                            <option value="ON">ON</option>
                            <option value="OFF">OFF</option>
                            <option value="INTERMITTENT">Intermittent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-cyan-900 mb-1">Water Flow</label>
                        <select
                            className="w-full p-2 border-2 border-cyan-300 rounded-lg"
                            value={entry.waterFlow}
                            onChange={(e) => setEntry({ ...entry, waterFlow: e.target.value })}
                        >
                            <option value="Normal">Normal</option>
                            <option value="Weak">Weak</option>
                            <option value="Blocked">Blocked</option>
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-bold text-cyan-900 mb-1">Notes (Optional)</label>
                    <textarea
                        className="w-full p-2 border-2 border-cyan-300 rounded-lg"
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
                    className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold hover:bg-cyan-700 transition disabled:opacity-50"
                >
                    {loading ? 'Saving...' : '💾 Save Hydroponics Log'}
                </button>
            </form>
        </div>
    );
};
