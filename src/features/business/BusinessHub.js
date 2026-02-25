import React, { useState, lazy, Suspense } from 'react';

// Lazy loading sub-pages for performance
const SalesMarketingPage = lazy(() => import('../sales/SalesMarketingPage'));
const FinancePage = lazy(() => import('../finance/FinancePage'));
const MarketPage = lazy(() => import('../market/MarketPage'));
const CommercialPlanningPage = lazy(() => import('../dashboard/CommercialPlanningPage'));
const MicrogreensPlanningPage = lazy(() => import('../microgreens/MicrogreensPlanningPage'));
import {
    Briefcase,
    DollarSign,
    ShoppingBag,
    Globe,
    PieChart,
    Target
} from 'lucide-react';

const BusinessHub = () => {
    const [activeTab, setActiveTab] = useState('commercial');

    const tabs = [
        { id: 'commercial', label: 'Commercial Hub', icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'finance', label: 'Finance P&L', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'market', label: 'Market Intel', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'planners', label: 'Farm Planners', icon: PieChart, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* HUB HEADER */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 text-white">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Business Intelligence</h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                            Sales • Accounting • Market Trends • ROI
                        </p>
                    </div>
                </div>

                {/* TAB SELECTOR */}
                <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 w-full md:w-auto overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${activeTab === tab.id
                                ? `${tab.bg} text-slate-900 shadow-xl`
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-slate-500'} />
                            {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-transparent min-h-[400px]">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center p-20 bg-white/50 rounded-[2rem] border border-dashed border-slate-200 animate-pulse">
                        <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Module...</p>
                    </div>
                }>
                    {activeTab === 'commercial' && <SalesMarketingPage />}
                    {activeTab === 'finance' && <FinancePage />}
                    {activeTab === 'market' && <MarketPage />}
                    {activeTab === 'planners' && (
                        <div className="space-y-8">
                            <CommercialPlanningPage />
                            <div className="border-t border-slate-200 pt-8 mt-8">
                                <h2 className="text-xl font-black text-slate-800 mb-6 px-4">Deep-Dive Microgreens Planning</h2>
                                <MicrogreensPlanningPage />
                            </div>
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    );
};

export default BusinessHub;
