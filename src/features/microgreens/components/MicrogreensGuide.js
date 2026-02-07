import React, { useState } from 'react';
import { X, Sprout, Droplets, Sun, Thermometer, Calendar, AlertTriangle, CheckCircle, Info, Languages } from 'lucide-react';
import {
    UNIVERSAL_MEDIA_MIX,
    MUST_SOAK_SEEDS,
    NO_SOAK_SEEDS,
    MASTER_MICROGREENS_TABLE,
    WORKING_MANUAL_STEPS,
    TRAY_RECOMMENDATION,
    CRITICAL_NOTES
} from '../data/microgreens_data_bilingual';

const MicrogreensGuide = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('master');
    const [language, setLanguage] = useState('hi'); // 'en' for English, 'hi' for Hinglish

    // Helper function to get text based on language
    const getText = (textObj) => {
        if (typeof textObj === 'string') return textObj;
        return textObj[language] || textObj.en;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8 rounded-t-3xl z-10">
                    <div className="flex justify-between items-start">
                        <div>

                            <p className="text-emerald-100 font-medium text-lg">
                                {language === 'en' ? 'Complete Bio-filter Setup & Growing Manual' : 'Complete Bio-filter Setup & Growing Manual'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Language Toggle */}
                            <div className="bg-white/20 rounded-2xl p-1 flex gap-1">
                                <button
                                    onClick={() => setLanguage('hi')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${language === 'hi'
                                        ? 'bg-white text-emerald-600 shadow-lg'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Languages size={16} />
                                    Hinglish
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${language === 'en'
                                        ? 'bg-white text-emerald-600 shadow-lg'
                                        : 'text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Languages size={16} />
                                    English
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                        {[
                            { id: 'master', label: language === 'en' ? 'Master Table' : 'Master Table', icon: Sprout },
                            { id: 'soak', label: language === 'en' ? 'Soaking Guide' : 'Soaking Guide', icon: Droplets },
                            { id: 'steps', label: language === 'en' ? 'Working Manual' : 'Working Manual', icon: CheckCircle },
                            { id: 'tips', label: language === 'en' ? 'Critical Tips' : 'Critical Tips', icon: AlertTriangle }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'bg-white text-emerald-600 shadow-lg'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Universal Media Mix Banner */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
                        <h3 className="text-lg md:text-xl font-black text-amber-900 mb-3 flex flex-wrap items-center gap-2 leading-snug">
                            <Info className="text-amber-600 w-6 h-6 flex-shrink-0" />
                            <span>{language === 'en' ? 'Universal Bio-filter Mix (For all seeds)' : 'Universal Bio-filter Mix (Sabhi Seeds ke liye)'}</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-amber-600">{UNIVERSAL_MEDIA_MIX.cocopeat}%</div>
                                <div className="text-sm font-bold text-slate-600 mt-1">Cocopeat</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-emerald-600">{UNIVERSAL_MEDIA_MIX.perlite}%</div>
                                <div className="text-sm font-bold text-slate-600 mt-1">Perlite</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 text-center">
                                <div className="text-3xl font-black text-blue-600">{UNIVERSAL_MEDIA_MIX.vermiculite}%</div>
                                <div className="text-sm font-bold text-slate-600 mt-1">Vermiculite</div>
                            </div>
                        </div>
                        <p className="text-xs text-amber-700 font-bold mt-4 italic flex gap-2">
                            <span className="flex-shrink-0">💡</span>
                            <span>{getText(UNIVERSAL_MEDIA_MIX.note)}</span>
                        </p>
                    </div>

                    {/* Master Table Tab */}
                    {activeTab === 'master' && (
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6 leading-snug">
                                {language === 'en' ? '📊 Master Microgreens Table' : '📊 Master Microgreens Table'}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white">
                                            <th className="p-4 text-left font-black text-sm">{language === 'en' ? 'Seed Name' : 'Seed Name'}</th>
                                            <th className="p-4 text-left font-black text-sm">{language === 'en' ? 'Soaking Time' : 'Soaking Time'}</th>
                                            <th className="p-4 text-left font-black text-sm">{language === 'en' ? 'Growing Cycle' : 'Growing Cycle'}</th>
                                            <th className="p-4 text-left font-black text-sm">{language === 'en' ? 'Bio-filter Phase' : 'Bio-filter Phase'}</th>
                                            <th className="p-4 text-left font-black text-sm">{language === 'en' ? 'Temp Range' : 'Temp Range'}</th>
                                            <th className="p-4 text-left font-black text-sm">{language === 'en' ? 'Health Benefits' : 'Health Benefits'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MASTER_MICROGREENS_TABLE.map((seed, idx) => (
                                            <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-emerald-50 transition-colors`}>
                                                <td className="p-4 font-bold text-slate-800">{seed.seedName}</td>
                                                <td className="p-4 text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getText(seed.soakingTime).includes('NO') || getText(seed.soakingTime).includes('NEVER')
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {getText(seed.soakingTime)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-600 font-medium">{seed.growingCycle}</td>
                                                <td className="p-4 text-sm font-bold text-emerald-600">{seed.biofilterPhase}</td>
                                                <td className="p-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Thermometer size={14} className="text-orange-500" />
                                                        {seed.tempIdeal}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs text-slate-500 italic">{getText(seed.healthBenefits)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Soaking Guide Tab */}
                    {activeTab === 'soak' && (
                        <div className="space-y-8">
                            {/* Must Soak Seeds */}
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex flex-wrap items-center gap-2 leading-snug">
                                    <Droplets className="text-blue-500 w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
                                    <span>{language === 'en' ? 'Group A: Must Soak Seeds 💧' : 'Group A: Must Soak Seeds (Inhe Bhigona Zaruri Hai) 💧'}</span>
                                </h3>
                                <p className="text-slate-600 font-medium mb-6">
                                    {language === 'en'
                                        ? 'These seeds are large or have hard shells. If not soaked, they will dry out from bio-filter airflow and won\'t germinate.'
                                        : 'Ye beej bade ya sakht (hard shell) hote hain. Agar inhe nahi bhigoya, toh ye aapke bio-filter ki hawa se sookh jayenge aur ugenge nahi.'}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MUST_SOAK_SEEDS.map((seed, idx) => (
                                        <div key={idx} className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 hover:shadow-lg transition-all">
                                            <h4 className="text-lg font-black text-blue-900 mb-2">{seed.seedName}</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <Droplets size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-bold text-blue-700 leading-tight">
                                                        {language === 'en' ? 'Soak: ' : 'Soak: '}{seed.soakingTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-600 font-medium leading-tight">
                                                        {language === 'en' ? 'Harvest: ' : 'Harvest: '}{seed.harvestDay}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Sun size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-emerald-700 font-medium text-xs leading-tight">{getText(seed.biofilterTip)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 italic mt-2">{getText(seed.healthNotes)}</p>
                                                {seed.soakingNote && (
                                                    <div className="bg-amber-100 border border-amber-300 rounded-lg p-2 mt-2">
                                                        <p className="text-xs font-bold text-amber-800">⚠️ {getText(seed.soakingNote)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* No Soak Seeds */}
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-4 flex flex-wrap items-center gap-2 leading-snug">
                                    <AlertTriangle className="text-red-500 w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
                                    <span>{language === 'en' ? 'Group B: DO NOT SOAK Seeds 🚫' : 'Group B: DO NOT SOAK Seeds (Inhe Bhigona Mana Hai) 🚫'}</span>
                                </h3>
                                <p className="text-slate-600 font-medium mb-6">
                                    {language === 'en'
                                        ? 'These seeds are either very small or become mucilaginous (gel-like) in water. If soaked, they will rot.'
                                        : 'Ye beej ya toh bohot chhote hain ya paani mein chipchipe (gel) ban jate hain. Agar inko bhigoya, toh ye sad jayenge.'}
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {NO_SOAK_SEEDS.map((seed, idx) => (
                                        <div key={idx} className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 hover:shadow-lg transition-all">
                                            <h4 className="text-lg font-black text-red-900 mb-2">{seed.seedName}</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <X size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-bold text-red-700 leading-tight">
                                                        {seed.soaking} {seed.soakingReason && `(${getText(seed.soakingReason)})`}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Calendar size={16} className="text-slate-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-600 font-medium leading-tight">
                                                        {language === 'en' ? 'Harvest: ' : 'Harvest: '}{seed.harvestDay}
                                                    </span>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Sun size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-emerald-700 font-medium text-xs leading-tight">{getText(seed.biofilterTip)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 italic mt-2">{getText(seed.healthNotes)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Working Manual Tab */}
                    {activeTab === 'steps' && (
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-6 leading-snug">
                                {language === 'en' ? '🛠️ Working Manual: Step-by-Step' : '🛠️ Working Manual: Step-by-Step'}
                            </h3>
                            <p className="text-slate-600 font-medium mb-8">
                                {language === 'en'
                                    ? 'This process is customized for your Single Tray + Fan Box setup.'
                                    : 'Yeh process aapke Single Tray + Fan Box setup ke liye customized hai.'}
                            </p>
                            <div className="space-y-4">
                                {WORKING_MANUAL_STEPS.map((step) => (
                                    <div key={step.step} className="bg-gradient-to-r from-slate-50 to-white border-l-4 border-emerald-500 rounded-2xl p-6 hover:shadow-lg transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-emerald-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0">
                                                {step.step}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-black text-slate-800 mb-2">{getText(step.action)}</h4>
                                                <p className="text-sm text-slate-600 leading-relaxed">{getText(step.detail)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 22 Trays Recommendation */}
                            <div className="mt-10 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-8">
                                <h3 className="text-xl md:text-2xl font-black text-purple-900 mb-6 leading-snug">
                                    {language === 'en' ? '🎯 Project Recommendation: 22 Trays Distribution' : '🎯 Project Recommendation: 22 Trays Distribution'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TRAY_RECOMMENDATION.distribution.map((dist, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl p-5 shadow-md">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-black text-slate-800">{getText(dist.category)}</h4>
                                                <span className="bg-purple-500 text-white px-4 py-1 rounded-full font-black text-lg">
                                                    {dist.trays} Trays
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {dist.seeds.map((seed, i) => (
                                                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold">
                                                        {seed}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 italic">{getText(dist.note)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 bg-white rounded-2xl p-4">
                                    <p className="text-sm text-purple-800 font-bold flex gap-2">
                                        <span className="flex-shrink-0">✨</span>
                                        <span>{getText(TRAY_RECOMMENDATION.benefit)}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Critical Tips Tab */}
                    {activeTab === 'tips' && (
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 mb-6">
                                {language === 'en' ? '⚠️ Critical Notes for Success' : '⚠️ Critical Notes for Success'}
                            </h3>
                            <div className="space-y-6">
                                {CRITICAL_NOTES.map((note, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl p-6 hover:shadow-lg transition-all">
                                        <h4 className="text-lg md:text-xl font-black text-red-900 mb-3 flex items-start gap-2 leading-snug">
                                            <AlertTriangle className="text-red-600 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 mt-1" />
                                            <span>{getText(note.title)}</span>
                                        </h4>
                                        <p className="text-slate-700 leading-relaxed font-medium">{getText(note.description)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Reference Card */}
                            <div className="mt-10 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-3xl p-8">
                                <h3 className="text-xl md:text-2xl font-black mb-4 leading-snug">
                                    {language === 'en' ? '🌱 Quick Reference' : '🌱 Quick Reference'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                        <div className="text-3xl font-black mb-2">3-4 Days</div>
                                        <div className="text-sm font-bold opacity-90">
                                            {language === 'en' ? 'Blackout Phase' : 'Blackout Phase'}
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                        <div className="text-3xl font-black mb-2">Day 4+</div>
                                        <div className="text-sm font-bold opacity-90">
                                            {language === 'en' ? 'Turn ON Fan' : 'Fan ON karein'}
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                        <div className="text-3xl font-black mb-2">2x Daily</div>
                                        <div className="text-sm font-bold opacity-90">
                                            {language === 'en' ? 'Moisture Check' : 'Moisture Check'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MicrogreensGuide;
