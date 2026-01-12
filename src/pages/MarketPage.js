import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const MarketPage = () => {

    // ALGORITHM: Price Volatility Simulator
    const marketData = useMemo(() => {
        const crops = ['Radish', 'Sunflower', 'Peas', 'Broccoli', 'Basil', 'Lettuce'];
        return crops.map(crop => {
            const basePrice = Math.floor(Math.random() * 200) + 100;
            const volatility = Math.random() * 20 - 10; // -10 to +10 change
            return {
                name: crop,
                price: basePrice,
                change: volatility.toFixed(1),
                trend: volatility > 0 ? 'up' : 'down'
            };
        });
    }, []); // Runs once on mount (or link to real API later)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketData.map((item) => (
                    <div key={item.name} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-600 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                                <p className="text-xs text-slate-500">Mandi: Azadpur</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {item.change}%
                            </span>
                        </div>

                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">₹{item.price}</span>
                            <span className="text-sm text-slate-500">/ kg</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-xs text-slate-400">Forecast (7d)</span>
                            {item.trend === 'up' ? (
                                <TrendingUp size={16} className="text-emerald-500" />
                            ) : (
                                <TrendingDown size={16} className="text-red-500" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI INSIGHT WIDGET */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl">
                <h3 className="text-indigo-400 font-bold mb-2">🤖 AI Selling Strategy</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                    Based on current market volatility, <strong>Sunflower Microgreens</strong> are showing a <span className="text-emerald-400 font-bold">+8%</span> upward trend due to wedding season demand. Recommend increasing production cycles by 15% for next week.
                </p>
            </div>
        </div>
    );
};

export default MarketPage;
