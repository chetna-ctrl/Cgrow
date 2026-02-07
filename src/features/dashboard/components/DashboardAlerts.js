/**
 * DashboardAlerts Component
 * Displays disease risks, smart alerts, and predictive warnings
 * Extracted from DashboardHome
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Info, TrendingUp } from 'lucide-react';
import Card from '../../../components/common/Card';

export const DashboardAlerts = ({
    diseaseRisks,
    hasRisks,
    highestRisk,
    smartAlerts,
    predictiveAlerts,
    loadingInsights
}) => {
    return (
        <>
            {/* DISEASE RISK ALERTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasRisks ? (
                    diseaseRisks.map((risk, idx) => (
                        <Card key={idx} className={`border-l-4 ${risk.risk === 'High' ? 'border-l-red-500 bg-red-50' :
                                risk.risk === 'Medium' ? 'border-l-amber-500 bg-amber-50' :
                                    'border-l-blue-500 bg-blue-50'
                            }`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${risk.risk === 'High' ? 'bg-red-100 text-red-600' :
                                        risk.risk === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                    }`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-sm ${risk.risk === 'High' ? 'text-red-700' :
                                            risk.risk === 'Medium' ? 'text-amber-700' :
                                                'text-blue-700'
                                        }`}>
                                        {risk.disease} - {risk.risk} Risk
                                        <span className="ml-2 group relative inline-block">
                                            <Info size={14} className="inline cursor-help opacity-60" />
                                            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                                <p className="font-bold border-b border-white/20 pb-1 mb-1">Scientific Theory: Disease Triangle</p>
                                                <p>Fungal/Bacterial outbreaks require three factors: a susceptible Host, a Pathogen, and a favorable Environment (High Humidity/Temp). Disrupting the environment stops the outbreak.</p>
                                            </div>
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-600 mt-1">{risk.symptoms}</p>
                                    <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                            <Shield size={12} /> Prevention:
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">{risk.prevention}</p>
                                    </div>
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${risk.urgency === 'Immediate' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {risk.urgency}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    !loadingInsights && (
                        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50 md:col-span-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-700">{highestRisk.status}</h3>
                                    <p className="text-sm text-slate-600">{highestRisk.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">Action: {highestRisk.action}</p>
                                </div>
                            </div>
                        </Card>
                    )
                )}

                {/* SCIENTIFIC INTELLIGENCE: Smart Alerts */}
                {smartAlerts.length > 0 && (
                    <Card className="border-l-4 border-l-red-500 bg-red-50 md:col-span-2">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-red-100 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-red-700 mb-2">Critical Alerts ({smartAlerts.length})</h3>
                                <div className="space-y-2">
                                    {smartAlerts.map((alert, idx) => (
                                        <div key={idx} className="bg-white/50 p-2 rounded text-xs">
                                            <p className="font-bold">{alert.title}</p>
                                            <p className="text-slate-600">{alert.immediate_action}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    to="/analytics"
                                    className="text-xs text-red-700 font-bold mt-2 inline-block hover:underline"
                                >
                                    View Full Analysis →
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* PREDICTIVE ALERTS */}
            {predictiveAlerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictiveAlerts.map((trend, idx) => (
                        <div key={idx} className="bg-orange-50 border-l-4 border-l-orange-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-800 text-sm">Early Warning: Trend Detected</h4>
                                <p className="text-xs text-orange-700 font-bold mt-1">{trend.message}</p>
                                <p className="text-[10px] text-orange-600 mt-1">Slope: {trend.slope} / day</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
