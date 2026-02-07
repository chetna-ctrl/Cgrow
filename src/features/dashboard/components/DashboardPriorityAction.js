/**
 * DashboardPriorityAction Component
 * Displays the priority action card with 1-Tap OK button
 * Extracted from DashboardHome
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useBeginnerMode } from '../../../context/BeginnerModeContext';

export const DashboardPriorityAction = ({
    upcomingHarvests,
    on1TapOK
}) => {
    const { t } = useBeginnerMode();

    return (
        <div className="md:col-span-7 row-span-1">
            <div className="h-full min-h-[220px] bg-slate-900 rounded-3xl overflow-hidden relative shadow-xl shadow-slate-900/20">
                <div className="p-8 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="bg-slate-800 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
                            {t("Research Objective", "Operational Priority")}
                        </span>
                        <Clock className="text-slate-500" size={20} />
                    </div>

                    <div className="mt-4">
                        {upcomingHarvests.length > 0 ? (
                            <Link to={upcomingHarvests[0].itemType === 'hydroponics' ? '/hydroponics' : '/microgreens'} className="group block">
                                <h2 className="text-3xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-tight">
                                    {t("Harvest Ready!", `Harvest ${upcomingHarvests[0].crop}`)}
                                </h2>
                                <p className="text-slate-400 font-medium">
                                    {upcomingHarvests[0].crop} is peaking. Est. Sales: ₹{upcomingHarvests[0].estRevenue}
                                </p>
                            </Link>
                        ) : (
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                    {t("Farm is Stable", "No Critical Alerts")}
                                </h2>
                                <p className="text-slate-400 font-medium">Enjoy the peace. Your crops are growing strong.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <Link to="/tracker" className="w-max">
                            <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg w-full md:w-auto">
                                {t("Update Daily Log", "Daily Operations")} <ArrowRight size={18} />
                            </button>
                        </Link>

                        {/* 1-TAP OK BUTTON */}
                        <button
                            onClick={on1TapOK}
                            className="bg-transparent border border-slate-700 text-slate-400 px-6 py-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 w-max hover:bg-slate-800 hover:text-white transition-all w-full md:w-auto"
                        >
                            <CheckCircle size={16} /> {t("1-Tap OK: All Stable", "Quick Check: System Nominal")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
