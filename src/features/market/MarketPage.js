import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, IndianRupee, BarChart3, Sparkles, Store, Edit2, Save, X } from 'lucide-react';

const MarketPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('crops');
    const [editMode, setEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [customPrices, setCustomPrices] = useState({});

    // Market Prices for Microgreens (India)
    const cropPrices = [
        { name: 'Radish (Mooli)', price: 180, change: +8.5, trend: 'up', demand: 'High', season: 'Year-round' },
        { name: 'Fenugreek (Methi)', price: 150, change: +5.2, trend: 'up', demand: 'High', season: 'Winter peak' },
        { name: 'Mustard (Sarson)', price: 160, change: -2.1, trend: 'down', demand: 'Medium', season: 'Year-round' },
        { name: 'Coriander (Dhania)', price: 220, change: +12.3, trend: 'up', demand: 'Very High', season: 'Year-round' },
        { name: 'Sunflower', price: 200, change: +6.8, trend: 'up', demand: 'High', season: 'Summer peak' },
        { name: 'Amaranth (Chaulai)', price: 170, change: +3.4, trend: 'up', demand: 'Medium', season: 'Monsoon peak' }
    ];

    // Equipment Prices (Comprehensive)
    const equipmentPrices = {
        hydroponics: [
            { item: 'NFT System (Basic)', capacity: '50 plants', price: 10000, supplier: 'Local vendors' },
            { item: 'NFT System (Pro)', capacity: '100 plants', price: 22000, supplier: 'Specialized suppliers' },
            { item: 'DWC System', capacity: '20 plants', price: 6500, supplier: 'DIY kits' },
            { item: 'Water Pump (18W)', capacity: '-', price: 600, supplier: 'Aquarium shops' },
            { item: 'Air Pump + Stone', capacity: '-', price: 450, supplier: 'Aquarium shops' },
            { item: 'pH Meter (Digital)', capacity: '-', price: 1200, supplier: 'Amazon, Flipkart' },
            { item: 'EC Meter', capacity: '-', price: 1800, supplier: 'Amazon, Agri stores' },
            { item: 'Grow Lights (20W LED)', capacity: '-', price: 1000, supplier: 'Electronics stores' },
            { item: 'Net Pots (50 pcs)', capacity: '-', price: 300, supplier: 'Hydroponics stores' },
            { item: 'Reservoir Tank (100L)', capacity: '-', price: 1200, supplier: 'Plastic vendors' }
        ],
        microgreens: [
            { item: 'Growing Trays (10x20")', capacity: '1 tray', price: 75, supplier: 'Gardening stores' },
            { item: 'Blackout Dome', capacity: '1 tray', price: 150, supplier: 'Gardening stores' },
            { item: 'Grow Rack (4 shelves)', capacity: '16 trays', price: 4000, supplier: 'Local fabricators' },
            { item: 'LED Grow Lights (40W)', capacity: '4 trays', price: 2000, supplier: 'Electronics stores' },
            { item: 'Spray Bottle', capacity: '-', price: 75, supplier: 'General stores' },
            { item: 'Harvesting Scissors', capacity: '-', price: 200, supplier: 'Gardening stores' }
        ],
        inputs: [
            { item: 'Cocopeat Block (5kg)', capacity: 'Expands to 75L', price: 125, supplier: 'Amazon, Nurseries' },
            { item: 'LECA (10L)', capacity: 'Reusable', price: 400, supplier: 'Hydroponics stores' },
            { item: 'Perlite (10L)', capacity: 'Lightweight', price: 325, supplier: 'Gardening stores' },
            { item: 'Rockwool Cubes (100 pcs)', capacity: 'For seedlings', price: 500, supplier: 'Hydroponics stores' },
            { item: 'Nutrient Solution (A+B, 1L)', capacity: 'Lasts 2-3 months', price: 600, supplier: 'Hydroponics stores' },
            { item: 'pH Down (500ml)', capacity: 'Adjust pH', price: 300, supplier: 'Hydroponics stores' },
            { item: 'pH Up (500ml)', capacity: 'Adjust pH', price: 300, supplier: 'Hydroponics stores' }
        ],
        seeds: [
            { item: 'Radish Seeds (500g)', capacity: '7 days harvest', price: 200, supplier: 'Seed suppliers' },
            { item: 'Fenugreek Seeds (500g)', capacity: '10 days harvest', price: 150, supplier: 'Seed suppliers' },
            { item: 'Mustard Seeds (500g)', capacity: '8 days harvest', price: 170, supplier: 'Seed suppliers' },
            { item: 'Coriander Seeds (500g)', capacity: '14 days harvest', price: 275, supplier: 'Seed suppliers' },
            { item: 'Amaranth Seeds (500g)', capacity: '12 days harvest', price: 240, supplier: 'Seed suppliers' },
            { item: 'Sunflower Seeds (500g)', capacity: '10 days harvest', price: 325, supplier: 'Seed suppliers' }
        ]
    };

    const categories = [
        { id: 'crops', name: 'Crop Prices', icon: Sparkles },
        { id: 'hydroponics', name: 'Hydroponics', icon: Package },
        { id: 'microgreens', name: 'Microgreens', icon: Package },
        { id: 'inputs', name: 'Growing Media', icon: ShoppingCart },
        { id: 'seeds', name: 'Seeds', icon: Store }
    ];

    // Apply custom prices if set
    const getPrice = (category, index) => {
        const key = `${category}_${index}`;
        return customPrices[key] !== undefined ? customPrices[key] : equipmentPrices[category][index].price;
    };

    const handleEditPrice = (category, index, item) => {
        setEditingItem({ category, index, item, currentPrice: getPrice(category, index) });
    };

    const handleSavePrice = (newPrice) => {
        const key = `${editingItem.category}_${editingItem.index}`;
        setCustomPrices(prev => ({ ...prev, [key]: Number(newPrice) }));
        setEditingItem(null);
    };

    const handleResetPrices = () => {
        setCustomPrices({});
        setEditMode(false);
    };

    const currentEquipment = equipmentPrices[selectedCategory] || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Market Intelligence & Equipment Prices</h1>
                <p className="text-slate-600">Real-time crop prices and comprehensive equipment catalog</p>
            </div>

            {/* Market Prices */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-emerald-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-900">Microgreens Market Prices (India)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cropPrices.map((crop) => (
                        <div key={crop.name} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-5 rounded-xl hover:border-emerald-300 transition-all cursor-pointer group shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{crop.name}</h3>
                                    <p className="text-xs text-slate-500">Delhi NCR Market</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${crop.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {crop.change > 0 ? '+' : ''}{crop.change}%
                                </span>
                            </div>

                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-3xl font-bold text-slate-900">₹{crop.price}</span>
                                <span className="text-sm text-slate-500">/ kg</span>
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Demand:</span>
                                    <span className={`font-bold ${crop.demand === 'Very High' ? 'text-emerald-600' :
                                        crop.demand === 'High' ? 'text-blue-600' : 'text-slate-600'
                                        }`}>{crop.demand}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Season:</span>
                                    <span className="font-bold text-slate-700">{crop.season}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-slate-400">7-day forecast</span>
                                {crop.trend === 'up' ? (
                                    <TrendingUp size={16} className="text-emerald-500" />
                                ) : (
                                    <TrendingDown size={16} className="text-red-500" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-6 rounded-xl">
                <div className="flex items-start gap-3">
                    <Sparkles className="text-indigo-600 mt-1" size={24} />
                    <div>
                        <h3 className="text-indigo-900 font-bold mb-2">🤖 AI Market Insight</h3>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            Based on current market trends, <strong>Coriander (Dhania)</strong> is showing a <span className="text-emerald-600 font-bold">+12.3%</span> upward trend due to festival season demand.
                            <strong> Recommendation:</strong> Increase production by 20% for next 2 weeks. Expected profit increase: ₹15,000-20,000.
                        </p>
                    </div>
                </div>
            </div>

            {/* Equipment Catalog */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Equipment Price Catalog</h2>
                    <div className="flex gap-2">
                        {Object.keys(customPrices).length > 0 && (
                            <button
                                onClick={handleResetPrices}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                                Reset Prices
                            </button>
                        )}
                        <button
                            onClick={() => setEditMode(!editMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${editMode
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Edit2 size={16} />
                            {editMode ? 'Editing Mode' : 'Edit Prices'}
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${selectedCategory === cat.id
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                <Icon size={16} />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* Crop Prices View */}
                {selectedCategory === 'crops' && (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-200">
                        <p className="text-emerald-900 font-bold mb-2">💰 Average Selling Prices</p>
                        <div className="grid md:grid-cols-2 gap-3">
                            {cropPrices.map(crop => (
                                <div key={crop.name} className="flex justify-between items-center p-3 bg-white rounded-lg">
                                    <span className="text-sm font-medium text-slate-700">{crop.name}</span>
                                    <span className="text-sm font-bold text-emerald-600">₹{crop.price}/kg</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-emerald-700 mt-4">
                            * Prices updated weekly based on Delhi NCR wholesale markets
                        </p>
                    </div>
                )}

                {/* Equipment List View */}
                {selectedCategory !== 'crops' && (
                    <div className="space-y-3">
                        {currentEquipment.map((item, idx) => {
                            const displayPrice = getPrice(selectedCategory, idx);
                            const isCustom = customPrices[`${selectedCategory}_${idx}`] !== undefined;

                            return (
                                <div key={idx} className={`flex justify-between items-center p-4 rounded-lg transition-colors ${isCustom ? 'bg-blue-50 border-2 border-blue-200' : 'bg-slate-50 hover:bg-slate-100'
                                    }`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900">{item.item}</p>
                                            {isCustom && (
                                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded font-bold">
                                                    CUSTOM
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-4 mt-1">
                                            <p className="text-xs text-slate-500">
                                                <span className="font-semibold">Capacity:</span> {item.capacity}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                <span className="font-semibold">Supplier:</span> {item.supplier}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-emerald-600">₹{displayPrice}</p>
                                            {isCustom && (
                                                <p className="text-xs text-slate-400 line-through">₹{item.price}</p>
                                            )}
                                        </div>
                                        {editMode && (
                                            <button
                                                onClick={() => handleEditPrice(selectedCategory, idx, item)}
                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-blue-900">Total Estimated Cost</p>
                                    <p className="text-xs text-blue-600">For complete setup</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">
                                    ₹{currentEquipment.reduce((sum, item, idx) => sum + getPrice(selectedCategory, idx), 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Price Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingItem(null)}>
                    <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Edit Price</h3>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-bold text-slate-700 mb-1">{editingItem.item.item}</p>
                            <p className="text-xs text-slate-500">Original price: ₹{editingItem.item.price}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">New Price (₹)</label>
                            <input
                                type="number"
                                defaultValue={editingItem.currentPrice}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-bold"
                                autoFocus
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSavePrice(e.target.value);
                                    }
                                }}
                                id="price-input"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingItem(null)}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const input = document.getElementById('price-input');
                                    handleSavePrice(input.value);
                                }}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={16} />
                                Save Price
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Market Insights */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Highest Demand</p>
                    <p className="text-2xl font-bold text-emerald-900">Coriander</p>
                    <p className="text-xs text-emerald-600 mt-1">+12.3% price increase</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-700 uppercase mb-2">Best Margin</p>
                    <p className="text-2xl font-bold text-blue-900">Sunflower</p>
                    <p className="text-xs text-blue-600 mt-1">₹200/kg selling price</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                    <p className="text-xs font-bold text-purple-700 uppercase mb-2">Year-Round</p>
                    <p className="text-2xl font-bold text-purple-900">Radish</p>
                    <p className="text-xs text-purple-600 mt-1">Consistent demand</p>
                </div>
            </div>
        </div>
    );
};

export default MarketPage;
