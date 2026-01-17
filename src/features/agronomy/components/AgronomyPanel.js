import React, { useState, useEffect } from 'react';
import { Sprout, AlertTriangle, CheckCircle, Thermometer, Droplets, Activity, RefreshCw } from 'lucide-react';
import { calculateVPD, getVPDStatus, checkNutrientLockout } from '../utils/agronomyLogic';
import { getLatestConditions } from '../../../store/farmStore';
import '../../../components/StatsCard.css';

const AgronomyPanel = () => {
    // STATE: Real Data vs Mock
    const [conditions, setConditions] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = () => {
        setLoading(true);
        const latest = getLatestConditions();
        if (latest) {
            setConditions(latest);
        } else {
            // Fallback for empty state
            setConditions(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();

        // Listen for updates from other tabs/components
        window.addEventListener('AGRI_OS_UPDATE', loadData);
        return () => window.removeEventListener('AGRI_OS_UPDATE', loadData);
    }, []);

    if (loading) return <div>Loading Intelligence...</div>;

    // Use latest data OR defaults for display if nothing exists
    const temp = conditions ? conditions.temp : 25;
    const paddingHum = conditions ? conditions.humidity : 60; // We don't log humidity yet
    const ph = conditions ? conditions.ph : 6.0;

    // VPD Logic
    const vpd = calculateVPD(temp, paddingHum);
    const vpdStatus = getVPDStatus(vpd);

    // Lockout Logic
    const lockedNutrients = checkNutrientLockout(ph);

    // GDD Mock (Pending integration to batch start dates)
    const gddTarget = 1100;
    const gddCurrent = 450;
    const gddProgress = (gddCurrent / gddTarget) * 100;

    return (
        <div className="agronomy-panel" style={{ marginTop: '2rem' }}>
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                <Sprout className="text-primary" /> Agronomy Intelligence (Biological Layer)
                {!conditions && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">Simulation Mode (No Logs Found)</span>}
            </h2>

            {/* Live Data Badge */}
            {conditions && (
                <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-emerald-400 text-sm font-mono flex items-center gap-2">
                        <Activity size={14} />
                        Using Live Data from <strong>{conditions.source}</strong> ({new Date(conditions.timestamp).toLocaleTimeString()})
                    </span>
                    <button onClick={loadData} className="text-emerald-400 hover:text-white"><RefreshCw size={14} /></button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* 1. VPD GAUGE */}
                <div className="stats-card" style={{ borderLeft: `4px solid ${vpdStatus.color}` }}>
                    <div className="stats-header">
                        <span className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Droplets size={16} /> VPD (Plant Comfort)
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            <span>{temp}°C</span>
                            <span>{paddingHum}% RH</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
                            {vpd} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>kPa</span>
                        </div>
                        <div style={{ color: vpdStatus.color, fontWeight: 600 }}>{vpdStatus.status}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>"{vpdStatus.advice}"</div>
                    </div>
                </div>

                {/* 2. NUTRIENT LOCKOUT MONITOR */}
                <div className="stats-card">
                    <div className="stats-header">
                        <span className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={16} /> Nutrient Lockout Monitor
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>pH: {ph}</span>
                    </div>
                    <div style={{ margin: '1rem 0' }}>
                        {/* Visual pH Scale */}
                        <div className="w-full h-4 rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-blue-500 mb-2 relative">
                            <div
                                style={{ left: `${((ph - 4) / 5) * 100}%` }}
                                className="absolute -top-1 w-2 h-6 bg-white border border-slate-900 rounded shadow-lg transition-all"
                            ></div>
                        </div>

                        {lockedNutrients ? (
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.25rem' }}>
                                    <AlertTriangle size={16} /> Nutrient Blocked!
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>Plants cannot absorb: <strong>{lockedNutrients.join(', ')}</strong></div>
                            </div>
                        ) : (
                            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                                    <CheckCircle size={16} /> Optimal Uptake
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>All nutrients available.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. GDD TRACKER */}
                <div className="stats-card">
                    <div className="stats-header">
                        <span className="stats-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Thermometer size={16} /> GDD (Harvest Timer)
                        </span>
                        <span style={{ fontSize: '0.8rem' }}>Target: {gddTarget}</span>
                    </div>
                    <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>Accumulated Heat Units</span>
                            <span style={{ fontWeight: 600 }}>{gddCurrent}</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${gddProgress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}></div>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Est. Harvest: <strong>14 Days early</strong> due to high heat.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgronomyPanel;
