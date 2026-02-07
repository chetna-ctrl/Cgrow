import React, { useState, useEffect } from 'react';
import { Sun, Moon, CheckCircle, AlertTriangle, Droplets, Wind, Eye } from 'lucide-react';

const DailyRoutine = ({ onComplete }) => {
    // State to track completed tasks for today
    // In a real app, this would be persisted to localStorage or Supabase
    const [tasks, setTasks] = useState({
        am: {
            mist: false,
            blackout: false,
            visual: false
        },
        pm: {
            fan: false,
            rotation: false,
            mist_pm: false
        }
    });

    const currentHour = new Date().getHours();
    const isMorning = currentHour < 12; // Simple logic: AM vs PM focus

    const toggleTask = (period, task) => {
        setTasks(prev => ({
            ...prev,
            [period]: {
                ...prev[period],
                [task]: !prev[period][task]
            }
        }));
    };

    // Calculate progress
    const amTotal = Object.keys(tasks.am).length;
    const amDone = Object.values(tasks.am).filter(Boolean).length;
    const pmTotal = Object.keys(tasks.pm).length;
    const pmDone = Object.values(tasks.pm).filter(Boolean).length;

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" /> Daily Operator's Checklist
            </h3>

            <div className="space-y-6">
                {/* MORNING ROUTINE */}
                <div className={`p-5 rounded-2xl border transition-all ${isMorning ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                    <h4 className="flex justify-between items-center font-black text-amber-800 mb-4">
                        <span className="flex items-center gap-2"><Sun size={20} /> Morning Shift (AM)</span>
                        <span className="text-xs bg-white px-2 py-1 rounded-lg border border-amber-100">{amDone}/{amTotal} Done</span>
                    </h4>
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" checked={tasks.am.mist} onChange={() => toggleTask('am', 'mist')} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500" />
                            <div>
                                <span className={`font-bold text-sm block ${tasks.am.mist ? 'line-through text-slate-400' : 'text-slate-700'}`}>Mist all trays (Light Spray)</span>
                                <span className="text-xs text-slate-500 group-hover:text-emerald-600">Goal: Surface should be moist, not soaking.</span>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" checked={tasks.am.blackout} onChange={() => toggleTask('am', 'blackout')} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500" />
                            <div>
                                <span className={`font-bold text-sm block ${tasks.am.blackout ? 'line-through text-slate-400' : 'text-slate-700'}`}>Check Blackout Domes</span>
                                <span className="text-xs text-slate-500 group-hover:text-emerald-600">Only for trays less than 4 days old. No leaks!</span>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" checked={tasks.am.visual} onChange={() => toggleTask('am', 'visual')} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500" />
                            <div>
                                <span className={`font-bold text-sm block ${tasks.am.visual ? 'line-through text-slate-400' : 'text-slate-700'}`}>Visual Mold Inspection</span>
                                <span className="text-xs text-slate-500 group-hover:text-emerald-600">Look for "Spider Webs" (Mold) vs "White Hairs" (Roots).</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* EVENING ROUTINE */}
                <div className={`p-5 rounded-2xl border transition-all ${!isMorning ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                    <h4 className="flex justify-between items-center font-black text-indigo-800 mb-4">
                        <span className="flex items-center gap-2"><Moon size={20} /> Evening Shift (PM)</span>
                        <span className="text-xs bg-white px-2 py-1 rounded-lg border border-indigo-100">{pmDone}/{pmTotal} Done</span>
                    </h4>
                    <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" checked={tasks.pm.fan} onChange={() => toggleTask('pm', 'fan')} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500" />
                            <div>
                                <span className={`font-bold text-sm block ${tasks.pm.fan ? 'line-through text-slate-400' : 'text-slate-700'}`}>Fan Check (Airflow)</span>
                                <span className="text-xs text-slate-500 group-hover:text-indigo-600">Ensure gentle breeze on all trays.</span>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" checked={tasks.pm.rotation} onChange={() => toggleTask('pm', 'rotation')} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500" />
                            <div>
                                <span className={`font-bold text-sm block ${tasks.pm.rotation ? 'line-through text-slate-400' : 'text-slate-700'}`}>Rotate Trays (Even Light)</span>
                                <span className="text-xs text-slate-500 group-hover:text-indigo-600">Swap back trays with front trays.</span>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input type="checkbox" checked={tasks.pm.mist_pm} onChange={() => toggleTask('pm', 'mist_pm')} className="w-5 h-5 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500" />
                            <div>
                                <span className={`font-bold text-sm block ${tasks.pm.mist_pm ? 'line-through text-slate-400' : 'text-slate-700'}`}>Final Mist (If Dry)</span>
                                <span className="text-xs text-slate-500 group-hover:text-indigo-600">Only if soil feels dry. Don't overwater at night.</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyRoutine;
