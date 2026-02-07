import React from 'react';
import { BookOpen, Sprout, Droplets, Wrench, Beaker, AlertTriangle, Shield, ChevronRight, Layers, Wind, Droplet } from 'lucide-react';

const FarmingGuidePage = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Farming Guide</h1>
                <p className="text-slate-600">Complete manual for hydroponics and microgreens farming</p>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="#hydroponics" className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors">
                    <Droplets className="text-cyan-600 mb-2" size={24} />
                    <p className="font-bold text-slate-900 text-sm">Hydroponics</p>
                </a>
                <a href="#microgreens" className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                    <Sprout className="text-emerald-600 mb-2" size={24} />
                    <p className="font-bold text-slate-900 text-sm">Microgreens</p>
                </a>
                <a href="#equipment" className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                    <Wrench className="text-orange-600 mb-2" size={24} />
                    <p className="font-bold text-slate-900 text-sm">Equipment</p>
                </a>
                <a href="#nutrients" className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                    <Beaker className="text-purple-600 mb-2" size={24} />
                    <p className="font-bold text-slate-900 text-sm">Nutrients</p>
                </a>
                <a href="#mushrooms" className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors col-span-2 md:col-span-1">
                    <Layers className="text-indigo-600 mb-2" size={24} />
                    <p className="font-bold text-slate-900 text-sm">Mycology Hub</p>
                </a>
            </div>

            {/* Hydroponics Setup - Beginner's Choice */}
            <div id="hydroponics" className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Droplets className="text-cyan-600 flex-shrink-0" size={28} />
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">Hydroponics Types: Which one is for you?</h2>
                </div>

                <div className="space-y-8">
                    {/* NFT Section */}
                    <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            🌊 NFT (Nutrient Film Technique)
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">For leafy greens</span>
                        </h3>
                        <p className="text-sm text-slate-600 italic">"Like a shallow stream of water constantly running over the roots."</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-700 text-xs mb-2 uppercase">Beginner Setup</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    <li>PVC Pipes with holes</li>
                                    <li>Water Pump (Must run 24/7)</li>
                                    <li>Reservoir (Bucket/Tank)</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="font-bold text-blue-800 text-xs mb-2 uppercase">Pro Tip</p>
                                <p className="text-sm text-blue-700">Check your pump every morning! If the pump stops, roots dry out very fast because they are mostly in air.</p>
                            </div>
                        </div>
                    </div>

                    {/* DWC Section */}
                    <div className="border-l-4 border-emerald-500 pl-4 space-y-3">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            🛁 DWC (Deep Water Culture)
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Simplest & Safest</span>
                        </h3>
                        <p className="text-sm text-slate-600 italic">"Like plants sitting in a cool bathtub with bubbles to help them breathe."</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-700 text-xs mb-2 uppercase">Beginner Setup</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    <li>Storage Box / Deep Tub</li>
                                    <li>Floating Raft (Thermacole/HDP)</li>
                                    <li>Air Pump + Air Stones (Essential!)</li>
                                </ul>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                                <p className="font-bold text-emerald-800 text-xs mb-2 uppercase">Pro Tip</p>
                                <p className="text-sm text-emerald-700">Clean your air stones weekly. If they stop bubbling, the water loses oxygen and the roots will rot.</p>
                            </div>
                        </div>
                    </div>

                    {/* Ebb & Flow Section */}
                    <div className="border-l-4 border-orange-500 pl-4 space-y-3">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            ⏳ Ebb & Flow (Flood & Drain)
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">For heavy plants</span>
                        </h3>
                        <p className="text-sm text-slate-600 italic">"Like a tide that comes in to feed the plants, then goes back out to let them breathe."</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <p className="font-bold text-slate-700 text-xs mb-2 uppercase">Beginner Setup</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    <li>Grow Tray + Stand</li>
                                    <li>LECA (Clay balls) as media</li>
                                    <li>Interval Timer (Mechanical)</li>
                                </ul>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <p className="font-bold text-orange-800 text-xs mb-2 uppercase">Pro Tip</p>
                                <p className="text-sm text-orange-700">Set your timer to flood for 15 mins every 4 hours. LECA holds water, so plants stay hydrated even if the power goes out.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Microgreens Setup */}
            <div id="microgreens" className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Sprout className="text-emerald-600 flex-shrink-0" size={28} />
                    <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">Microgreens Setup</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">📦 Equipment Needed</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Growing trays (10x20 inch, with drainage holes)</li>
                            <li>Blackout dome (for germination)</li>
                            <li>Grow lights (LED, 6500K, 20-40W)</li>
                            <li>Growing media: Cocopeat / Soil mix</li>
                            <li>Seeds: Radish, Fenugreek, Mustard, Coriander</li>
                            <li>Spray bottle (for watering)</li>
                            <li>Scissors (for harvesting)</li>
                        </ul>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h3 className="font-bold text-emerald-900 mb-3">🌱 Step-by-Step Procedure</h3>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700">
                            <li><strong>Prepare tray</strong> - Fill with 1-2 inch cocopeat/soil</li>
                            <li><strong>Soak seeds</strong> (optional) - 4-8 hours for faster germination</li>
                            <li><strong>Spread seeds</strong> evenly - Dense but not overlapping</li>
                            <li><strong>Cover with dome</strong> - Keep in dark for 2-3 days</li>
                            <li><strong>Water daily</strong> - Spray gently, keep moist not soggy</li>
                            <li><strong>Remove dome</strong> after germination - Expose to light</li>
                            <li><strong>Grow under lights</strong> - 12-16 hours/day</li>
                            <li><strong>Harvest</strong> after 7-14 days when 2-3 inches tall</li>
                        </ol>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="font-bold text-blue-900 mb-2">💡 Pro Tips</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                            <li>Radish (Mooli): 7 days, spicy flavor</li>
                            <li>Fenugreek (Methi): 10 days, bitter taste</li>
                            <li>Mustard (Sarson): 8 days, pungent</li>
                            <li>Coriander (Dhania): 14 days, aromatic</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Equipment Guide */}
            <div id="equipment" className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Wrench className="text-orange-600" size={28} />
                    <h2 className="text-xl font-bold text-slate-900">Equipment & Costs (India)</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 border-b font-bold text-slate-900">Item</th>
                                <th className="p-3 border-b font-bold text-slate-900">Approx Cost (₹)</th>
                                <th className="p-3 border-b font-bold text-slate-900">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm">
                            <tr>
                                <td className="p-3">Cocopeat (5kg block)</td>
                                <td className="p-3">₹100-150</td>
                                <td className="p-3">Mainly for Microgreens & Seedlings</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold text-orange-600">LECA / Clay Pebbles (10L)</td>
                                <td className="p-3">₹400-600</td>
                                <td className="p-3">Essential for Ebb & Flow. Reusable!</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold text-emerald-600">DWC Floating Raft (Single)</td>
                                <td className="p-3">₹80-150</td>
                                <td className="p-3">Used for DWC "Bathtub" systems</td>
                            </tr>
                            <tr>
                                <td className="p-3">pH & EC Digital Meters</td>
                                <td className="p-3">₹1500-4000</td>
                                <td className="p-3">The "Eyes" of your farm. Don't skip!</td>
                            </tr>
                            <tr>
                                <td className="p-3">Water Pump (18W)</td>
                                <td className="p-3">₹450-900</td>
                                <td className="p-3">Used for both NFT and Ebb & Flow</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold text-blue-600">Mechanical Interval Timer</td>
                                <td className="p-3">₹400-750</td>
                                <td className="p-3">Critical for Ebb & Flow cycle automation</td>
                            </tr>
                            <tr>
                                <td className="p-3">Grow Lights (20W LED)</td>
                                <td className="p-3">₹600-1200</td>
                                <td className="p-3">Use 2 tubes per 4ft rack layer</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Nutrients & Mixing */}
            <div id="nutrients" className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Beaker className="text-purple-600" size={28} />
                    <h2 className="text-xl font-bold text-slate-900">Nutrients & Mixing Guide</h2>
                </div>

                <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-bold text-purple-900 mb-3">🧪 Nutrient Formula (Per 10L Water)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-bold text-purple-900">Part A (Calcium Nitrate)</p>
                                <p className="text-2xl font-bold text-slate-900">10-15 ml</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-purple-900">Part B (Micro + Macro)</p>
                                <p className="text-2xl font-bold text-slate-900">10-15 ml</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">⚗️ Mixing Procedure</h3>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700">
                            <li>Fill reservoir with 10L clean water</li>
                            <li>Add Part A, stir well for 30 seconds</li>
                            <li>Add Part B, stir well for 30 seconds</li>
                            <li>Wait 5 minutes for mixing</li>
                            <li>Check EC (should be 1.2-2.4 mS)</li>
                            <li>Adjust pH to 5.8-6.2</li>
                        </ol>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="text-red-600 mt-0.5" size={18} />
                            <div>
                                <p className="font-bold text-red-900 mb-1">🚫 Never Mix A + B Directly!</p>
                                <p className="text-sm text-red-700">Always add water first, then Part A, then Part B. Mixing A+B directly causes precipitation (white powder) and nutrient lockout.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="text-amber-600" size={28} />
                    <h2 className="text-xl font-bold text-slate-900">Beginner Mistakes & Fixes</h2>
                </div>

                <div className="space-y-3">
                    {[
                        { mistake: 'Overwatering Microgreens', solution: 'Spray lightly. If media is soggy, roots will die from "damping off".' },
                        { mistake: 'NFT Pump Failure', solution: 'Check pump DAILY. In NFT, plants have no water reserve and will wilt in 2 hours.' },
                        { mistake: 'DWC "Quiet" Water', solution: 'If bubbles stop, roots drown. Water must always be "fizzy" with air bubbles.' },
                        { mistake: 'Ebb & Flow Dry Spots', solution: 'Ensure LECA is evenly wet. If media stays dry, increase flood duration.' },
                        { mistake: 'Mixing A+B Directly', solution: 'Never mix Part A and B concentrated. They will form "white powder" and be useless.' },
                        { mistake: 'Ignoring Water Temp', solution: 'If water feels "warm" (>26°C), it holds no oxygen. Add frozen water bottles to the tank!' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-amber-700">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-amber-900 text-sm">❌ {item.mistake}</p>
                                <p className="text-xs text-amber-700 mt-1">✅ {item.solution}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Safety & Hygiene */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-green-600" size={28} />
                    <h2 className="text-xl font-bold text-slate-900">Safety & Hygiene</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="font-bold text-green-900 mb-2">✅ Do's</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                            <li>Wash hands before handling plants</li>
                            <li>Clean trays after each harvest</li>
                            <li>Sanitize tools weekly</li>
                            <li>Use gloves when handling chemicals</li>
                            <li>Store nutrients in cool, dark place</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-bold text-red-900 mb-2">❌ Don'ts</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                            <li>Don't reuse contaminated growing media</li>
                            <li>Don't mix different nutrient brands</li>
                            <li>Don't expose nutrients to sunlight</li>
                            <li>Don't harvest with dirty scissors</li>
                            <li>Don't ignore mold/fungus growth</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Mushroom Guide - Expert Manual */}
            <div id="mushrooms" className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative mb-6">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Layers size={120} />
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white flex-shrink-0">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">The Mycology Manual</h2>
                        <p className="text-xs md:text-sm font-bold text-indigo-600 uppercase tracking-widest leading-snug">Expert Guide: Growing without a Dashboard</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Fundamental Core */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="font-black text-slate-800 mb-3 flex items-start gap-2">
                                <Shield className="text-indigo-500 flex-shrink-0 mt-0.5" size={18} /> <span>The Sterility "Holy Grail"</span>
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                Mushroom farming is 90% hygiene. While plants can survive in dirty soil, mushrooms will be overtaken by mold (Trichoderma) in hours.
                            </p>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Build a Still Air Box (SAB)</p>
                                <ul className="text-xs text-slate-700 space-y-2">
                                    <li className="flex gap-2">🔹 Take a clear 60L plastic tub</li>
                                    <li className="flex gap-2">🔹 Cut two 4-inch arm holes</li>
                                    <li className="flex gap-2">🔹 Use this to inoculate bags; it stops air movement that carries invisible mold spores.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <h3 className="font-black text-indigo-900 mb-3 flex items-start gap-2">
                                <Wind className="text-indigo-600 flex-shrink-0 mt-0.5" size={18} /> <span>Airflow & CO2 Secret</span>
                            </h3>
                            <p className="text-sm text-indigo-800 leading-relaxed">
                                <strong>Spawn Run:</strong> Keep the bag sealed. High CO2 (~2000ppm) helps mycelium grow fast. <br />
                                <strong>Fruiting:</strong> "Exchange the Air". Open a window or fan the room 4-5 times a day. If stems are long and caps are small, your CO2 is too high!
                            </p>
                        </div>
                    </div>

                    {/* Step-by-Step Offline */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm">
                            <h3 className="font-black text-slate-800 mb-4 flex items-start gap-2">
                                <Droplet className="text-cyan-500 flex-shrink-0 mt-0.5" size={18} /> <span>Substrate Pasteurization</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="bg-cyan-100 text-cyan-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 text-sm">H</div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Hot Water Method</p>
                                        <p className="text-xs text-slate-500">Soak dry straw in 80°C water for 2 hours. This kills the "Bad" bacteria but keeps "Good" ones.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 text-sm">L</div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Lime Method (Offline Hack)</p>
                                        <p className="text-xs text-slate-500">Soak straw in cold water mixed with 2% Hydrated Lime (Chuna) for 12 hours. It raises pH so high that mold cannot grow.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                            <h3 className="font-black text-rose-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <AlertTriangle size={18} /> Contamination ID
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-xl border border-rose-200">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase">White / Fuzzy</p>
                                    <p className="text-xs font-bold text-slate-700">Healthy Mycelium. IT'S GOOD!</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-rose-200">
                                    <p className="text-[10px] font-black text-rose-600 uppercase flex-shrink-0">Green Patch</p>
                                    <p className="text-xs font-bold text-slate-700 underline">TRICHODERMA. Throw it out immediately!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Need Help Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-6 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">Still have questions?</h3>
                        <p className="text-sm text-slate-600">Check your specific pages for real-time guidance</p>
                    </div>
                    <div className="flex gap-2">
                        <a href="/hydroponics" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 flex items-center gap-2 text-sm font-medium">
                            Go to Hydroponics <ChevronRight size={16} />
                        </a>
                        <a href="/microgreens" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 flex items-center gap-2 text-sm font-medium">
                            Go to Microgreens <ChevronRight size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmingGuidePage;
