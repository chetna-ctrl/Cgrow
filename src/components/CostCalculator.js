import React, { useState } from 'react';
import { Settings, Zap, DollarSign } from 'lucide-react';

const CostCalculator = ({ lightHours = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rate, setRate] = useState(8); // ₹/kWh
    const [wattage, setWattage] = useState(200); // Watts

    const dailyKwh = (wattage / 1000) * lightHours;
    const dailyCost = dailyKwh * rate;
    const monthlyCost = dailyCost * 30;

    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Zap size={18} className="text-amber-500" />
                    <span className="text-sm">Electricity Cost Est.</span>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-400"
                >
                    <Settings size={14} />
                </button>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-black text-slate-800">₹{dailyCost.toFixed(1)}</span>
                <span className="text-xs font-bold text-slate-400">/ day</span>
            </div>

            {isOpen && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 animate-in slide-in-from-top-2">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Power Rate (₹/kWh)
                        </label>
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm border rounded-lg font-bold text-slate-700"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Total Wattage (W)
                        </label>
                        <input
                            type="number"
                            value={wattage}
                            onChange={(e) => setWattage(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 text-sm border rounded-lg font-bold text-slate-700"
                        />
                    </div>
                    <div className="pt-2">
                        <p className="text-xs text-slate-500 flex justify-between">
                            <span>Monthly Est:</span>
                            <span className="font-bold">₹{monthlyCost.toFixed(0)}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostCalculator;
