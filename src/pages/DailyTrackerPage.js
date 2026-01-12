import React, { useState, useEffect } from 'react';
import {
    Save,
    AlertTriangle,
    CheckCircle,
    Droplets,
    Activity,
    Thermometer,
    Clock,
    TestTube,
    FileText
} from 'lucide-react';

import { supabase } from '../lib/supabaseClient';
import { checkNutrientLockout } from '../utils/AgronomyLogic';
import { notifyUpdates } from '../utils/farmStore';

const DailyTrackerPage = () => {

    /* ================= TARGETS ================= */
    const [targets, setTargets] = useState([]);

    useEffect(() => {
        const hydro = JSON.parse(localStorage.getItem('agri_os_hydro_systems') || '[]');
        const micro = JSON.parse(localStorage.getItem('agri_os_microgreens') || '[]');

        setTargets([
            ...hydro.map(s => ({
                id: s.id,
                type: 'Hydroponics',
                name: `${s.id} (${s.crop})`
            })),
            ...micro
                .filter(b => b.status === 'Growing')
                .map(b => ({
                    id: b.id,
                    type: 'Microgreens',
                    name: `Batch ${b.id} (${b.crop})`
                }))
        ]);
    }, []);

    /* ================= FORM ================= */
    const [entry, setEntry] = useState({
        targetId: '',
        targetType: '',
        ph: '',
        ec: '',
        temp: '',
        waterAdded: '',
        notes: ''
    });

    /* ================= ALERTS ================= */
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const list = [];

        if (entry.ph) {
            const ph = parseFloat(entry.ph);
            const blocked = checkNutrientLockout(ph);

            if (blocked) {
                list.push({ type: 'danger', msg: `Lockout risk: ${blocked.join(', ')}` });
            } else if (ph < 5.5 || ph > 6.5) {
                list.push({ type: 'warning', msg: 'pH outside optimal range (5.5–6.5)' });
            } else {
                list.push({ type: 'success', msg: 'pH optimal for uptake' });
            }
        }

        if (entry.ec) {
            const ec = parseFloat(entry.ec);
            if (ec > 2.5) list.push({ type: 'danger', msg: 'EC too high (burn risk)' });
            else if (ec < 0.8) list.push({ type: 'warning', msg: 'EC too low (plants hungry)' });
        }

        setAlerts(list);
    }, [entry.ph, entry.ec]);

    /* ================= SAVE TO SUPABASE ================= */
    const handleSave = async (e) => {
        e.preventDefault();

        const { error } = await supabase
            .from('daily_logs')
            .insert([
                {
                    system_id: entry.targetId,
                    ph: entry.ph ? Number(entry.ph) : null,
                    ec: entry.ec ? Number(entry.ec) : null,
                    temp: entry.temp ? Number(entry.temp) : null,
                    notes: entry.notes,
                    status: entry.targetType
                }
            ]);

        if (error) {
            alert('Error saving log: ' + error.message);
            return;
        }

        notifyUpdates();

        setEntry({
            targetId: '',
            targetType: '',
            ph: '',
            ec: '',
            temp: '',
            waterAdded: '',
            notes: ''
        });

        alert('Daily log saved to Supabase ✅');
    };

    /* ================= JSX ================= */
    return (
        <div>
            {/* Page Header */}
            <div className="page-header flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                    <Clock size={32} />
                </div>
                <div>
                    <h1 className="page-title">Daily Farm Tracker</h1>
                    <p className="text-slate-500">Log updated metrics for your crops.</p>
                </div>
            </div>

            {/* FORM: GRID LAYOUT */}
            <form onSubmit={handleSave} className="tracker-form">

                {/* Target - Full Width */}
                <div className="form-group form-full-width">
                    <label>Target System / Batch</label>
                    <select
                        required
                        className="form-select"
                        value={entry.targetId}
                        onChange={(e) => {
                            const selected = targets.find(t => t.id === e.target.value);
                            setEntry({
                                ...entry,
                                targetId: selected?.id || '',
                                targetType: selected?.type || ''
                            });
                        }}
                    >
                        <option value="">Select System...</option>
                        {targets.map(t => (
                            <option key={t.id} value={t.id}>{t.type}: {t.name}</option>
                        ))}
                    </select>
                </div>

                {/* pH */}
                <div className="form-group">
                    <label>pH Level</label>
                    <input
                        type="number" step="0.1"
                        placeholder="e.g. 6.0"
                        className="form-input"
                        value={entry.ph}
                        onChange={(e) => setEntry({ ...entry, ph: e.target.value })}
                    />
                </div>

                {/* EC */}
                <div className="form-group">
                    <label>EC (mS/cm)</label>
                    <input
                        type="number" step="0.1"
                        placeholder="e.g. 1.8"
                        className="form-input"
                        value={entry.ec}
                        onChange={(e) => setEntry({ ...entry, ec: e.target.value })}
                    />
                </div>

                {/* Temp */}
                <div className="form-group">
                    <label>Water Temp (°C)</label>
                    <input
                        type="number" step="0.1"
                        placeholder="e.g. 21"
                        className="form-input"
                        value={entry.temp}
                        onChange={(e) => setEntry({ ...entry, temp: e.target.value })}
                    />
                </div>

                {/* Water Added */}
                <div className="form-group">
                    <label>Water Added (L)</label>
                    <input
                        type="number" step="1"
                        placeholder="e.g. 50"
                        className="form-input"
                        value={entry.waterAdded || ''}
                        onChange={(e) => setEntry({ ...entry, waterAdded: e.target.value })}
                    />
                </div>

                {/* Notes - Full Width */}
                <div className="form-group form-full-width">
                    <label>Observations / Notes</label>
                    <textarea
                        placeholder="Leaf yellowing observed? Added nutrients?"
                        className="form-textarea"
                        value={entry.notes}
                        onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                        rows="3"
                    />
                </div>

                {/* Submit - Full Width */}
                <div className="form-full-width pt-2">
                    <button type="submit" className="btn-primary w-full">
                        <Save size={20} /> Save Daily Log
                    </button>
                </div>
            </form>

            {/* ALERTS SECTION */}
            {alerts.length > 0 && (
                <div className="space-y-3 mt-6 max-w-[800px]">
                    {alerts.map((a, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-xl border flex items-center gap-3 ${a.type === 'danger'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : a.type === 'warning'
                                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}
                        >
                            {a.type === 'danger' ? <AlertTriangle className="text-red-500" /> : <CheckCircle className="text-emerald-500" />}
                            <span className="font-medium text-sm">{a.msg}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DailyTrackerPage;
