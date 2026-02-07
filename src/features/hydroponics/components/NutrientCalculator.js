import React, { useState } from 'react';
import { Beaker, Calculator, AlertTriangle } from 'lucide-react';

const NutrientCalculator = ({ cropType = 'Tomato' }) => {
    const [tankSize, setTankSize] = useState('');
    const [phase, setPhase] = useState('Veg');

    // Standard Masterblend Ratios (grams per 5 Gallons / ~19 Liters)
    // Converted to Grams Per Liter for generic calculation
    // Recipe: Masterblend (4-18-38) / Calcium Nitrate (15.5-0-0) / Epsom Salt

    // Veg Stage (High Nitrogen)
    const RECIPES = {
        'Veg': { partA: 0.6, partB: 0.6, epsom: 0.3 }, // Approx 1.5 - 2.0 EC
        'Bloom': { partA: 0.6, partB: 1.0, epsom: 0.5 } // Higher K and Mg for fruit
    };

    // Fruiting plants need specific ratios. Leafy greens use Veg recipe always.
    const isFruiting = ['Tomato', 'Pepper', 'Cucumber', 'Strawberry', 'Fruiting'].includes(cropType);

    // If not fruiting user shouldn't even see the "Bloom" option ideally, but we'll handle logic
    const activeRecipe = (isFruiting && phase === 'Bloom') ? RECIPES['Bloom'] : RECIPES['Veg'];

    const calculate = () => {
        const liters = parseFloat(tankSize);
        if (!liters) return { a: 0, b: 0, epsom: 0 };
        return {
            a: (liters * activeRecipe.partA).toFixed(1), // Calcium Nitrate
            b: (liters * activeRecipe.partB).toFixed(1), // Masterblend
            epsom: (liters * activeRecipe.epsom).toFixed(1) // Epsom Salt
        };
    };

    const result = calculate();

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-sm h-full">
            <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Calculator size={18} className="text-indigo-600" />
                Recipe Mixer
            </h4>

            <div className="space-y-4">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-black uppercase text-indigo-400 mb-1 block">Tank (Liters)</label>
                        <input
                            type="number"
                            value={tankSize}
                            onChange={(e) => setTankSize(e.target.value)}
                            placeholder="e.g. 50"
                            className="w-full p-2 rounded-lg border-2 border-white bg-white/50 focus:bg-white focus:border-indigo-400 outline-none text-indigo-900 font-bold"
                        />
                    </div>
                    {isFruiting ? (
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-400 mb-1 block">Stage</label>
                            <select
                                value={phase}
                                onChange={(e) => setPhase(e.target.value)}
                                className="w-full p-2 rounded-lg border-2 border-white bg-white/50 focus:bg-white focus:border-indigo-400 outline-none text-indigo-900 font-bold"
                            >
                                <option value="Veg">Vegetative (Growth)</option>
                                <option value="Bloom">Flowering (Fruit)</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="text-[10px] font-black uppercase text-indigo-400 mb-1 block">Rec. Type</label>
                            <div className="py-2 text-sm font-bold text-indigo-600">Standard Grow</div>
                        </div>
                    )}
                </div>

                {/* Results */}
                {tankSize ? (
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-indigo-50">
                        <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                            <span className="text-xs text-indigo-400 font-bold">Total Mix for {tankSize}L</span>
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">EC ~{phase === 'Bloom' ? '2.4' : '1.8'}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between font-bold text-sm text-slate-700">
                                <span>1. Calcium Nitrate (Part A):</span>
                                <span className="text-indigo-600">{result.a}g</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-slate-700">
                                <span>2. Masterblend (Part B):</span>
                                <span className="text-indigo-600">{result.b}g</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-slate-700">
                                <span>3. Epsom Salt (MgSO4):</span>
                                <span className="text-indigo-600">{result.epsom}g</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-xs text-indigo-400 font-medium py-4">
                        Enter tank size to see recipe
                    </div>
                )}

                {/* Warning */}
                <div className="flex gap-2 items-start bg-yellow-50 p-2 rounded-lg">
                    <AlertTriangle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-yellow-800 leading-tight">
                        <strong>Order Matters!</strong> Dissolve Part A fully first. Then add Part B. Never mix dry powers together or nutrients will lock out.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NutrientCalculator;
