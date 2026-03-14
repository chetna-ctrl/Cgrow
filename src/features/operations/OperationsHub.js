import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DailyTrackerPage from '../tracker/DailyTrackerPage';
import MicrogreensPage from '../microgreens/MicrogreensPage';
import HydroponicsPage from '../hydroponics/HydroponicsPage';
import SchedulerPage from '../../pages/SchedulerPage';
import {
    Clock,
    Sprout,
    Droplets,
    Bell,
    Layers,
    Activity
} from 'lucide-react';

const OperationsHub = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Derive active tab from URL path to support deep linking and fix white screen crashes
    const getTabFromPath = () => {
        const path = location.pathname;
        if (path.includes('/hydro')) return 'hydro';
        if (path.includes('/micro')) return 'micro';
        if (path.includes('/tasks')) return 'tasks';
        return 'tracker'; // default
    };

    const [activeTab, setActiveTab] = useState(getTabFromPath());

    // Sync tab state if URL changes externally
    useEffect(() => {
        setActiveTab(getTabFromPath());
    }, [location.pathname]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/ops/${tabId}`); // Update URL when tab clicked
    };

    const tabs = [
        { id: 'tracker', label: 'Daily Tracker', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'micro', label: 'Microgreens', icon: Sprout, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'hydro', label: 'Hydroponics', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'tasks', label: 'Operations', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' }
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* HUB HEADER */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operations Hub</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            Live Farm Monitoring & Daily Logs
                        </p>
                    </div>
                </div>

                {/* TAB SELECTOR */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />
                            {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white/50 rounded-[2rem] overflow-hidden">
                {activeTab === 'tracker' && <DailyTrackerPage />}
                {activeTab === 'micro' && <MicrogreensPage />}
                {activeTab === 'hydro' && <HydroponicsPage />}
                {activeTab === 'tasks' && <SchedulerPage />}
            </div>
        </div>
    );
};

export default OperationsHub;
