import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Map as MapIcon, Wrench, DollarSign, Activity, Info } from 'lucide-react';
import { generateFarmBlueprint } from '../utils/farmEngine';

const BlueprintReport = ({ length = 50, width = 30, climate = 'Delhi' }) => {
    const componentRef = useRef();
    const blueprint = generateFarmBlueprint(length, width, climate);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl border border-slate-200 my-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8 pb-4 border-bottom border-slate-100 no-print">
                <div>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Farm Blueprint Generator</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ready for Export</p>
                </div>
                <button
                    onClick={() => handlePrint()}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                    <Printer size={18} />
                    GENERATE PDF
                </button>
            </div>

            {/* Printable Area */}
            <div ref={componentRef} className="p-8 bg-white print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-6">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 leading-none mb-2">AGRI-OS BLUEPRINT</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Commercial Infrastructure Manual v1.0</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Project Dimensions</p>
                        <p className="text-2xl font-black text-slate-800">{length}ft × {width}ft</p>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{climate} Standard</p>
                    </div>
                </div>

                {/* Section 1: Engineering Specs */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-200 pb-2">
                            <Wrench size={20} className="text-indigo-600" />
                            <h3 className="font-black uppercase tracking-wider">Production Specs</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">System Type</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.production.system}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Total Plants</p>
                                <p className="text-sm font-black text-indigo-600 text-lg">{blueprint.production.totalPlants}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">DFT Pipes</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.production.totalPipes} (110mm)</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Slope REQ.</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.production.slope}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-slate-900 border-b border-slate-200 pb-2">
                            <Activity size={20} className="text-indigo-600" />
                            <h3 className="font-black uppercase tracking-wider">Cooling & Water</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Exhaust Fans</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.cooling.exhaustFans}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Cooling Pad</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.cooling.coolingPad}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Tank Size</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.waterSystem.minimumTankSize}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Chiller REQ.</p>
                                <p className="text-sm font-bold text-slate-700">{blueprint.waterSystem.chiller}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Installation Guide (The user's Part 2 & 4 logic merged) */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-12">
                    <div className="flex items-center gap-3 text-slate-900 mb-6 pb-2 border-b border-slate-200">
                        <MapIcon size={20} className="text-indigo-600" />
                        <h3 className="font-black uppercase tracking-wider">Installation & Manual Logic</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        {blueprint.installationManual.map((item, idx) => (
                            <div key={idx}>
                                <h4 className="text-xs font-black text-slate-900 uppercase mb-2 flex items-center gap-1">
                                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px]">{idx + 1}</span>
                                    {item.title}
                                </h4>
                                <ul className="space-y-1">
                                    {item.steps.map((step, sIdx) => (
                                        <li key={sIdx} className="text-[11px] leading-relaxed text-slate-600 font-medium">
                                            • {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3: Financial Estimation (Invoice & ROI) */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="border-2 border-slate-900 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 text-slate-900 mb-4">
                            <DollarSign size={20} className="text-indigo-600" />
                            <h3 className="font-black uppercase tracking-wider">Invoice Estimation (CAPEX)</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-500 uppercase tracking-tighter">Structure & Automation</span>
                                <span className="font-black text-slate-800">{formatCurrency(blueprint.economics.capexBreakdown.structure)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-500 uppercase tracking-tighter">Hydroponic Channels</span>
                                <span className="font-black text-slate-800">{formatCurrency(blueprint.economics.capexBreakdown.hydroponics)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="font-bold text-slate-500 uppercase tracking-tighter">Cooling & Electrical</span>
                                <span className="font-black text-slate-800">{formatCurrency(blueprint.economics.capexBreakdown.cooling)}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                                <span className="font-black text-slate-900 uppercase tracking-wider">TOTAL ESTIMATE</span>
                                <span className="text-xl font-black text-indigo-600">{formatCurrency(blueprint.economics.estimatedCapex)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-900 p-6 rounded-2xl text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity size={20} className="text-indigo-400" />
                            <h3 className="font-black uppercase tracking-wider">ROI Projection</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] font-black uppercase text-indigo-300">Annual Profit (Est.)</span>
                                <span className="text-xl font-black">{formatCurrency(blueprint.economics.roi.annualNetProfit)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                    <p className="text-[8px] font-black text-indigo-200 uppercase">Payback Period</p>
                                    <p className="text-lg font-black">{blueprint.economics.roi.paybackPeriod}</p>
                                </div>
                                <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                                    <p className="text-[8px] font-black text-indigo-200 uppercase">Avg. Monthly Rev</p>
                                    <p className="text-lg font-black">{formatCurrency(blueprint.economics.roi.annualRevenue / 12)}</p>
                                </div>
                            </div>
                            <p className="text-[9px] text-indigo-200 italic font-medium leading-tight opacity-70">
                                *ROI calculations based on 10 cycles/year for high-demand leafy greens (Lettuce/Basil).
                                Subject to management and local market rates.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Magic Note */}
                <div className="mt-12 pt-6 border-t border-slate-100 flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-full no-print">
                        <Info size={24} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Technical Safety Note</p>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-sm">
                            The "Magic" 2-inch outlet design is mandatory for power-failure survival.
                            Ensure all GI supports are rust-proofed before commissioning.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlueprintReport;
