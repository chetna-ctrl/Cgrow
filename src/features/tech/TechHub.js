import React, { useState } from 'react';
import FarmingGuidePage from '../guide/FarmingGuidePage';
import IoTDevicesPage from '../iot/IoTDevicesPage';
import PlantDoctor from './PlantDoctor';
import AITrainingHub from './AITrainingHub';
import {
    Cpu,
    BookOpen,
    Zap,
    Wrench,
    Binary,
    Activity
} from 'lucide-react';

const TechHub = () => {
    const [activeTab, setActiveTab] = useState('iot');

    const tabs = [
        { id: 'iot', label: 'IoT Devices', icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'doctor', label: 'Plant Doctor', icon: Activity, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
        { id: 'training', label: 'AI Training', icon: Binary, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'guide', label: 'Farming Wiki', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' }
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* HUB HEADER */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Cpu size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tech & Academy</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                            Hardware Config • Scientific Knowledge Base
                        </p>
                    </div>
                </div>

                {/* TAB SELECTOR */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full overflow-x-auto no-scrollbar pb-1">
                    <div className="flex items-center flex-nowrap min-w-max">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap mx-1 ${activeTab === tab.id
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
            </div>

            {/* TAB CONTENT */}
            <div className="bg-white/50 rounded-[2rem] overflow-hidden">
                {activeTab === 'iot' && <IoTDevicesPage />}
                {activeTab === 'doctor' && <PlantDoctor />}
                {activeTab === 'training' && <AITrainingHub />}
                {activeTab === 'guide' && <FarmingGuidePage />}
            </div>
        </div>
    );
};

export default TechHub;
