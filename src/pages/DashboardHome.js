import React, { useEffect, useState } from 'react';
import { Sprout, Droplets, Thermometer, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import StatCard from '../components/StatCard';
import ChartWidget from '../components/ChartWidget';

const DashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const [metrics, setMetrics] = useState({ focusItems: [], activeTrays: 0 });

    useEffect(() => {
        // Mock Data for "High Level" Visuals
        const mockItems = [
            { id: 1, title: 'Harvest Radish (Batch B-01)', type: 'Urgent', desc: 'Crop is 2 days overdue for harvest.' },
            { id: 2, title: 'Nutrient Check Required', type: 'Warning', desc: 'pH in System A dropped to 5.4.' },
            { id: 3, title: 'Market Opportunity', type: 'Info', desc: 'Basil prices up 15% in local mandi.' }
        ];
        setMetrics({ activeTrays: 12, focusItems: mockItems });
        setLoading(false);
    }, []);

    // Slide Logic
    const nextSlide = () => setSlideIndex((prev) => (prev + 1) % metrics.focusItems.length);

    if (loading) return <div className="text-center p-10 font-bold text-gray-400">Initializing Agri OS...</div>;

    const currentFocus = metrics.focusItems[slideIndex] || {};

    return (
        <div className="flex flex-col gap-8">

            {/* WELCOME SECTION */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-xl">Overview of your operations.</p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 px-5 py-2 rounded-full font-bold flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span> Live
                </div>
            </div>

            {/* SLIDING FOCUS BOX */}
            <div className="box-panel bg-gradient-to-br from-emerald-50 to-white relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm mb-2 block">
                            Priority Task ({slideIndex + 1}/{metrics.focusItems.length})
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3 transition-all">
                            {currentFocus.title}
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl">{currentFocus.desc}</p>
                    </div>
                    <button onClick={nextSlide} className="bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-transform hover:scale-110">
                        <ArrowRight size={24} />
                    </button>
                </div>

                {/* DOTS INDICATOR */}
                <div className="flex gap-3 mt-8">
                    {metrics.focusItems.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSlideIndex(idx)}
                            className={`h-3 rounded-full cursor-pointer transition-all duration-300 ${idx === slideIndex ? 'bg-emerald-500 w-10' : 'bg-gray-300 w-3'}`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* STAT BOXES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Active Batches" value={metrics.activeTrays} icon={Sprout} subtext="In Production" />
                <StatCard title="Avg Temp" value="24°C" icon={Thermometer} subtext="Greenhouse A" />
                <StatCard title="Humidity" value="62%" icon={Droplets} subtext="Optimal Range" />
                <StatCard title="Daily Yield" value="4.2 kg" icon={Activity} subtext="+12% vs Avg" />
            </div>

            {/* CHARTS ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="box-panel min-h-[400px]">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="text-emerald-500" /> Growth Analysis
                    </h3>
                    <ChartWidget title="" data={[{ name: 'Wk 1', value: 20 }, { name: 'Wk 2', value: 45 }, { name: 'Wk 3', value: 30 }, { name: 'Wk 4', value: 60 }]} />
                </div>

                <div className="box-panel min-h-[400px] flex flex-col justify-center items-center text-center">
                    <div className="p-6 bg-blue-50 rounded-full mb-4">
                        <Droplets size={48} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Water Efficiency</h3>
                    <p className="text-gray-500 text-lg">System is saving 140L/week compared to traditional farming.</p>
                </div>
            </div>

        </div>
    );
};

export default DashboardHome;
