import React, { useState, useEffect, useMemo } from 'react';
import {
    Calculator, DollarSign, Settings, Save, RefreshCw,
    TrendingUp, AlertTriangle, Info, Package, ChevronRight,
    Leaf, Droplets, Wind, Sun, Sprout
} from 'lucide-react';

// --- CHEAT SHEET CONSTANTS ---
const MORTALITY_RATE = 0.15; // 15% Loss
const EFFICIENCY_FACTOR = 0.65; // Realism Factor (65% Usable Area)
const PLUMBING_BUFFER = 0.15; // 15% Extra for fittings/waste

// DEFAULT UNIT PRICES (In INR)
const DEFAULT_PRICES = {
    // CAPEX - INFRASTRUCTURE
    infrastructureCostSqFt: 250, // Flooring, Paint, Electrical, AC Prep
    acCost: 35000,               // Per 1.5 Ton AC

    // CAPEX - HYDROPONICS
    nftChannel: 850,       // per 12ft channel
    standFrame: 3500,      // per 12ft stand
    waterPump: 2500,       // Heavy duty
    reservoirTank: 6000,   // 500L
    plumbingKit: 3000,     // Pipes per stand
    growLights: 1200,      // per 20W tube
    automation: 15000,     // Controller

    // CAPEX - MICROGREENS
    rackCost: 4500,        // 4-layer wire rack
    trayCost: 120,         // 1020 Tray

    // OPEX
    electricityRate: 10,   // per unit
    laborSalary: 15000,    // per person
    seedsPerKg: 4000,      // Premium seeds
    nutrientSet: 1500,     // 5L Set
    mediaKg: 50,           // Cocopeat/Perlite
    rentPerSqft: 40,       // Commercial rent
    waterRate: 0.10,       // per liter

    // POWER (Watts)
    acWatts: 2000,         // 1.5 Ton AC Running Watts
    lightWatts: 20,        // LED Tube
    pumpWatts: 80,
    fanWatts: 60
};

const FinancePage = () => {
    // --- STATE ---
    const [businessType, setBusinessType] = useState('Hydroponics'); // 'Hydroponics' | 'Microgreens'
    const [prices, setPrices] = useState(DEFAULT_PRICES);
    const [showSettings, setShowSettings] = useState(false);

    // Farm Configuration
    const [config, setConfig] = useState({
        areaSqft: 1000,
        layers: 1,           // Vertical layers
        isIndoor: true,      // Needs lights & AC?
        cropType: 'Lettuce', // Hydro: Lettuce/Basil, Micro: Radish/Peas
        rentedSpace: false
    });

    // Load custom prices
    useEffect(() => {
        const savedPrices = localStorage.getItem('agri_os_unit_prices_v2');
        if (savedPrices) setPrices(JSON.parse(savedPrices));
    }, []);

    const savePrices = (newPrices) => {
        setPrices(newPrices);
        localStorage.setItem('agri_os_unit_prices_v2', JSON.stringify(newPrices));
        setShowSettings(false);
    };

    // --- ENGINE ---
    const calculation = useMemo(() => {
        // 1. Effective Area
        const effectiveArea = config.areaSqft * EFFICIENCY_FACTOR;

        // --- HYDROPONICS LOGIC ---
        if (businessType === 'Hydroponics') {
            // Dimensioning (NFT 12ft module)
            // Stand Footprint: 2ft x 12ft = 24sqft + Walkways = ~50sqft/stand allocation
            const standAllocation = 50;
            const maxStands = Math.floor(effectiveArea / standAllocation);
            const channelsPerStand = 8 * config.layers;
            const totalChannels = maxStands * channelsPerStand;
            const plantsPerChannel = 18;
            const totalCapacity = totalChannels * plantsPerChannel;

            // Mortality
            const sellablePlants = Math.floor(totalCapacity * (1 - MORTALITY_RATE));

            // CapEx
            const infraCost = config.areaSqft * prices.infrastructureCostSqFt; // General infra

            // Hardware
            const standsCost = maxStands * prices.standFrame;
            const channelsCost = totalChannels * prices.nftChannel;
            const plumbingBase = maxStands * prices.plumbingKit;
            const plumbingTotal = plumbingBase * (1 + PLUMBING_BUFFER); // 15% Buffer
            const reservoirCost = Math.ceil(maxStands / 5) * prices.reservoirTank;
            const pumpCost = Math.ceil(maxStands / 5) * prices.waterPump;
            const automationCost = prices.automation;

            const lightsCount = config.isIndoor ? (maxStands * config.layers * 2) : 0;
            const lightsCost = lightsCount * prices.growLights;

            // AC Calculation (Indoor Only)
            // Rule of thumb: 1 Ton (12000 BTU) per 400-500 sqft for grow room heat load + lights
            // Lights add heat. 3.41 BTU per Watt.
            // Let's use simple Area metric for now: 1 AC per 400sqft if indoor
            const acCount = config.isIndoor ? Math.ceil(config.areaSqft / 400) : 0;
            const acCapex = acCount * prices.acCost;

            const totalCapex = infraCost + standsCost + channelsCost + plumbingTotal + reservoirCost + pumpCost + automationCost + lightsCost + acCapex;

            // OpEx (Monthly)
            // Electricity: (Total Watts * Hours * 30 / 1000) * Rate
            // Lights: 12 hrs/day
            // Pumps: 24 hrs/day
            // AC: 16 hrs/day (cycles on/off)
            const kwhLights = (lightsCount * prices.lightWatts * 12 * 30) / 1000;
            const kwhPumps = (Math.ceil(maxStands / 5) * prices.pumpWatts * 24 * 30) / 1000;
            const kwhAC = (acCount * prices.acWatts * 16 * 30) / 1000;
            const electricityCost = (kwhLights + kwhPumps + kwhAC) * prices.electricityRate;

            const laborCount = Math.ceil(config.areaSqft / 1500);
            const laborCost = laborCount * prices.laborSalary;

            const nutrientCost = (totalCapacity / 1000) * 1.5 * prices.nutrientSet; // 1.5 sets per 1000 plants/mo
            const seedCost = totalCapacity * 1.05 * 0.08; // 5% extra seeds, approx 8 paisa per rockwool/seed
            const waterCost = config.areaSqft * 5 * prices.waterRate; // 5L per sqft per month
            const rentCost = config.rentedSpace ? (config.areaSqft * prices.rentPerSqft) : 0;

            const totalOpex = electricityCost + laborCost + nutrientCost + seedCost + waterCost + rentCost;

            // Revenue
            // Yield: Lettuce 200g
            const yieldPerPlant = 0.2; // kg
            const cyclesPerMonth = 0.8; // ~38-40 days
            const monthlyYield = sellablePlants * yieldPerPlant * cyclesPerMonth;

            const pricePerKg = config.cropType === 'Basil' ? 350 : 180; // Premium prices
            const monthlyRevenue = monthlyYield * pricePerKg;

            return {
                type: 'Hydroponics',
                capacity: totalCapacity,
                sellable: sellablePlants,
                units: 'Plants',
                capex: { infra: infraCost + acCapex, hardware: totalCapex - (infraCost + acCapex), total: totalCapex },
                opex: { electricity: electricityCost, labor: laborCost, inputs: nutrientCost + seedCost, total: totalOpex },
                revenue: monthlyRevenue,
                roi: ((monthlyRevenue - totalOpex) * 12 / totalCapex * 100).toFixed(1),
                breakEven: (totalCapex / (monthlyRevenue - totalOpex)).toFixed(1)
            };
        }

        // --- MICROGREENS LOGIC ---
        else {
            // Rack Footprint: 4ft x 2ft = 8sqft. With work area, allow 25sqft/rack
            const rackAllocation = 25;
            const maxRacks = Math.floor(effectiveArea / rackAllocation);
            const traysPerRack = 4 * 4; // 4 layers, 4 trays per layer (1020 size)
            const totalTraysCapacity = maxRacks * traysPerRack; // Holding capacity

            // Production Cycle: 7-10 days. 
            // Trays produced per month = Capacity * (30 / 9 avg days)
            const cyclesPerMonth = 3.5;
            const totalTraysPerMonth = totalTraysCapacity * cyclesPerMonth;

            const sellableTrays = Math.floor(totalTraysPerMonth * (1 - 0.05)); // Less mortality in Micros if managed well, but lets use 5%

            // CapEx
            const infraCost = config.areaSqft * prices.infrastructureCostSqFt; // Flooring, fans, Dehumidifier prep

            const racksCost = maxRacks * prices.rackCost;
            const traysCost = totalTraysCapacity * 2 * prices.trayCost; // 2 sets of trays for rotation

            const lightsCount = maxRacks * 4 * 2; // 2 lights per layer, 4 layers
            const lightsCost = lightsCount * prices.growLights;

            // AC/Dehumidifier critical for Micros
            const acCount = Math.ceil(config.areaSqft / 300); // Higher cooling/drying load
            const acCapex = acCount * prices.acCost;

            const totalCapex = infraCost + racksCost + traysCost + lightsCost + acCapex;

            // OpEx
            const kwhLights = (lightsCount * prices.lightWatts * 14 * 30) / 1000; // 14 hrs
            const kwhAC = (acCount * prices.acWatts * 18 * 30) / 1000;
            const electricityCost = (kwhLights + kwhAC) * prices.electricityRate;

            const laborCost = Math.ceil(config.areaSqft / 1000) * prices.laborSalary; // More labor intensive

            const seedCost = sellableTrays * 15; // Rs 15 seeds per tray
            const mediaCost = sellableTrays * 10; // Rs 10 coco per tray
            const rentCost = config.rentedSpace ? (config.areaSqft * prices.rentPerSqft) : 0;

            const totalOpex = electricityCost + laborCost + seedCost + mediaCost + rentCost;

            // Revenue
            const pricePerTray = 120; // Wholesale avg
            const monthlyRevenue = sellableTrays * pricePerTray;

            return {
                type: 'Microgreens',
                capacity: totalTraysCapacity, // Spot capacity
                sellable: sellableTrays, // Monthly Production
                units: 'Trays/mo',
                capex: { infra: infraCost + acCapex, hardware: totalCapex - (infraCost + acCapex), total: totalCapex },
                opex: { electricity: electricityCost, labor: laborCost, inputs: seedCost + mediaCost, total: totalOpex },
                revenue: monthlyRevenue,
                roi: ((monthlyRevenue - totalOpex) * 12 / totalCapex * 100).toFixed(1),
                breakEven: (totalCapex / (monthlyRevenue - totalOpex)).toFixed(1)
            };
        }

    }, [config, prices, businessType]);


    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        Agri-OS Feasibility Engine v2.0
                    </h1>
                    <p className="text-slate-500 text-sm">Strict Agricultural Metrics • 65% Efficiency • Mortality-Adjusted</p>
                </div>

                <div className="flex gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setBusinessType('Hydroponics')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${businessType === 'Hydroponics' ? 'bg-white text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-cyan-600'}`}
                        >
                            <Droplets size={16} className="inline mr-1" /> Hydroponics
                        </button>
                        <button
                            onClick={() => setBusinessType('Microgreens')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${businessType === 'Microgreens' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
                        >
                            <Sprout size={16} className="inline mr-1" /> Microgreens
                        </button>
                    </div>

                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-200"
                    >
                        <Settings size={18} /> Prices
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. INPUTS */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Calculator size={20} className="text-emerald-500" /> Farm Specs
                        </h2>

                        <div className="space-y-4">
                            {/* Area */}
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm font-semibold text-slate-600">Total Floor Area</label>
                                    <span className="text-emerald-600 font-bold">{config.areaSqft} sqft</span>
                                </div>
                                <input
                                    type="range" min="100" max="10000" step="100"
                                    value={config.areaSqft}
                                    onChange={(e) => setConfig({ ...config, areaSqft: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">Efficiency Factor: {EFFICIENCY_FACTOR * 100}% (Active: {(config.areaSqft * EFFICIENCY_FACTOR).toFixed(0)} sqft)</p>
                            </div>

                            {/* Layers */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Vertical Layers</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setConfig({ ...config, layers: n })}
                                            className={`flex-1 py-2 rounded-lg font-bold transition-all ${config.layers === n ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Crop */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Primary Crop</label>
                                <select
                                    value={config.cropType}
                                    onChange={(e) => setConfig({ ...config, cropType: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {businessType === 'Hydroponics' ? (
                                        <>
                                            <option value="Lettuce">🥬 Lettuce (₹180/kg)</option>
                                            <option value="Basil">🌿 Basil (₹350/kg)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Radish">🔴 Radish (₹120/tray)</option>
                                            <option value="Sunflower">🌻 Sunflower (₹150/tray)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-lg flex-1 border border-transparent hover:border-slate-200 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={config.isIndoor}
                                        onChange={(e) => setConfig({ ...config, isIndoor: e.target.checked })}
                                        className="w-5 h-5 accent-emerald-500 rounded"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Indoor + AC</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 rounded-lg flex-1 border border-transparent hover:border-slate-200 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={config.rentedSpace}
                                        onChange={(e) => setConfig({ ...config, rentedSpace: e.target.checked })}
                                        className="w-5 h-5 accent-emerald-500 rounded"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Rented</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. RESULTS */}
                <div className="lg:col-span-2 space-y-6">

                    {/* FINANCIAL CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CAPEX */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                            <div className="relative z-10">
                                <h3 className="text-blue-900 font-bold flex items-center gap-2 mb-2">
                                    <Package size={20} /> Total CapEx
                                </h3>
                                <div className="text-3xl font-black text-blue-700">
                                    ₹{(calculation.capex.total / 100000).toFixed(2)} Lakh
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-blue-50 pb-1">
                                        <span className="text-slate-600">Infrastructure (AC/Flooring)</span>
                                        <span className="font-bold text-slate-800">₹{(calculation.capex.infra / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="flex justify-between border-b border-blue-50 pb-1">
                                        <span className="text-slate-600">Hardware & Automation</span>
                                        <span className="font-bold text-slate-800">₹{(calculation.capex.hardware / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="text-xs text-blue-400 mt-2 italic">*Includes 15% plumbing buffer</div>
                                </div>
                            </div>
                        </div>

                        {/* REVENUE */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                            <div className="relative z-10">
                                <h3 className="text-emerald-900 font-bold flex items-center gap-2 mb-2">
                                    <TrendingUp size={20} /> Monthly Profit
                                </h3>
                                <div className="text-3xl font-black text-emerald-600">
                                    ₹{Math.floor((calculation.revenue - calculation.opex.total) / 1000).toLocaleString()}k
                                </div>
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="flex justify-between border-b border-emerald-50 pb-1">
                                        <span className="text-slate-600">Revenue (Post-Mortality)</span>
                                        <span className="font-bold text-emerald-700">₹{(calculation.revenue / 1000).toFixed(1)}k</span>
                                    </div>
                                    <div className="flex justify-between border-b border-emerald-50 pb-1">
                                        <span className="text-slate-600">OpEx (Power/Labor)</span>
                                        <span className="font-bold text-red-600">- ₹{(calculation.opex.total / 1000).toFixed(1)}k</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DETAILED METRICS TABLE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Detailed Feasibility Report</h3>
                            <span className="text-xs font-bold px-2 py-1 bg-white border rounded text-slate-500">{businessType} Model</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Total Capacity</p>
                                <p className="text-xl font-bold text-slate-800">{calculation.capacity.toLocaleString()}</p>
                                <p className="text-xs text-slate-400">{calculation.units}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold text-emerald-600">Sellable Yield</p>
                                <p className="text-xl font-bold text-emerald-600">{calculation.sellable.toLocaleString()}</p>
                                <p className="text-xs text-emerald-600/70">After {MORTALITY_RATE * 100}% Loss</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Break Even</p>
                                <p className="text-xl font-bold text-orange-600">{calculation.breakEven} Mo</p>
                                <p className="text-xs text-slate-400">ROI: {calculation.roi}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold">Electricity</p>
                                <p className="text-xl font-bold text-slate-800">₹{(calculation.opex.electricity).toLocaleString()}</p>
                                <p className="text-xs text-slate-400">monthly bill</p>
                            </div>
                        </div>
                    </div>

                    {/* FORMULA REFERENCE FOOTER */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
                        <p className="font-bold text-slate-700">Calculation Basis:</p>
                        <p>• Effective Area = Total Area × {EFFICIENCY_FACTOR} (Walkways/Reservoirs/Storage)</p>
                        <p>• CapEx = Infrastructure (₹{prices.infrastructureCostSqFt}/sqft) + Hardware + AC + 15% Plumbing Buffer</p>
                        <p>• OpEx Electricity = (AcWatts + LightWatts) × Hours × Rate (Includes Thermal Load)</p>
                        <p>• Revenue = Sellable Yield × Market Price (adjusted for {MORTALITY_RATE * 100}% mortality rate)</p>
                    </div>

                </div>
            </div>

            {/* SETTINGS MODAL */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
                            <h2 className="text-xl font-bold text-slate-800">Unit Price Configuration</h2>
                            <button onClick={() => setShowSettings(false)}>✕</button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* GENERAL INFRA */}
                            <div>
                                <h3 className="font-bold text-slate-900 border-b pb-2 mb-3">General Infrastructure</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="text-sm text-slate-600">
                                        Infra Cost (per sqft)
                                        <input type="number" className="w-full border rounded p-2 mt-1" value={prices.infrastructureCostSqFt} onChange={(e) => setPrices({ ...prices, infrastructureCostSqFt: parseFloat(e.target.value) })} />
                                    </label>
                                    <label className="text-sm text-slate-600">
                                        AC Unit Cost (1.5 Ton)
                                        <input type="number" className="w-full border rounded p-2 mt-1" value={prices.acCost} onChange={(e) => setPrices({ ...prices, acCost: parseFloat(e.target.value) })} />
                                    </label>
                                    <label className="text-sm text-slate-600">
                                        Electricity Rate (₹/unit)
                                        <input type="number" className="w-full border rounded p-2 mt-1" value={prices.electricityRate} onChange={(e) => setPrices({ ...prices, electricityRate: parseFloat(e.target.value) })} />
                                    </label>
                                </div>
                            </div>

                            {/* HYDROPONICS */}
                            {businessType === 'Hydroponics' && (
                                <div>
                                    <h3 className="font-bold text-cyan-700 border-b pb-2 mb-3">Hydroponics Hardware</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="text-sm text-slate-600">NFT Channel (12ft)<input type="number" className="w-full border rounded p-2 mt-1" value={prices.nftChannel} onChange={(e) => setPrices({ ...prices, nftChannel: parseFloat(e.target.value) })} /></label>
                                        <label className="text-sm text-slate-600">Stand Frame<input type="number" className="w-full border rounded p-2 mt-1" value={prices.standFrame} onChange={(e) => setPrices({ ...prices, standFrame: parseFloat(e.target.value) })} /></label>
                                        <label className="text-sm text-slate-600">Automation Unit<input type="number" className="w-full border rounded p-2 mt-1" value={prices.automation} onChange={(e) => setPrices({ ...prices, automation: parseFloat(e.target.value) })} /></label>
                                    </div>
                                </div>
                            )}

                            {/* MICROGREENS */}
                            {businessType === 'Microgreens' && (
                                <div>
                                    <h3 className="font-bold text-emerald-700 border-b pb-2 mb-3">Microgreens Hardware</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="text-sm text-slate-600">Wire Rack Cost<input type="number" className="w-full border rounded p-2 mt-1" value={prices.rackCost} onChange={(e) => setPrices({ ...prices, rackCost: parseFloat(e.target.value) })} /></label>
                                        <label className="text-sm text-slate-600">Tray Cost (1020)<input type="number" className="w-full border rounded p-2 mt-1" value={prices.trayCost} onChange={(e) => setPrices({ ...prices, trayCost: parseFloat(e.target.value) })} /></label>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setPrices(DEFAULT_PRICES)} className="text-slate-500">Reset Defaults</button>
                                <button onClick={() => savePrices(prices)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold">Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
