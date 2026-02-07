import { useState } from 'react';
import { calculateFarmHealth } from '../../utils/agriUtils';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import { AlertTriangle, CheckCircle, Activity, Wind, Droplets } from 'lucide-react';
import RemediationModal from '../../components/RemediationModal';
import { GrowthStages } from '../../components/AgriTechVisuals';

const HealthMeter = ({ latestLog, healthIndex, riskItems = [], dataAge, isStale }) => {
    const { t } = useBeginnerMode();
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Determine Source of Truth
    let score = 0;
    let reasons = [];
    let isAggregate = false;

    if (healthIndex !== undefined && healthIndex !== null) {
        score = healthIndex;
        isAggregate = true;
    } else if (latestLog) {
        const result = calculateFarmHealth(latestLog);
        score = result.score;
        reasons = result.reasons;
    } else {
        // No Data
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-full opacity-60">
                <Activity size={40} className="text-slate-300 mb-2" />
                <p className="text-slate-400 font-bold">Farm is Resting</p>
                <p className="text-xs text-slate-400">Ready for new sowing?</p>
            </div>
        );
    }

    // Color Logic (Muted if stale)
    const getColor = (s) => isStale ? 'text-slate-400' : (s >= 80 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500');
    const getBg = (s) => s >= 80 ? 'bg-emerald-50' : s >= 50 ? 'bg-amber-50' : 'bg-red-50';
    const getBorder = (s) => isStale ? 'border-slate-200 border-dashed' : (s >= 80 ? 'border-emerald-100' : s >= 50 ? 'border-amber-100' : 'border-red-100');

    return (
        <div className={`h-full bg-white p-6 rounded-[2rem] border-2 ${getBorder(score)} relative overflow-hidden group hover:shadow-xl transition-all duration-500`}>
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full ${getBg(score)} blur-3xl opacity-50`}></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">
                            {isAggregate ? t("Total Farm Health", "Integrated Health Index") : "System Health"}
                        </h3>
                        {isStale && (
                            <div className="px-3 py-1 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-slate-200 animate-pulse">
                                Ghost Mode (Estimating)
                            </div>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-6xl font-black tracking-tighter ${getColor(score)}`}>
                            {isNaN(score) ? '0' : score}
                        </span>
                        <span className="text-lg font-bold text-slate-300">/100</span>
                        {/* DATA AGE BADGE */}
                        {dataAge && (
                            <div className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 border ${isStale ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                <span>{isStale ? '⚠️' : '🕒'} {dataAge}</span>
                            </div>
                        )}
                        {/* MANUAL ESTIMATE BADGE */}
                        {latestLog && (!latestLog.ph && !latestLog.ec && latestLog.observation_tags) && (
                            <div className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center gap-1" title="Estimated based on visual observations">
                                <span>👁️ Est.</span>
                            </div>
                        )}
                    </div>
                </div>

                {isAggregate ? (
                    <div className="mt-4">
                        {riskItems.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attention Needed ({riskItems.length})</p>
                                {riskItems.slice(0, 3).map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedAlert({ reason: item.issue, value: item.score, context: item.name })}
                                        className="w-full text-left flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                                        <span className="text-xs font-bold text-slate-700 truncate flex-1">{item.name}</span>
                                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-slate-500 border border-slate-100 whitespace-nowrap">{item.issue}</span>
                                    </button>
                                ))}
                                {riskItems.length > 3 && (
                                    <p className="text-[10px] text-slate-400 text-center">+ {riskItems.length - 3} more issues</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-full text-emerald-500 shadow-sm"><CheckCircle size={16} /></div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-800">All Systems Nominal</p>
                                    <p className="text-[10px] text-emerald-600">Great job managing the farm!</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Single Log Advice (Legacy Fallback)
                    <div className="mt-4 bg-slate-50 p-4 rounded-2xl">
                        <p className="text-xs font-bold text-slate-600 mb-1">AI Diagnosis:</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {score >= 90 ? "Optimal conditions maintained." : reasons[0] || "Check vital signs."}
                        </p>
                    </div>
                )}

                {/* Subtle Growth Stage Indicator */}
                {!isAggregate && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Current Growth Stage</p>
                        <GrowthStages stage={score > 80 ? 3 : score > 50 ? 2 : 1} />
                    </div>
                )}
            </div>

            {/* Remediation Modal */}
            <RemediationModal
                isOpen={!!selectedAlert}
                onClose={() => setSelectedAlert(null)}
                alertType={selectedAlert?.reason || ''}
                value={selectedAlert?.value || 'Risk'}
                context={selectedAlert?.context || ''}
            />
        </div>
    );
};

export default HealthMeter;
