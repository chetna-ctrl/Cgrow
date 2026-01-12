import React, { useState, useMemo } from 'react';
import {
    Calculator, TrendingUp, Hammer, Sprout, Leaf, Droplets,
    Settings, X, ChevronDown, ChevronUp, DollarSign, Activity, Settings2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const FinancePage = () => {
    // --- 1. STATE CONFIG ---
    const [farmingType, setFarmingType] = useState('hydroponics');
    const [area, setArea] = useState(1000);
    const [showSettings, setShowSettings] = useState(false);

    // Default Rates (Price per Sq.Ft or Monthly Unit)
    // We split into Hydro/Micro to allow specific editing
    const [hydroRates, setHydroRates] = useState({
        nftStands: 360,      // ₹360/sqft (~₹18k for 50sqft stand)
        pvcPipes: 70,        // ₹70/sqft
        plumbing: 45,
        automation: 25,
        climate: 60,
        civilWork: 30,
        labor: 15
    });

    const [microRates, setMicroRates] = useState({
        racks: 300,          // ₹300/sqft (~₹4500 for 15sqft rack)
        trays: 110,          // Trays & Domes (High density)
        growLights: 200,     // LED costs
        dehumidifiers: 40,   // Climate control
        workstations: 10,
        civilWork: 20,
        labor: 15
    });

    // OpEx Rates (Monthly)
    const [elecRate, setElecRate] = useState(8); // ₹/kWh
    const [waterRate, setWaterRate] = useState(0.05); // ₹/L
    const [rent, setRent] = useState(0);

    // --- 2. SWITCH LOGIC ---
    const currentRates = farmingType === 'hydroponics' ? hydroRates : microRates;
    const setRates = farmingType === 'hydroponics' ? setHydroRates : setMicroRates;

    const handleRateChange = (key, val) => {
        setRates(prev => ({ ...prev, [key]: Number(val) }));
    };

    // --- 3. CALCULATION ENGINE ---
    const data = useMemo(() => {
        // CAPEX
        const capexItems = Object.entries(currentRates).map(([key, rate]) => ({
            name: key.replace(/([A-Z])/g, ' $1').trim(), // camelCase to Normal
            rate: rate,
            total: rate * area
        }));
        const totalCapex = capexItems.reduce((acc, curr) => acc + curr.total, 0);

        // OPEX & REVENUE
        let opexItems = [];
        let revenue = 0;
        let production = 0; // Plants or Trays

        if (farmingType === 'hydroponics') {
            const plants = Math.floor(area / 50) * 200; // 200 plants per 50sqft
            production = plants;

            // OpEx Calcs
            const kwh = area * 0.6; // Est 0.6 units/sqft/mo
            const water = plants * 4; // 4L/plant

            opexItems = [
                { name: 'Electricity', value: kwh * elecRate },
                { name: 'Water', value: water * waterRate },
                { name: 'Nutrients', value: plants * 3.5 },
                { name: 'Labor', value: Math.ceil(area / 2000) * 12000 },
                { name: 'Packaging', value: plants * 1.5 },
                { name: 'Logistics', value: 3000 + area },
                { name: 'Rent', value: rent }
            ];
            revenue = plants * 45; // ₹45/plant
        } else {
            const trays = Math.floor(area / 15) * 20; // 20 trays per 15sqft
            production = trays;

            const kwh = area * 0.8;
            const water = trays * 15; // 15L/tray month (multiple cycles)

            opexItems = [
                { name: 'Electricity', value: kwh * elecRate },
                { name: 'Water', value: water * waterRate },
                { name: 'Media/Seeds', value: trays * 35 },
                { name: 'Labor', value: Math.ceil(area / 1500) * 12000 },
                { name: 'Packaging', value: trays * 20 },
                { name: 'Logistics', value: 4000 + area },
                { name: 'Rent', value: rent }
            ];
            revenue = trays * 300; // ₹300/tray
        }

        const totalOpex = opexItems.reduce((a, b) => a + b.value, 0);
        const netProfit = revenue - totalOpex;
        const roiMonths = netProfit > 0 ? (totalCapex / netProfit).toFixed(1) : '∞';
        const margin = (netProfit / revenue) * 100;

        // Break Even
        let breakEvenData = [];
        let cumRev = 0;
        let cumCost = totalCapex;
        for (let i = 0; i <= 24; i++) {
            breakEvenData.push({ month: `M${i}`, Revenue: cumRev, Cost: cumCost });
            cumRev += revenue;
            cumCost += totalOpex;
        }

        return {
            capexItems, opexItems, totalCapex, totalOpex,
            revenue, netProfit, roiMonths, margin, production, breakEvenData
        };

    }, [area, farmingType, currentRates, elecRate, waterRate, rent]);

    return (
        <div className="flex flex-col gap-6 pb-20">

            {/* --- SECTION A: HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Strategic Financial Planner</h1>
                    <p className="text-gray-500 mt-1">ROI Simulator & Cost Breakdown</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${showSettings ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border hover:bg-slate-50'}`}
                >
                    {showSettings ? <X size={18} /> : <Settings2 size={18} />}
                    {showSettings ? 'Close Settings' : 'Edit Price List'}
                </button>
            </div>

            {/* EDITABLE PRICE LIST PANEL */}
            {showSettings && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider flex items-center gap-2">
                            <Settings size={14} /> Variable Equipment Rates (₹ per Sq.Ft)
                        </h3>
                        <span className="text-xs text-blue-500 font-medium">Updates Real-time</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Object.keys(currentRates).map((key) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-gray-400 mb-1 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-2 top-2 text-gray-400 text-xs font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={currentRates[key]}
                                        onChange={(e) => handleRateChange(key, e.target.value)}
                                        className="w-full pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Electricity Rate (₹/kWh)</label>
                            <input type="number" value={elecRate} onChange={e => setElecRate(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Water Rate (₹/L)</label>
                            <input type="number" step="0.01" value={waterRate} onChange={e => setWaterRate(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded text-sm font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Monthly Rent (₹)</label>
                            <input type="number" value={rent} onChange={e => setRent(Number(e.target.value))} className="w-full p-2 bg-slate-50 border rounded text-sm font-bold" />
                        </div>
                    </div>
                </div>
            )}

            {/* --- SECTION B: INPUTS --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Total Farm Area (Sq.Ft)</label>
                    <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(Number(e.target.value))}
                        className="w-full text-3xl font-bold text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 outline-none py-1"
                    />
                    <p className="text-xs text-slate-400 mt-2">Recommended: Start with 1,000 sqft for commercial viability.</p>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Farming Model</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFarmingType('hydroponics')}
                            className={`flex-1 py-3 px-4 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all
                            ${farmingType === 'hydroponics' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Droplets size={18} /> Hydroponic NFT
                        </button>
                        <button
                            onClick={() => setFarmingType('microgreens')}
                            className={`flex-1 py-3 px-4 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all
                            ${farmingType === 'microgreens' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Sprout size={18} /> Vertical Microgreens
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SECTION C: KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500">
                    <span className="text-slate-400 text-xs font-bold uppercase">Projected Net Profit</span>
                    <div className="text-2xl font-bold text-slate-800 mt-1">₹{data.netProfit.toLocaleString()}</div>
                    <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded">Margin {data.margin.toFixed(0)}%</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <span className="text-slate-400 text-xs font-bold uppercase">ROI Period</span>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{data.roiMonths} Months</div>
                    <div className="mt-2 text-xs text-slate-400">Break-even time</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-purple-500">
                    <span className="text-slate-400 text-xs font-bold uppercase">Total Output</span>
                    <div className="text-2xl font-bold text-slate-800 mt-1">{data.production.toLocaleString()}</div>
                    <div className="mt-2 text-xs text-slate-400">{farmingType === 'hydroponics' ? 'Plants' : 'Trays'} / Cycle</div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500">
                    <span className="text-slate-400 text-xs font-bold uppercase">Gross Revenue</span>
                    <div className="text-2xl font-bold text-slate-800 mt-1">₹{data.revenue.toLocaleString()}</div>
                    <div className="mt-2 text-xs text-slate-400">Potential Sales</div>
                </div>
            </div>

            {/* --- SECTION D: DETAILED BREAKDOWN --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 1. CAPEX TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Hammer className="text-purple-500" size={20} /> Capital Expenditure
                        </h4>
                        <span className="text-xs font-bold bg-white border px-2 py-1 rounded text-slate-500">One-time Setup</span>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-bold text-slate-400 uppercase">
                                    <th className="pb-3 pl-2">Item Group</th>
                                    <th className="pb-3 text-right">Rate/SqFt</th>
                                    <th className="pb-3 pr-2 text-right">Total Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.capexItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 pl-2 font-medium text-slate-700 capitalize">{item.name}</td>
                                        <td className="py-3 text-right text-slate-400 font-mono text-xs">₹{item.rate}</td>
                                        <td className="py-3 pr-2 text-right font-bold text-slate-700 font-mono">₹{item.total.toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50">
                                    <td className="py-4 pl-2 font-bold text-slate-900">Total Setup Cost</td>
                                    <td></td>
                                    <td className="py-4 pr-2 text-right font-bold text-xl text-purple-600">₹{data.totalCapex.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. OPEX TABLE */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <DollarSign className="text-red-500" size={20} /> Operational Expenditure
                        </h4>
                        <span className="text-xs font-bold bg-white border px-2 py-1 rounded text-slate-500">Monthly Recurring</span>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs font-bold text-slate-400 uppercase">
                                    <th className="pb-3 pl-2">Expense Category</th>
                                    <th className="pb-3 pr-2 text-right">Monthly Est.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.opexItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 pl-2 font-medium text-slate-700 capitalize">{item.name}</td>
                                        <td className="py-3 pr-2 text-right font-bold text-slate-700 font-mono">₹{item.value.toLocaleString()}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50">
                                    <td className="py-4 pl-2 font-bold text-slate-900">Total Monthly OpEx</td>
                                    <td className="py-4 pr-2 text-right font-bold text-xl text-red-500">₹{data.totalOpex.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* --- SECTION E: CHART --- */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-500" /> Break-Even Analysis (0-24 Months)
                </h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer>
                        <AreaChart data={data.breakEvenData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false}
                                tickFormatter={(val) => `₹${val / 100000}L`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                formatter={(val) => `₹${val.toLocaleString()}`}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="Revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} name="Cumulative Earnings" />
                            <Area type="monotone" dataKey="Cost" stroke="#EF4444" fill="none" strokeWidth={3} strokeDasharray="5 5" name="Cumulative Cost" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 italic">
                * Assumptions based on standard Delhi NCR rates. Use the Settings panel to customize equipment and utility rates.
            </p>

        </div>
    );
};

export default FinancePage;
