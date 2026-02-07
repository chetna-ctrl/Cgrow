import React from 'react';
import { X, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const RemediationModal = ({ isOpen, onClose, alertType, value, context }) => {
    if (!isOpen) return null;

    // Remediation Database (Knowledge Base)
    // Keys match keywords found in alert strings
    const remediationStart = {
        'VPD': {
            title: 'Vapor Pressure Deficit (VPD) Issue',
            what: `Your VPD is ${value}, which means the air is ${context?.includes('High') ? 'too dry' : 'too humid'}.`,
            why: context?.includes('High')
                ? 'Plants are sweating too much (stress). Growth stops.'
                : 'Air is stagnant. Risk of mold and fungus is critical.',
            actions: context?.includes('High')
                ? [
                    'Increase Humidity (Turn on humidifier/mist)',
                    'Lower Temperature (Increases RH%)',
                    'Reduce light intensity slightly to lower leaf temp'
                ]
                : [
                    'Increase Dehumidification',
                    'Increase Airflow (Fans on High)',
                    'Raise Temperature slightly (Lowers RH%)'
                ],
            cta: { label: 'Log Fix in Tracker', link: '/tracker' }
        },
        'DLI': {
            title: 'Daily Light Integral (DLI) Issue',
            what: `Plants are receiving ${context?.includes('Low') ? 'too little' : 'too much'} light.`,
            why: context?.includes('Low')
                ? 'Plants will be leggy, weak, and slow to grow.'
                : 'Leaves may bleach or burn. Energy is being wasted.',
            actions: context?.includes('Low')
                ? ['Lower lights closer to plants', 'Increase light hours (Photoperiod)', 'Clean dust off light fixtures']
                : ['Raise lights higher', 'Reduce light hours', 'Dim lights if possible'],
            cta: { label: 'Adjust Lighting', link: '/tracker' }
        },
        'Nutrient': {
            title: 'Nutrient Imbalance',
            what: 'Your EC or pH levels are drifting.',
            why: 'Roots cannot absorb food properly. Lockout may occur.',
            actions: ['Check pH first (Must be 5.5 - 6.5)', 'If pH is OK, check EC', 'Flush system if salt buildup is suspected'],
            cta: { label: 'Log Measurements', link: '/tracker' }
        },
        'Root Rot': {
            title: 'Root Disease Risk',
            what: 'Conditions are favorable for Pythium (Root Rot).',
            why: 'Water temperature > 24°C significantly increases risk.',
            actions: ['Add Hydrogen Peroxide (3%) immediately', 'Add Ice Bottles to reservoir', 'Increase Air Stone bubbles'],
            cta: { label: 'Log Treatment', link: '/tracker' }
        },
        'pH High': {
            title: 'pH High: Manual Correction Required',
            what: 'pH has drifted above 6.5, causing nutrient lockout.',
            why: 'Iron and microelements become insoluble (solidify) and cannot be absorbed by roots.',
            actions: [
                'Expert Recommendation: Add 5ml Phosphoric Acid (pH Down)',
                'Stir the reservoir thoroughly',
                'Re-test pH after 30 minutes'
            ],
            cta: { label: 'Log Correction', link: '/tracker' }
        },
        'default': {
            title: 'System Alert',
            what: 'A parameter is out of optimal range.',
            why: 'Ideally, keep all stats in the Green zone for best yield.',
            actions: ['Check the Dashboard for specific details', 'Verify sensor readings', 'Consult the Scientific Guide'],
            cta: { label: 'Open Tracker', link: '/tracker' }
        }
    };

    // Simple keyword matching to find the right data
    let key = 'default';
    if (alertType?.includes('VPD') || alertType?.includes('Dry') || alertType?.includes('Humid')) key = 'VPD';
    else if (alertType?.includes('DLI') || alertType?.includes('Light')) key = 'DLI';
    else if (alertType?.includes('Nutrient') || alertType?.includes('pH') || alertType?.includes('EC')) {
        key = alertType?.includes('High') && alertType?.includes('pH') ? 'pH High' : 'Nutrient';
    }
    else if (alertType?.includes('Root') || alertType?.includes('Rot') || alertType?.includes('Water Temp')) key = 'Root Rot';

    const data = remediationStart[key];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 transform transition-all scale-100">
                {/* Header */}
                <div className="bg-slate-900 text-white p-5 flex justify-between items-start">
                    <div>
                        <h6 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Action Required</h6>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            {data.title}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition">
                        <X size={20} className="text-slate-300" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Diagnosis */}
                    <div className="mb-6">
                        <h4 className="font-bold text-slate-900 mb-2">What's Wrong?</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{data.what}</p>

                        <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-900 flex gap-2">
                            <span className="font-bold">⚠️ Why it matters:</span> {data.why}
                        </div>
                    </div>

                    {/* Prescription */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-600" /> Recommended Fixes
                        </h4>
                        <ul className="space-y-3">
                            {data.actions.map((action, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <span className="bg-white text-slate-900 font-bold w-5 h-5 flex items-center justify-center rounded-full text-xs border border-slate-200 shadow-sm shrink-0">
                                        {i + 1}
                                    </span>
                                    {action}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <button onClick={onClose} className="text-slate-500 font-bold text-sm px-4 py-2 hover:bg-slate-200 rounded-lg transition">
                        Dismiss
                    </button>
                    <Link
                        to={data.cta.link}
                        onClick={onClose}
                        className="bg-emerald-600 text-white font-bold text-sm px-6 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        {data.cta.label} <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RemediationModal;
