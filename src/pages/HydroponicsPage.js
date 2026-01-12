import React, { useState } from 'react';
import { Activity, Droplets, Thermometer, Plus, Wind, Zap, X } from 'lucide-react';
import { useHydroponics } from '../hooks/useHydroponics';
import StatCard from '../components/StatCard';

const HydroponicsPage = () => {
    const { systems, updateSystem, addSystem, stats } = useHydroponics();
    const [showModal, setShowModal] = useState(false);
    const [newSys, setNewSys] = useState({ id: '', type: 'NFT', crop: '', ph: 6.0, ec: 1.5, temp: 20 });

    const handleAdd = (e) => {
        e.preventDefault();
        addSystem(newSys);
        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hydroponics Monitor</h1>
                    <p className="text-slate-400 text-sm">Real-time nutrient & pH tracking</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                >
                    <Plus size={18} /> Add System
                </button>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Active Systems" value={stats.totalSystems} icon={<Wind size={20} />} subtext="Online" />
                <StatCard title="Critical Alerts" value={stats.criticalCount} icon={<Activity size={20} />} trend={stats.criticalCount > 0 ? "Action Req" : "Stable"} />
                <StatCard title="Avg pH Level" value={stats.avgPh} icon={<Droplets size={20} />} subtext="Target: 5.8-6.2" />
                <StatCard title="Power Usage" value="2.4 kW" icon={<Zap size={20} />} subtext="Daily avg" />
            </div>

            {/* DARK TABLE */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        <Wind size={18} className="text-slate-400" /> System Metrics
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4">System ID</th>
                                <th className="p-4">Crop</th>
                                <th className="p-4">pH Level</th>
                                <th className="p-4">EC (mS)</th>
                                <th className="p-4">Temp (°C)</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {systems.map((system) => (
                                <tr key={system.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{system.id}</div>
                                        <div className="text-xs text-slate-500 font-mono">{system.type}</div>
                                    </td>
                                    <td className="p-4 text-slate-300">{system.crop}</td>

                                    {/* INPUTS (Dark Mode) */}
                                    <td className="p-4">
                                        <input
                                            type="number" step="0.1"
                                            value={system.ph}
                                            onChange={(e) => updateSystem(system.id, 'ph', e.target.value)}
                                            className={`w-20 bg-slate-800 border rounded p-1 text-center text-white ${system.ph < 5.5 || system.ph > 6.5 ? 'border-red-500 text-red-400' : 'border-slate-700'
                                                }`}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number" step="0.1"
                                            value={system.ec}
                                            onChange={(e) => updateSystem(system.id, 'ec', e.target.value)}
                                            className="w-20 bg-slate-800 border border-slate-700 rounded p-1 text-center text-white"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="number" step="1"
                                            value={system.temp}
                                            onChange={(e) => updateSystem(system.id, 'temp', e.target.value)}
                                            className="w-20 bg-slate-800 border border-slate-700 rounded p-1 text-center text-white"
                                        />
                                    </td>

                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${system.status === 'Critical' ? 'bg-red-900/20 text-red-400 border-red-900' :
                                                system.status === 'Warning' ? 'bg-amber-900/20 text-amber-400 border-amber-900' :
                                                    'bg-emerald-900/20 text-emerald-400 border-emerald-900'
                                            }`}>
                                            {system.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL (Dark Mode) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">New System</h3>
                            <button onClick={() => setShowModal(false)}><X className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <input required placeholder="System ID (e.g. NFT-3)" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" value={newSys.id} onChange={e => setNewSys({ ...newSys, id: e.target.value })} />
                            <input required placeholder="Crop Name" className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" value={newSys.crop} onChange={e => setNewSys({ ...newSys, crop: e.target.value })} />
                            <button type="submit" className="w-full py-3 bg-cyan-600 rounded-lg text-white font-bold hover:bg-cyan-500">Initialize System</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HydroponicsPage;
