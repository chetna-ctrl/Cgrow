import React, { useState, useEffect } from 'react';
import { Sprout, Calendar, Plus, Activity, Droplets } from 'lucide-react';
import { farmingTypes, cropsByType, getRequirements } from '../data/farmingData';

const FieldsPage = () => {
    // 1. Persistence
    const [fields, setFields] = useState(() => {
        const saved = localStorage.getItem('agri_os_fields');
        // Default with some dummy data if empty
        return saved ? JSON.parse(saved) : [
            { id: 1, type: 'organic', crop: 'Organic Wheat', date: '2026-03-15', status: 'Active' },
            { id: 2, type: 'hydroponic', crop: 'Lettuce', date: '2026-04-01', status: 'Active' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('agri_os_fields', JSON.stringify(fields));
    }, [fields]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ type: '', crop: '', date: '' });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        const cropName = cropsByType[formData.type]?.find(c => c.id === formData.crop)?.name || formData.crop;
        const newField = {
            id: Date.now(),
            type: formData.type,
            crop: cropName,
            requirements: getRequirements(formData.type, formData.crop),
            date: formData.date,
            status: 'Planned'
        };
        setFields([...fields, newField]);
        setShowForm(false);
        setFormData({ type: '', crop: '', date: '' });
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header flex justify-between items-center">
                <div>
                    <h1 className="page-title">Field Management</h1>
                    <p className="text-slate-500">Overview of your active and planned zones.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    <Plus size={20} /> {showForm ? 'Cancel Setup' : 'New Setup'}
                </button>
            </div>

            {/* FORM SECTION (Conditionally Rendered) */}
            {showForm && (
                <div className="mb-8">
                    <form onSubmit={handleAddSubmit} className="tracker-form">
                        <div className="form-group form-full-width">
                            <h3 className="text-lg font-bold mb-4">Register New Field</h3>
                        </div>

                        <div className="form-group">
                            <label>Farming Type</label>
                            <select
                                className="form-select"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="">Select Type...</option>
                                {farmingTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Crop / Variety</label>
                            <select
                                className="form-select"
                                value={formData.crop}
                                onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                                required
                                disabled={!formData.type}
                            >
                                <option value="">Select Crop...</option>
                                {formData.type && cropsByType[formData.type]?.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group flex items-end">
                            <button className="btn-primary w-full">Confirm Setup</button>
                        </div>
                    </form>
                </div>
            )}

            {/* CARD GRID LAYOUT */}
            <div className="field-grid">
                {fields.map(field => (
                    <div key={field.id} className="card-panel group hover:border-emerald-500 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-slate-800">{field.crop}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${field.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {field.status}
                            </span>
                        </div>

                        <div className="text-slate-500 text-sm space-y-2 mb-4">
                            <p className="flex items-center gap-2">
                                <Sprout size={16} /> <span className="capitalize">{field.type}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Calendar size={16} /> Started: {field.date}
                            </p>
                        </div>

                        {/* Quick Specs */}
                        <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-50 p-2 rounded">
                                <span className="block text-slate-400">Water</span>
                                <span className="font-semibold text-slate-700 flex items-center gap-1">
                                    <Droplets size={12} /> Auto
                                </span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded">
                                <span className="block text-slate-400">Health</span>
                                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                    <Activity size={12} /> Good
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {fields.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <p>No active fields. Click "New Setup" to begin.</p>
                </div>
            )}
        </div>
    );
};

export default FieldsPage;
