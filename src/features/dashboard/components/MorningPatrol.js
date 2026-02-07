import React, { useMemo } from 'react';
import { CheckCircle, Droplets, Sun, Scissors, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MorningPatrol = ({ batches = [], systems = [], todayLogs = [] }) => {

    // Generate Tasks based on state
    const tasks = useMemo(() => {
        const list = [];
        const today = new Date().toDateString();

        // 1. Check Microgreens
        batches.forEach(batch => {
            if (batch.status === 'Harvested') return;

            // Check if logged today
            const hasLogged = todayLogs.some(log =>
                log.batch_id === batch.id && new Date(log.created_at).toDateString() === today
            );

            if (!hasLogged) {
                list.push({
                    id: batch.id,
                    title: `Check ${batch.crop}`,
                    subtitle: `Tray #${String(batch.id).slice(0, 4)} • ${batch.lifecycle_stage || 'Growing'}`,
                    type: 'log',
                    priority: 'high',
                    link: '/tracker',
                    icon: Droplets
                });
            }

            // Harvest alerts removed - they're shown in Priority Action card
        });

        // 2. Check Hydroponics
        systems.forEach(sys => {
            const hasLogged = todayLogs.some(log =>
                log.target_id === sys.id &&
                log.system_type === 'Hydroponics' &&
                new Date(log.created_at).toDateString() === today
            );

            if (!hasLogged) {
                list.push({
                    id: sys.id,
                    title: `Inspect System ${sys.name}`,
                    subtitle: `${sys.crop || 'Empty'} • Check pH/EC`,
                    type: 'log',
                    priority: 'high',
                    systemType: 'Hydroponics',
                    link: '/tracker',
                    icon: Droplets // or Activity
                });
            }
        });

        return list.sort((a, b) => (a.priority === 'critical' ? -1 : 1));
    }, [batches, systems, todayLogs]);

    if (tasks.length === 0) return (
        <div className="bg-emerald-500 text-white p-6 rounded-3xl mb-6 shadow-lg shadow-emerald-200 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-black">All Clear! 🎉</h2>
                <p className="opacity-90 font-medium">Morning patrol completed. Great job.</p>
            </div>
            <CheckCircle size={48} className="opacity-50" />
        </div>
    );

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Sun className="text-amber-500" size={24} />
                        Morning Patrol
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {tasks.length} Tasks Pending
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {tasks.slice(0, 5).map(task => ( // Show top 5
                    <Link
                        to="/tracker"
                        state={task.systemType === 'Hydroponics' ? { targetId: task.id } : { batchId: task.id }}
                        key={task.id}
                        className="block group"
                    >
                        <div className={`
                            flex items-center gap-4 p-4 rounded-2xl border transition-all
                            ${task.priority === 'critical'
                                ? 'bg-red-50 border-red-100 hover:border-red-300'
                                : 'bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-md'}
                        `}>
                            <div className={`
                                p-3 rounded-xl 
                                ${task.priority === 'critical' ? 'bg-red-200 text-red-700' : 'bg-white text-slate-600 shadow-sm'}
                            `}>
                                <task.icon size={20} />
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-bold ${task.priority === 'critical' ? 'text-red-900' : 'text-slate-700'}`}>
                                    {task.title}
                                </h3>
                                <p className={`text-xs font-medium ${task.priority === 'critical' ? 'text-red-700' : 'text-slate-500'}`}>
                                    {task.subtitle}
                                </p>
                            </div>

                            <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm text-xs font-bold text-slate-600 group-hover:scale-105 transition-transform">
                                {task.type === 'harvest' ? 'Harvest' : 'Start'}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MorningPatrol;
