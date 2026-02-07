import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Wind, Beaker, AlertTriangle, Clock } from 'lucide-react';
import { useBeginnerMode } from '../context/BeginnerModeContext';
import RemediationModal from './RemediationModal';
import ScientificTooltip from './ScientificTooltip';

/**
 * ActiveCropHealth Component
 * Visualizes individual crop health, freshness, and specific stress factors.
 * 
 * @param {Object} props
 * @param {number} props.healthScore - 0 to 100
 * @param {string} props.lastLogDate - ISO Date string
 * @param {Object} props.details - { light: 'OK'|'WARN', air: 'OK'|'WARN'|'DANGER', nutrient: 'OK'|'WARN' }
 */
const ActiveCropHealth = ({ healthScore, lastLogDate, details, reasons, subType }) => {
    const { t } = useBeginnerMode();
    const [selectedAlert, setSelectedAlert] = useState(null);

    // 1. Freshness Check (24 Hours - Local Time Window)
    const isStale = () => {
        if (!lastLogDate) return true;

        // Robust Date Parsing
        const now = new Date();
        const logDate = new Date(lastLogDate);

        // Determine difference in hours
        const diffMs = now.getTime() - logDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // If logDate is in the future (timezone drift), assume fresh
        if (diffHours < 0) return false;

        return diffHours > 24;
    };

    const stale = isStale();

    // Helper for Status Dots
    const StatusIndicator = ({ status, icon: Icon, label, tooltipDef }) => {
        const color = status === 'OK' ? 'bg-green-500'
            : status === 'WARN' ? 'bg-orange-500'
                : 'bg-red-500';

        return (
            <div className="flex flex-col items-center gap-1 group relative z-10">
                <div className={`p-2 rounded-full bg-slate-100 border border-slate-200 ${status !== 'OK' ? 'animate-pulse' : ''} relative`}>
                    <Icon size={14} className="text-slate-600" />
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${color}`} />
                </div>
                {/* Text Label */}
                <div className="flex items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 whitespace-nowrap left-1/2 -translate-x-1/2">
                        {label}
                    </span>
                    {/* Tooltip Icon (Only if definition provided) */}
                    {tooltipDef && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ScientificTooltip term={label} definition={tooltipDef} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (stale) {
        return (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Clock size={20} className="text-slate-400" />
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase">Data Stale</h4>
                        <p className="text-[10px] text-slate-400">Log updated {lastLogDate ? new Date(lastLogDate).toLocaleDateString() : 'Never'}</p>
                    </div>
                </div>
                <Link to="/tracker" className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                    Update Now
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative overflow-visible">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        Live Health {subType && <span className="ml-1 text-[8px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{subType}</span>}
                        <span className="ml-auto flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-cyan-50 text-cyan-600 rounded font-black uppercase">
                            🧠 Smart Advisor
                        </span>
                    </h4>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${healthScore >= 80 ? 'text-emerald-600' : healthScore >= 50 ? 'text-orange-500' : 'text-red-600'}`}>
                            {healthScore}
                        </span>
                        <span className="text-xs font-bold text-slate-300">/100</span>
                        {/* MANUAL ESTIMATE BADGE */}
                        {details?.isManualEstimate && (
                            <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center gap-1" title="Estimated based on visual observations">
                                <span>👁️ Est.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicators */}
                <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                        <StatusIndicator
                            status={details?.light || 'OK'}
                            icon={Sun}
                            label={t("Light", "DLI")}
                            tooltipDef="Daily Light Integral: Total light energy received per day."
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <StatusIndicator
                            status={details?.air || 'OK'}
                            icon={Wind}
                            label={t("Air", "VPD")}
                            tooltipDef="Vapor Pressure Deficit: The 'thirst' of the air. Drives transpiration."
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <StatusIndicator
                            status={details?.nutrient || 'OK'}
                            icon={Beaker}
                            label={t("Food", "Nutrients")}
                            tooltipDef="EC/pH Balance: Availability of food for roots."
                        />
                    </div>
                </div>
            </div>

            {/* METABOLIC INSIGHTS (Smart Alerts) */}
            {reasons && reasons.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <AlertTriangle size={10} /> {t("Action Needed", "Metabolic Insights")}
                    </h5>
                    <div className="space-y-2">
                        {reasons.map((reason, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedAlert({ reason })}
                                className={`w-full text-left p-2 rounded-lg text-xs font-bold border flex items-start gap-2 hover:shadow-md transition-all active:scale-95 cursor-pointer ${reason.includes('CRITICAL') ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100' : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'}`}
                            >
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span className="leading-tight underlineDecoration-dashed underline-offset-2 border-b border-current border-dashed border-opacity-50">
                                    {reason} <span className="text-[9px] opacity-75 ml-1 font-normal">(Tap to fix)</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Remediation Modal */}
            <RemediationModal
                isOpen={!!selectedAlert}
                onClose={() => setSelectedAlert(null)}
                alertType={selectedAlert?.reason || ''}
                value="Critical"
                context={selectedAlert?.reason}
            />
        </div>
    );
};

export default ActiveCropHealth;
