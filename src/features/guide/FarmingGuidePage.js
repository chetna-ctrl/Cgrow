import React from 'react';
import { BookOpen, Sprout, Droplets, Wrench, Beaker, AlertTriangle, Shield, ChevronRight } from 'lucide-react';

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
            </div>

            {/* Hydroponics Setup */}
            <div id="hydroponics" className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Droplets className="text-cyan-600" size={28} />
                    <h2 className="text-xl font-bold text-slate-900">Hydroponics Setup</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-slate-900 mb-2">📦 Equipment Needed</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                            <li>Grow tray / NFT pipes</li>
                            <li>Water pump (18W recommended)</li>
                            <li>Air pump + air stone</li>
                            <li>Net pots (5cm diameter)</li>
                            <li>Growing media: Cocopeat / LECA / Rockwool</li>
                            <li>pH meter (digital, ₹500-2000)</li>
                            <li>EC meter (₹800-3000)</li>
                            <li>Reservoir tank (50-100L)</li>
                        </ul>
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                        <h3 className="font-bold text-cyan-900 mb-3">🔧 Step-by-Step Procedure</h3>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700">
                            <li><strong>Fill reservoir</strong> with RO water (reverse osmosis) or clean tap water</li>
                            <li><strong>Add nutrients</strong> (A + B solution) - Follow 1:1 ratio</li>
                            <li><strong>Adjust EC</strong> to 1.2–2.4 mS (use EC meter)</li>
                            <li><strong>Adjust pH</strong> to 5.8–6.2 (use pH Down/Up solution)</li>
                            <li><strong>Place seedlings</strong> in net pots with growing media</li>
                            <li><strong>Run pump</strong> 18–24 hours/day (continuous or 15min ON, 15min OFF)</li>
                            <li><strong>Monitor daily</strong> - Check pH, EC, water level</li>
                        </ol>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-bold text-purple-900 mb-3">📐 Key Formulas</h3>
                        <div className="space-y-3 text-sm">
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <p className="font-bold text-purple-900 mb-1">Plants per Area</p>
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">Plants = (Area in sqft / 50) × 200</code>
                                <p className="text-xs text-slate-600 mt-1">Example: 1000 sqft → (1000/50) × 200 = 4,000 plants</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <p className="font-bold text-purple-900 mb-1">Nutrient Dosage</p>
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">Nutrients (ml) = Water (L) × 1.5</code>
                                <p className="text-xs text-slate-600 mt-1">Example: 100L water → 150ml each of Part A & B</p>
                            </div>
                            <div className="bg-white p-3 rounded border border-purple-200">
                                <p className="font-bold text-purple-900 mb-1">Water Requirement</p>
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">Water (L/day) = Plants × 4</code>
                                <p className="text-xs text-slate-600 mt-1">Example: 1000 plants → 4,000L/day</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="text-amber-600 mt-0.5" size={18} />
                            <div>
                                <p className="font-bold text-amber-900 mb-1">⚠️ Beginner Tip</p>
                                <p className="text-sm text-amber-700">Never add nutrients before water level is correct. Always add water first, then nutrients.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Microgreens Setup */}
            <div id="microgreens" className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <Sprout className="text-emerald-600" size={28} />
                    <h2 className="text-xl font-bold text-slate-900">Microgreens Setup</h2>
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
                                <th className="p-3 border-b font-bold text-slate-900">Cost (₹)</th>
                                <th className="p-3 border-b font-bold text-slate-900">Where to Buy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            <tr>
                                <td className="p-3">Cocopeat (5kg block)</td>
                                <td className="p-3">₹100-150</td>
                                <td className="p-3">Amazon, Local nursery</td>
                            </tr>
                            <tr>
                                <td className="p-3">LECA (10L)</td>
                                <td className="p-3">₹300-500</td>
                                <td className="p-3">Amazon, Hydroponics stores</td>
                            </tr>
                            <tr>
                                <td className="p-3">pH Meter (Digital)</td>
                                <td className="p-3">₹500-2000</td>
                                <td className="p-3">Amazon, Flipkart</td>
                            </tr>
                            <tr>
                                <td className="p-3">EC Meter</td>
                                <td className="p-3">₹800-3000</td>
                                <td className="p-3">Amazon, Agri stores</td>
                            </tr>
                            <tr>
                                <td className="p-3">Water Pump (18W)</td>
                                <td className="p-3">₹400-800</td>
                                <td className="p-3">Amazon, Aquarium shops</td>
                            </tr>
                            <tr>
                                <td className="p-3">Grow Lights (20W LED)</td>
                                <td className="p-3">₹600-1500</td>
                                <td className="p-3">Amazon, Electronics stores</td>
                            </tr>
                            <tr>
                                <td className="p-3">Nutrient Solution (A+B, 1L each)</td>
                                <td className="p-3">₹400-800</td>
                                <td className="p-3">Hydroponics stores, Online</td>
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
                    <h2 className="text-xl font-bold text-slate-900">Common Mistakes to Avoid</h2>
                </div>

                <div className="space-y-3">
                    {[
                        { mistake: 'Overwatering microgreens', solution: 'Spray lightly, keep moist not soggy' },
                        { mistake: 'Not checking pH daily', solution: 'Check pH every morning, adjust if needed' },
                        { mistake: 'Using tap water directly', solution: 'Use RO water or let tap water sit 24hrs to dechlorinate' },
                        { mistake: 'Too much light too early', solution: 'Keep in dark for 2-3 days during germination' },
                        { mistake: 'Ignoring EC levels', solution: 'EC too high = nutrient burn, too low = slow growth' },
                        { mistake: 'Poor air circulation', solution: 'Use fan for 2-4 hours/day to prevent mold' }
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
