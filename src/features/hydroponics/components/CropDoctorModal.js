import React, { useState } from 'react';
import { X, Stethoscope, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const SYMPTOM_DB = {
    'Leafy Greens': [
        { id: 'tip_burn', label: 'Brown/Crispy Leaf Tips', issue: 'Calcium Deficiency (Tip Burn)', fix: 'Increase airflow (VPD too low). Check Calcium levels.' },
        { id: 'yellowing', label: 'Yellowing Leaves (General)', issue: 'Nitrogen Deficiency', fix: 'Check pH (may be locked out). Add Nitrogen/Grow nutrient.' },
        { id: 'bolting', label: 'Flowers Appearing / Tall Stalk', issue: 'Bolting (Heat/Stress)', fix: 'Too hot! Harvest immediately. Reduce temp for next batch.' },
        { id: 'wilting', label: 'Wilting (Despite Water)', issue: 'Root Rot or Heat Stress', fix: 'Check roots (Brown=Rot). Check water temp (<24°C).' }
    ],
    'Fruiting': [
        { id: 'ber', label: 'Black Rot on Fruit Bottom', issue: 'Blossom End Rot (BER)', fix: 'Calcium Deficiency. Add CalMag. Ensure steady watering (no dry periods).' },
        { id: 'drop', label: 'Flowers Falling Off', issue: 'Blossom Drop', fix: 'Temp too high/low (>30°C or <10°C). Humidity stress. Pollinate manually.' },
        { id: 'yellow_veins', label: 'Yellow Leaves, Green Veins', issue: 'Magnesium Deficiency', fix: 'Add Epsom Salts (MgSO4). Check pH (6.0-6.5).' },
        { id: 'no_fruit', label: 'Lots of Leaves, No Fruit', issue: 'Too much Nitrogen', fix: 'Switch to "Bloom" nutrient formula (Lower N, Higher P/K).' }
    ],
    'Herbs': [
        { id: 'leggy', label: 'Tall, Weak Stems (Leggy)', issue: 'Insufficient Light', fix: 'Move light closer (12-18 inches). Increase DLI.' },
        { id: 'spots', label: 'White Powder on Leaves', issue: 'Powdery Mildew', fix: 'Reduce humidity. Increase airflow. Remove affected leaves.' },
        { id: 'woody', label: 'Stems Turning Woody', issue: 'Old Age / Bolting', fix: 'Harvest regularly. Pinch off flowers to extend life.' }
    ]
};

const CropDoctorModal = ({ isOpen, onClose, initialCategory = 'Leafy Greens' }) => {
    const [category, setCategory] = useState(initialCategory);
    const [selectedSymptom, setSelectedSymptom] = useState(null);

    if (!isOpen) return null;

    const symptoms = SYMPTOM_DB[category] || SYMPTOM_DB['Leafy Greens'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <Stethoscope size={28} /> Crop Doctor
                        </h2>
                        <p className="text-emerald-100 font-medium">Visual Diagnostics AI</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-emerald-700/50 rounded-full hover:bg-emerald-700 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Category Selector */}
                    <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
                        {Object.keys(SYMPTOM_DB).map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setCategory(cat); setSelectedSymptom(null); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${category === cat ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {!selectedSymptom ? (
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">What do you see?</p>
                            {symptoms.map(sym => (
                                <button
                                    key={sym.id}
                                    onClick={() => setSelectedSymptom(sym)}
                                    className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                                >
                                    <span className="font-bold text-slate-700 group-hover:text-emerald-700">{sym.label}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="text-amber-500" size={24} />
                                <h3 className="text-lg font-black text-slate-800">{selectedSymptom.issue}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                                    <p className="text-xs font-black text-emerald-600 uppercase mb-1">Diagnosis</p>
                                    <p className="text-slate-600 font-medium">{selectedSymptom.issue}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                                    <p className="text-xs font-black text-emerald-600 uppercase mb-1">Prescription</p>
                                    <p className="text-slate-800 font-bold text-lg">{selectedSymptom.fix}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedSymptom(null)}
                                className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                            >
                                Diagnose Another Issue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropDoctorModal;
