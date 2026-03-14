import { calculateOptimalPrice } from '../../utils/mlIntelligence';
import { TrendingUp, TrendingDown, Package, ShoppingCart, IndianRupee, BarChart3, Sparkles, Store, Edit2, Save, X, Globe, RefreshCw, ArrowUpRight, Search, Map as MapIcon, Hammer, Box, Zap, Sprout, ShoppingBag, Droplets } from 'lucide-react';
import scrapingService from '../../services/scrapingService';

const cropPrices = [
    { name: 'Basil', price: 350, change: 12.3, trend: 'up', demand: 'Very High', season: 'Summer/Monsoon' },
    { name: 'Lettuce', price: 180, change: -2.1, trend: 'down', demand: 'High', season: 'Winter Standard' },
    { name: 'Sunflower', price: 150, change: 5.4, trend: 'up', demand: 'Medium', season: 'Year-Round' },
    { name: 'Arugula', price: 210, change: 0.8, trend: 'up', demand: 'High', season: 'Cool Season' },
    { name: 'Radish', price: 120, change: -1.5, trend: 'down', demand: 'Stable', season: 'Year-Round' }
];

const categories = [
    { id: 'crops', name: 'Crop Prices', icon: Sprout },
    { id: 'microgreens', name: 'Microgreens Kit', icon: Box },
    { id: 'hydroponics', name: 'Hydro Hardware', icon: Droplets },
    { id: 'automation', name: 'IoT & Sensors', icon: Zap }
];

const equipmentCatalog = {
    microgreens: [
        { item: 'Industrial Grow Rack (5-Tier)', price: 4500, capacity: '20 Trays/Rack', supplier: 'Agri-Steel India' },
        { item: '1020 Propagation Trays', price: 120, capacity: 'Standard', supplier: 'Mould-Tech' },
        { item: 'Full Spectrum LED Bar', price: 1200, capacity: '20W per bar', supplier: 'Photonics' }
    ],
    hydroponics: [
        { item: 'NFT Channel (110mm)', price: 850, capacity: '12ft / 24 plants', supplier: 'PipeLine' },
        { item: '200L Nutrient Tank', price: 5000, capacity: '200L', supplier: 'Everlast Tanks' },
        { item: 'High-Flow Water Pump', price: 2000, capacity: '1800 LPH', supplier: 'AquaFlow' }
    ],
    automation: [
        { item: 'Smart Controller (Agri-OS)', price: 1200, capacity: '6-Relay Hub', supplier: 'Agri-Tech DIY' },
        { item: 'Agri-Sensor Pro Kit', price: 3500, capacity: 'pH/EC/Temp', supplier: 'Datalogger Labs' },
        { item: 'Solenoid Valve (1/2")', price: 850, capacity: 'Standard', supplier: 'Valvo' }
    ]
};

const MarketPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('crops');
    const [editMode, setEditMode] = useState(false);
    const [customPrices, setCustomPrices] = useState({});
    const [weatherData, setWeatherData] = useState({ temp: 30, humidity: 45 });
    const [editingItem, setEditingItem] = useState(null);
    const [isScraping, setIsScraping] = useState(false);
    const [scrapedResults, setScrapedResults] = useState([]);

    const handleLiveScrape = async () => {
        setIsScraping(true);
        try {
            const results = await scrapingService.getMarketPrices('Microgreens');
            setScrapedResults(results);
        } catch (error) {
            console.error('Scraping error:', error);
        } finally {
            setIsScraping(false);
        }
    };

    useEffect(() => {
        const cached = localStorage.getItem('cGrow_weather_cache');
        if (cached) setWeatherData(JSON.parse(cached));
    }, []);

    const currentEquipment = useMemo(() => {
        return equipmentCatalog[selectedCategory] || [];
    }, [selectedCategory]);

    const getPrice = (category, idx) => {
        const id = `${category}_${idx}`;
        if (customPrices[id] !== undefined) return customPrices[id];
        return equipmentCatalog[category]?.[idx]?.price || 0;
    };

    const handleEditPrice = (category, idx, item) => {
        setEditingItem({ category, idx, item, currentPrice: getPrice(category, idx) });
    };

    const handleSavePrice = (newPrice) => {
        if (!editingItem) return;
        const price = parseFloat(newPrice);
        if (!isNaN(price)) {
            setCustomPrices(prev => ({
                ...prev,
                [`${editingItem.category}_${editingItem.idx}`]: price
            }));
        }
        setEditingItem(null);
    };

    const handleResetPrices = () => {
        if (window.confirm('Reset all catalog prices to factory defaults?')) {
            setCustomPrices({});
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
            {/* 1. TRADE HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-amber-600 p-8 rounded-[2.5rem] shadow-xl text-white">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white">
                        <Globe size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Trade Hub & Intel</h1>
                        <p className="text-amber-100 font-bold uppercase text-[10px] tracking-widest font-black">
                            External Market Trends • Benchmarking • Sourcing
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-amber-700/50 px-6 py-3 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-black uppercase text-amber-200 mb-1">Last Sync</p>
                        <p className="text-sm font-black flex items-center gap-2">
                            <RefreshCw size={14} className={isScraping ? "animate-spin" : "animate-spin-slow"} /> {isScraping ? 'SCRAPING...' : 'LIVE: DELHI NCR'}
                        </p>
                    </div>
                    <button 
                        onClick={handleLiveScrape}
                        disabled={isScraping}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors disabled:opacity-50"
                    >
                        <Search size={14} />
                        START DEEP SCRAPE
                    </button>
                </div>
            </div>

            {/* Scraped Results Display */}
            {scrapedResults.length > 0 && (
                <div className="bg-blue-900/5 border border-blue-200 p-6 rounded-[2rem] animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-900">
                            <Globe size={20} />
                            <h2 className="font-black text-lg">Web Scraped Intelligence</h2>
                        </div>
                        <button onClick={() => setScrapedResults([])} className="text-blue-400 hover:text-blue-600">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scrapedResults.map((res, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex justify-between items-center group hover:border-blue-300 transition-all">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Source: AgriFarming</p>
                                    <p className="font-bold text-slate-800 text-sm">{res.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-600 font-black">{res.price || 'N/A'}</p>
                                    <ArrowUpRight size={14} className="ml-auto text-blue-300 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Market Prices */}
            {selectedCategory === 'crops' && (
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
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-indigo-600 font-black uppercase tracking-widest">AI Suggested</span>
                                        <span className="text-sm font-black text-indigo-600">
                                            ₹{calculateOptimalPrice(crop.price, weatherData).suggested}/kg
                                        </span>
                                    </div>
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
            )}

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

