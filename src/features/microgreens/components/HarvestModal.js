import React, { useState } from 'react';
import { X, Save, Scale, Star, Calendar } from 'lucide-react';

const HarvestModal = ({ isOpen, onClose, onSave, batch }) => {
    const [formData, setFormData] = useState({
        weight: '',
        quality: 'Good',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    if (!isOpen || !batch) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...batch,
            yield: formData.weight,
            quality: formData.quality,
            actualHarvestDate: formData.date,
            status: 'Harvested'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <div>
                        <h3 className="text-xl font-bold text-white">Harvest {batch.crop}</h3>
                        <p className="text-sm text-slate-400 font-mono">ID: {batch.id} • Tray: {batch.trayId}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Weight Input */}
                    <div>
                        <label className="block text-slate-400 text-sm font-semibold mb-2">Yield Weight (grams)</label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-3.5 text-slate-500" size={18} />
                            <input
                                type="number"
                                required
                                autoFocus
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 pl-10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-mono text-lg"
                                placeholder="e.g. 350"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Quality & Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm font-semibold mb-2">Quality</label>
                            <div className="relative">
                                <Star className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 pl-10 text-white focus:border-emerald-500 outline-none appearance-none"
                                    value={formData.quality}
                                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                                >
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Poor">Poor</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-semibold mb-2">Harvest Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 pl-10 text-white focus:border-emerald-500 outline-none"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                        >
                            <Save size={20} /> Complete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HarvestModal;
