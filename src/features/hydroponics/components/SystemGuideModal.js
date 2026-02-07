import React, { useState } from 'react';
import { X, BookOpen, Droplets, Wind, Layers, ArrowRight, CheckCircle, AlertTriangle, Languages } from 'lucide-react';

const SystemGuideModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('systems'); // systems | media | steps
    const [language, setLanguage] = useState('hi'); // Default to Hinglish as per user preference

    // Text Content Dictionary
    const TEXT = {
        title: { en: "Hydroponics Academy", hi: "Hydroponics Pathshala (Academy)" },
        subtitle: { en: "Beginner's Step-by-Step Manual", hi: "Naye Logon ke liye Step-by-Step Guide" },
        tabs: {
            sys: { en: "1. Choose System", hi: "1. System Chunein" },
            media: { en: "2. Growing Medium", hi: "2. Mitti (Medium)" },
            steps: { en: "3. Step-by-Step Guide", hi: "3. Karne ka Tareeka" }
        },
        goldenRule: {
            title: { en: "Golden Rule:", hi: "Golden Rule (Sunera Niyam):" },
            text: {
                en: "You cannot grow everything in one system. NFT is for leafy greens. Drip is for fruiting veggies. Choose wisely!",
                hi: "Aap ek hi system mein sab kuch nahi uga sakte. NFT sirf patte waali sabziyon (Leafy) ke liye hai, aur Drip fal waalon (Fruiting) ke liye."
            }
        },
        mediaTitle: { en: "Which \"Soil\" to use?", hi: "Kaunsi \"Mitti\" (Medium) use karein?" }
    };

    const SYSTEMS = [
        {
            title: "NFT (Nutrient Film)",
            subtitle: { en: "Best for Leafy Greens", hi: "Patte waali sabziyon ke liye Best" },
            drops: { en: "🥬 Lettuce, Spinach, Basil", hi: "🥬 Palak, Lettuce, Basil" },
            bad: { en: "🍅 Tomatoes, Cucumber", hi: "🍅 Tamatar, Kheera (Jadein pipe block karengi)" },
            color: "emerald",
            risk: { en: "High (Pump runs 24/7)", hi: "High (Pump 24 ghante chalna chahiye)" },
            setup: { en: "Slope 1:30 required", hi: "Pipe mein dhalan (slope) zaroori hai" }
        },
        {
            title: "DWC (Deep Water)",
            subtitle: { en: "Easiest for Beginners", hi: "Naye logon ke liye sabse asaan" },
            drops: { en: "🥗 Lettuce, Kale, Herbs", hi: "🥗 Lettuce, Kale, Herbs" },
            bad: { en: "🍆 Heavy Fruiting Plants", hi: "🍆 Bhari paudhe (Baingan/Tamatar)" },
            color: "cyan",
            risk: { en: "Low (Water buffer)", hi: "Kam (Paani ka buffer rehta hai)" },
            setup: { en: "Crucial: Air Stone (Oxygen)", hi: "Zaroori: Air Stone (Oxygen) 24/7" }
        },
        {
            title: "Drip System (Dutch Bucket)",
            subtitle: { en: "For Heavy Producers", hi: "Bhari paudhon ke liye" },
            drops: { en: "🍅 Tomato, Pepper, Cucumber", hi: "🍅 Tamatar, Mirchi, Kheera" },
            bad: { en: "🌿 Small Herbs (Overkill)", hi: "🌿 Chote herbs (Zaroorat nahi)" },
            color: "orange",
            risk: { en: "Low (Medium holds water)", hi: "Kam (Cocopeat paani hold karta hai)" },
            setup: { en: "Timer based (Not 24/7)", hi: "Timer chahiye (Din mein 4-5 baar)" }
        },
        {
            title: "Ebb & Flow",
            subtitle: { en: "Flood & Drain", hi: "Bharna aur Khali karna" },
            drops: { en: "🥕 Root Veggies, Medicinal", hi: "🥕 Mooli, Gajar, Medicinal" },
            bad: { en: "None specific", hi: "Koi bhi chalega" },
            color: "purple",
            risk: { en: "Medium (Timer fail)", hi: "Medium (Agar Timer kharab hua toh)" },
            setup: { en: "Flood Tray & Siphon", hi: "Flood Tray aur Siphon chahiye" }
        }
    ];

    const MEDIA = [
        {
            title: "Clay Pebbles (LECA)",
            use: { en: "DWC & NFT Net Pots", hi: "DWC aur NFT ke liye" },
            desc: {
                en: "Baked clay balls. They hold plants but don't soak much water. Great for oxygen.",
                hi: "Mitti ke pakaye hue gole. Ye paani nahi soadhte, bas paudhe ko pakad ke rakhte hain. Oxygen ke liye best."
            }
        },
        {
            title: "Cocopeat (Coconut Fiber)",
            use: { en: "Drip Systems / Buckets", hi: "Drip Systems / Buckets" },
            desc: {
                en: "Acts like a sponge. Holds water well. Often mixed with Perlite (50:50).",
                hi: "Bilkul sponge jaisa. Paani hold karta hai. Ismein Perlite milana zaroori hai (50:50)."
            }
        },
        {
            title: "Rockwool / Oasis Cubes",
            use: { en: "Seed Germination", hi: "Beej Ugane ke liye" },
            desc: {
                en: "Best for starting seeds. Once roots appear, drop the whole cube into your system.",
                hi: "Beej ugane ke liye sabse badhiya. Jab jadein (roots) aa jayein, toh cube samet system mein daal do."
            }
        },
        {
            title: "Perlite (White Grains)",
            use: { en: "Mix with Cocopeat", hi: "Cocopeat ke saath milayein" },
            desc: {
                en: "Improves drainage. Prevents root rot in drip buckets.",
                hi: "Ye safed dane mitti ko loose rakhte hain taaki paani jam na ho aur jadein sadein nahi."
            }
        }
    ];

    const STEPS = [
        {
            title: { en: "Germination (Day 0-14)", hi: "1. Beej Ugana (Day 0-14)" },
            content: {
                en: (
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                        <li><strong>Prepare:</strong> Fill seedling tray with Cocopeat or soak Oasis cubes.</li>
                        <li><strong>Sow:</strong> Plant seed 1-2cm deep. Keep in DARK for 2-3 days until sprouted.</li>
                        <li><strong>Light:</strong> As soon as white sprout appears, move to light.</li>
                        <li><strong>Transplant:</strong> Ready when 3-4 true leaves appear (approx 10-15 days).</li>
                    </ul>
                ),
                hi: (
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                        <li><strong>Taiyari:</strong> Seedling tray mein Cocopeat bharein ya Oasis cubes ko bhigoyen.</li>
                        <li><strong>Lagana:</strong> Beej ko 1-2cm gehra lagayein. 2-3 din tak ANDHERE (Dark) mein rakhein jab tak ankur na phute.</li>
                        <li><strong>Roshni:</strong> Jaise hi safed ankur dikhe, turant tube light ke neeche rakhein.</li>
                        <li><strong>Shift karna:</strong> Jab paudhe mein 3-4 asli patte aa jayein (10-15 din), tab system mein shift karein.</li>
                    </ul>
                )
            }
        },
        {
            title: { en: "System Setup", hi: "2. System Setup" },
            content: {
                en: (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-emerald-600 mb-2">NFT Setup</h4>
                            <p className="text-xs text-slate-500">Ensure <strong>Slope</strong> so water flows. Pump must run <strong>24/7</strong>. Roots must touch the bottom film of water.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-cyan-600 mb-2">DWC Setup</h4>
                            <p className="text-xs text-slate-500"><strong>Air Stone</strong> must bubble 24/7. Water level should just touch the bottom of the net pot.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-orange-600 mb-2">Drip Setup</h4>
                            <p className="text-xs text-slate-500">Use <strong>Cocopeat + Perlite</strong>. Set Timer (e.g., 5 mins ON every 4 hours). Do not run pump 24/7.</p>
                        </div>
                    </div>
                ),
                hi: (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-emerald-600 mb-2">NFT Setup</h4>
                            <p className="text-xs text-slate-500">Pie mein <strong>Dhalan (Slope)</strong> honi chahiye. Pump <strong>24 ghante</strong> chalega. Jadein paani ko chhuni chahiye.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-cyan-600 mb-2">DWC Setup</h4>
                            <p className="text-xs text-slate-500"><strong>Air Stone</strong> 24 ghante chalna chahiye. Paani ka level net-pot ke neeche touch hona chahiye.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-orange-600 mb-2">Drip Setup</h4>
                            <p className="text-xs text-slate-500"><strong>Cocopeat + Perlite</strong> use karein. Timer lagayein (Har 4 ghante mein 5 minute ON). Pump 24 ghante mat chalayein.</p>
                        </div>
                    </div>
                )
            }
        },
        {
            title: { en: "Mixing Nutrients", hi: "3. Khaad (Nutrients) Milana" },
            content: {
                en: (
                    <>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800 mb-4">
                            ⚠️ <strong>WARNING:</strong> Never mix Part A and Part B directly! They will solidify.
                        </div>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                            <li>Fill tank with water (measure liters).</li>
                            <li>Add <strong>Nutrient A</strong> (Calcium Nitrate) &rarr; Stir well.</li>
                            <li>Add <strong>Nutrient B</strong> (NPK) &rarr; Stir well.</li>
                            <li>Check <strong>pH</strong> (Target 6.0) and <strong>EC</strong> (Target 1.2 - 2.0).</li>
                        </ol>
                    </>
                ),
                hi: (
                    <>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800 mb-4">
                            ⚠️ <strong>SAVDHAAN:</strong> Nutrient A aur B ko kabhi direct mat milayein! Wo jam jayenge (Patthar ban jayenge).
                        </div>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                            <li>Tank ko paani se bharein (Liters naap lein).</li>
                            <li>Pehle <strong>Nutrient A</strong> dalein &rarr; Achhe se mix karein.</li>
                            <li>Fir <strong>Nutrient B</strong> dalein &rarr; Achhe se mix karein.</li>
                            <li>Aakhri mein <strong>pH</strong> (Target 6.0) aur <strong>EC</strong> (Target 1.2 - 2.0) check karein.</li>
                        </ol>
                    </>
                )
            }
        },
        {
            title: { en: "Harvest Rules", hi: "4. Katayi (Harvest Rules)" },
            content: {
                en: (
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                        <li><strong>Leafy Greens:</strong> Harvest in 30-45 days. Pick outer leaves or whole plant. Harvest in early morning for crunch.</li>
                        <li><strong>Fruiting:</strong> Harvest when ripe (60-90 days). For better taste, stop nutrients (flush with plain water) 1 week before harvest.</li>
                    </ul>
                ),
                hi: (
                    <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                        <li><strong>Patte waali sabzi:</strong> 30-45 din mein taiyar. Subah-subah katein taaki crispy rahein.</li>
                        <li><strong>Fal waali sabzi:</strong> Jab pak jayein tab todein (60-90 din). Swad badhane ke liye, katayi se 1 hafta pehle khaad dena band kar dein (sirf saaf paani dein).</li>
                    </ul>
                )
            }
        }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-800 leading-tight">{TEXT.title[language]}</h2>
                            <p className="text-xs text-slate-500 font-bold">{TEXT.subtitle[language]}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <div className="bg-slate-200 rounded-xl p-1 flex gap-1">
                            <button
                                onClick={() => setLanguage('hi')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${language === 'hi'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-300/50'
                                    }`}
                            >
                                <Languages size={14} />
                                Hinglish
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${language === 'en'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-300/50'
                                    }`}
                            >
                                <Languages size={14} />
                                English
                            </button>
                        </div>

                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 flex gap-4 border-b border-slate-100 overflow-x-auto">
                    <TabButton active={activeTab === 'systems'} onClick={() => setActiveTab('systems')} label={TEXT.tabs.sys[language]} icon={<Wind size={16} />} />
                    <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')} label={TEXT.tabs.media[language]} icon={<Layers size={16} />} />
                    <TabButton active={activeTab === 'steps'} onClick={() => setActiveTab('steps')} label={TEXT.tabs.steps[language]} icon={<CheckCircle size={16} />} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

                    {/* TAB 1: SYSTEM COMPARISON */}
                    {activeTab === 'systems' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="text-blue-600 shrink-0 mt-1" size={20} />
                                <p className="text-sm text-blue-800">
                                    <strong>{TEXT.goldenRule.title[language]}</strong> {TEXT.goldenRule.text[language]}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SYSTEMS.map((sys, idx) => (
                                    <SystemCard
                                        key={idx}
                                        title={sys.title}
                                        subtitle={sys.subtitle[language]}
                                        drops={sys.drops[language]}
                                        bad={sys.bad[language]}
                                        color={sys.color}
                                        risk={sys.risk[language]}
                                        setup={sys.setup[language]}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: GROWING MEDIUM */}
                    {activeTab === 'media' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800">{TEXT.mediaTitle[language]}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {MEDIA.map((m, idx) => (
                                    <MediaCard
                                        key={idx}
                                        title={m.title}
                                        use={m.use[language]}
                                        desc={m.desc[language]}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: STEP-BY-STEP */}
                    {activeTab === 'steps' && (
                        <div className="space-y-8">
                            {STEPS.map((step, idx) => (
                                <StepSection key={idx} number={idx + 1} title={step.title[language]}>
                                    {step.content[language]}
                                </StepSection>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-white flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">
                        {language === 'en' ? "Got it, I'm Ready!" : "Samajh gaya, Chalo shuru karein!"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Sub-components
const TabButton = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${active ? 'border-cyan-500 text-cyan-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
    >
        {icon} {label}
    </button>
);

const SystemCard = ({ title, subtitle, drops, bad, color, risk, setup }) => (
    <div className={`p-5 rounded-2xl border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow border-${color}-500`}>
        <h3 className={`text-base md:text-lg font-black text-${color}-600 leading-snug`}>{title}</h3>
        <p className="text-xs text-slate-400 font-bold uppercase mb-3">{subtitle}</p>

        <div className="space-y-2 text-sm">
            <div className="flex gap-2 items-start">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-slate-700">{drops}</span>
            </div>
            <div className="flex gap-2 items-start">
                <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-slate-500 text-xs">Avoid: {bad}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="font-bold text-slate-500">Risk: <span className="font-normal">{risk}</span></span>
            </div>
            <div className="text-xs text-slate-500">
                <strong>Key:</strong> {setup}
            </div>
        </div>
    </div>
);

const MediaCard = ({ title, use, desc }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-1 text-sm md:text-base leading-snug">{title}</h4>
        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded mb-3">{use}</span>
        <p className="text-sm text-slate-600">{desc}</p>
    </div>
);

const StepSection = ({ number, title, children }) => (
    <div className="flex gap-4">
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-black text-sm">
            {number}
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-slate-800 mb-3 text-base md:text-lg leading-snug">{title}</h4>
            {children}
        </div>
    </div>
);

export default SystemGuideModal;
