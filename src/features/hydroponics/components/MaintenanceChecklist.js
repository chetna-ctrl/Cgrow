import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertTriangle, Droplets, Wind, Activity, CheckCircle, Clock } from 'lucide-react';
import { SYSTEM_TYPES } from '../../../data/hydroponicCrops';

const MaintenanceChecklist = ({ systemType, onComplete, systemAgeDays }) => {
    const [checked, setChecked] = useState({});

    // Dynamic Tasks based on System Type
    const getTasks = () => {
        const baseTasks = [
            { id: 'ph', text: 'Check pH (Target 5.5 - 6.5)', icon: <Activity size={14} /> },
            { id: 'ec', text: 'Check EC (Target 1.2 - 1.8)', icon: <Activity size={14} /> },
            { id: 'leaks', text: 'Visual check for leaks', icon: <Droplets size={14} /> }
        ];

        // 🧠 Smart Reminder: Flush every 14 days
        // If systemAgeDays is provided (real prop), use it. Else assume "Check due".
        const daysSinceFlush = systemAgeDays ? systemAgeDays % 14 : 0;
        const flushDueIn = 14 - daysSinceFlush;

        // FLUSH LOGIC
        if (flushDueIn <= 0 || flushDueIn === 14) {
            baseTasks.push({
                id: 'flush',
                text: '🚨 FLUSH DAY: Drain tank & Refill nutrients',
                icon: <CheckCircle size={14} />,
                urgent: true
            });
        } else {
            // Optional: Show countdown
            // baseTasks.push({ id: 'countdown', text: `Flush due in ${flushDueIn} days`, icon: <Clock size={14} />, info: true });
        }

        switch (systemType) {
            case 'NFT':
                return [
                    { id: 'flow', text: 'CRITICAL: Check Pump Flow (No clogging)', icon: <Wind size={14} />, urgent: true },
                    { id: 'roots', text: 'Check Roots (White = Good)', icon: <Activity size={14} /> },
                    ...baseTasks
                ];
            case 'DWC':
                return [
                    { id: 'bubbles', text: 'CRITICAL: Check Air Stones Bubbling', icon: <Wind size={14} />, urgent: true },
                    { id: 'level', text: 'Check Water Level (Touch Net Pot)', icon: <Droplets size={14} /> },
                    ...baseTasks
                ];
            case 'Drip':
            case 'Dutch Bucket':
                return [
                    { id: 'clogs', text: 'Check Drippers for clogs', icon: <AlertTriangle size={14} />, urgent: true },
                    { id: 'runoff', text: 'Check Runoff (~20%)', icon: <Droplets size={14} /> },
                    ...baseTasks
                ];
            default:
                return baseTasks;
        }
    };

    const tasks = getTasks();
    const allChecked = tasks.filter(t => !t.info).every(t => checked[t.id]);
    const progress = Math.round((Object.values(checked).filter(Boolean).length / tasks.filter(t => !t.info).length) * 100) || 0;

    const handleCheck = (id) => {
        const newChecked = { ...checked, [id]: !checked[id] };
        setChecked(newChecked);
        if (onComplete && Object.keys(newChecked).filter(k => newChecked[k]).length === tasks.filter(t => !t.info).length) {
            onComplete(true);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <CheckSquare size={18} className="text-cyan-600" />
                    Daily Operations
                </h4>
                <div className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-500">
                    {progress}% Done
                </div>
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <label key={task.id} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${checked[task.id] ? 'bg-emerald-50 text-emerald-700 decoration-emerald-500' : 'hover:bg-slate-50'} ${task.info ? 'cursor-default hover:bg-white' : ''}`}>
                        {!task.info && (
                            <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={!!checked[task.id]}
                                    onChange={() => handleCheck(task.id)}
                                    className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                />
                            </div>
                        )}
                        <div className={`text-sm font-medium ${task.urgent ? 'text-red-600 font-bold' : task.info ? 'text-slate-400 text-xs italic' : 'text-slate-600'} ${checked[task.id] && !task.info ? 'line-through opacity-70' : ''}`}>
                            {task.text}
                        </div>
                    </label>
                ))}
            </div>
            {allChecked && (
                <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 animate-pulse border border-emerald-100">
                    <CheckCircle size={14} />  All systems nominal! Good job.
                </div>
            )}
        </div>
    );
};

export default MaintenanceChecklist;
