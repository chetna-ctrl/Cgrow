import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Droplets, Thermometer, TrendingUp, ArrowRight, Activity, CloudRain, AlertTriangle, Shield, Wallet, Brain, BookOpen } from 'lucide-react';
import StatBox from '../../components/common/StatBox';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { predictDiseaseRisk } from '../../utils/agronomyAlgorithms';
import { getHarvestStats } from '../../utils/harvestData';
import { getUpcomingHarvests, getIntelligentInsights } from '../../utils/predictions';
import { useMicrogreens } from '../microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../hydroponics/hooks/useHydroponics';
import { fetchMarketPrice } from '../../services/marketService';
import { Moon, Sun, ShoppingCart } from 'lucide-react';
import YieldChart from './YieldChart';
import HarvestTimeline from './HarvestTimeline';
import VPDWidget from '../../components/VPDWidget';
import StreakBadge from '../../components/StreakBadge';
import { generateContextAwareAlerts } from '../../utils/agriUtils';
import WeatherCard from './WeatherWidget';
import HealthMeter from './HealthMeter';

import { supabase } from '../../lib/supabase';
import ScientificInfoModal from '../../components/ScientificInfoModal';
// Phase 4: Dashboard Smart Alerts & Health Score Active

const DashboardHome = () => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [weatherData, setWeatherData] = useState({ temp: null, humidity: null, rain: 0, solar: 0 });
    const [marketPrices, setMarketPrices] = useState({});
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [latestLog, setLatestLog] = useState(null); // Store real farm log

    // Hooks for data
    const { batches } = useMicrogreens();
    const { systems } = useHydroponics();
    const [harvestStats, setHarvestStats] = useState({
        totalHarvests: 0,
        recentHarvests: 0,
        totalRevenue: 0,
        totalYield: 0,
        byType: { microgreens: 0, hydroponics: 0, total: 0 },
        averageYield: 0,
        averageRevenue: 0
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoadingInsights(true);
            try {
                // 1. Harvest Stats
                const stats = await getHarvestStats();
                setHarvestStats(stats);

                // 2. Weather & Solar (With Geolocation)
                const { fetchWeather } = await import('../../services/weatherService');

                const fetchLocalWeather = async (lat, lon) => {
                    const wData = await fetchWeather(lat, lon);
                    setWeatherData({
                        temp: wData.current.temp,
                        humidity: wData.current.humidity,
                        rain: wData.current.condition === 'Rain' ? 55 : 0,
                        solar: wData.current.solar
                    });
                };

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => fetchLocalWeather(pos.coords.latitude, pos.coords.longitude),
                        () => fetchLocalWeather() // Default
                    );
                } else {
                    fetchLocalWeather();
                }

                // 3. Real-Data: Fetch Latest Daily Log
                const { data: logs } = await supabase
                    .from('daily_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (logs && logs.length > 0) {
                    setLatestLog(logs[0]);
                }

                // 4. Market Prices (Parallel)
                const activeCrops = [...new Set([...batches, ...systems].map(i => i.crop))];
                const pricePromises = activeCrops.map(async (crop) => {
                    const price = await fetchMarketPrice(crop);
                    return { crop, price };
                });

                const priceResults = await Promise.all(pricePromises);

                const prices = {};
                priceResults.forEach(r => prices[r.crop] = r.price);
                setMarketPrices(prices);
            } catch (e) {
                console.error("Dashboard Data Error", e);
            } finally {
                setLoadingInsights(false);
            }
        };
        loadDashboardData();
    }, [batches, systems]);

    // REAL-TIME INTELLIGENCE: Prefer Actual Log Data ONLY if < 24 hours old
    const currentConditions = useMemo(() => {
        const isLogFresh = latestLog && (new Date() - new Date(latestLog.created_at) < 24 * 60 * 60 * 1000);

        return {
            temp: isLogFresh ? latestLog.temp : weatherData.temp,
            humidity: isLogFresh ? latestLog.humidity : weatherData.humidity,
            rain: weatherData.rain, // Always use weather API for rain forecast
            isRealData: !!isLogFresh
        };
    }, [latestLog, weatherData]);

    // NEW: Advanced Disease Risk Prediction (Using Real Data)
    const diseaseRisks = predictDiseaseRisk(currentConditions.temp, currentConditions.humidity, currentConditions.rain);
    const hasRisks = Array.isArray(diseaseRisks) && diseaseRisks.length > 0;
    const highestRisk = hasRisks ? diseaseRisks[0] : diseaseRisks;

    // SCIENTIFIC INTELLIGENCE: Generate Smart Alerts
    const smartAlerts = useMemo(() => {
        const sensorData = {
            airTemp: currentConditions.temp,
            humidity: currentConditions.humidity,
            waterTemp: 22, // Default, can be made dynamic
            ph: null,
            ec: null,
            dissolvedOxygen: null,
            lightHours: 16
        };

        const alerts = generateContextAwareAlerts(sensorData);
        return alerts.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH').slice(0, 3);
    }, [weatherData]);

    // Combined items for predictions
    const allActiveItems = [...batches, ...systems];
    const upcomingHarvests = getUpcomingHarvests(allActiveItems);

    // Dynamic Focus Items
    const focusItems = upcomingHarvests.length > 0
        ? upcomingHarvests.slice(0, 3).map(h => ({
            id: h.id || h.batch_id,
            title: `Harvest ${h.crop}`,
            type: h.days_until_harvest === 0 ? 'Urgent' : 'Info',
            desc: h.days_until_harvest === 0
                ? `${h.crop} is ready for harvest! Predicted yield: ${h.predicted_yield >= 1000 ? (h.predicted_yield / 1000).toFixed(2) + ' kg' : h.predicted_yield + 'g'}`
                : `${h.crop} will be ready in ${h.days_until_harvest} days. Est. Revenue: ₹${Math.round(h.predicted_revenue).toLocaleString()}`
        }))
        : [
            { id: 1, title: 'No Upcoming Harvests', type: 'Info', desc: 'Sow new batches to see predictions here.' },
            { id: 2, title: 'Market Opportunity', type: 'Info', desc: 'Basil prices up 15% in local mandi.' }
        ];

    const nextSlide = () => setSlideIndex((prev) => (prev + 1) % focusItems.length);
    const currentFocus = focusItems[slideIndex] || focusItems[0];


    return (
        <div className="flex flex-col gap-8">

            {/* INTELLIGENT INSIGHTS (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {allActiveItems.length > 0 && getIntelligentInsights(allActiveItems[0].crop, { current: weatherData }, marketPrices[allActiveItems[0].crop]).map((insight, idx) => (
                    <Card key={idx} className="bg-white border-l-4 border-l-blue-500 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                {insight.icon === 'Moon' ? <Moon size={20} /> : insight.icon === 'Sun' ? <Sun size={20} /> : <ShoppingCart size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-slate-800">{insight.title}</h4>
                                <p className="text-[10px] text-slate-500">{insight.message}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* NEW: WEATHER & HEALTH ENGINE (Master Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weather Widget (2 Cols) */}
                <div className="md:col-span-2">
                    <WeatherCard weather={weatherData} />
                </div>
                {/* Master Health Meter (1 Col) */}
                <div className="md:col-span-1 h-full">
                    <HealthMeter latestLog={latestLog} />
                </div>
            </div>

            {/* DISEASE RISK ALERTS (UPGRADED) */}
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
                                    </h3>
                                    <p className="text-xs text-slate-600 mt-1">{risk.symptoms}</p>
                                    <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                            <Shield size={12} /> Prevention:
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">{risk.prevention}</p>
                                    </div>
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-[10px] font-bold uppercase ${risk.urgency === 'Immediate' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
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

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-700 text-xl">Overview of your operations.</p>
                </div>
                <div className="bg-emerald-100/50 text-emerald-800 px-5 py-2 rounded-full font-bold flex items-center gap-2 border border-emerald-200">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span> Live
                </div>
            </div>

            {/* PRIORITY TASK CAROUSEL (FIXED TEXT COLOR) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Priority Task ({slideIndex + 1}/{focusItems.length})
                    </p>
                    <h2 className="text-white text-2xl font-bold mb-2">{currentFocus.title}</h2>
                    <p className="text-slate-300 text-sm mb-4">{currentFocus.desc}</p>
                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentFocus.type === 'Urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            currentFocus.type === 'Warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                            {currentFocus.type}
                        </span>
                        <button
                            onClick={nextSlide}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-full transition-all"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                    {/* Carousel Dots */}
                    <div className="flex gap-2 mt-4">
                        {focusItems.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all ${idx === slideIndex ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Link to="/microgreens" className="block hover:scale-[1.02] transition-transform">
                    <StatBox
                        label="Active Batches"
                        value={batches.filter(b => b.status !== 'Harvested').length}
                        icon={Sprout}
                        subtext="Microgreens"
                        trend="positive"
                    />
                </Link>
                <Link to="/finance" className="block hover:scale-[1.02] transition-transform">
                    <StatBox
                        label="Total Revenue"
                        value={`₹${Math.round(harvestStats.totalRevenue).toLocaleString()}`}
                        icon={Wallet}
                        subtext="Life-time Earnings"
                        trend="positive"
                        trendValue="Live"
                    />
                </Link>
                <Link to="/hydroponics" className="block hover:scale-[1.02] transition-transform">
                    <StatBox
                        label="Active Systems"
                        value={systems.length}
                        icon={Activity}
                        subtext="Hydroponics"
                        trend="stable"
                    />
                </Link>
                <Link to="/analytics" className="block hover:scale-[1.02] transition-transform">
                    <StatBox
                        label="Total Yield"
                        value={`${harvestStats.totalYield.toFixed(1)} kg`}
                        icon={TrendingUp}
                        subtext={`${harvestStats.totalHarvests} Harvests`}
                        trend="positive"
                    />
                </Link>
            </div>

            {/* SMART TOOLS: VPD & STREAK */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                            {currentConditions.isRealData ? '📍 Actual Farm Conditions' : '🌤️ Weather Estimate'}
                        </span>
                        {currentConditions.isRealData && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                                Live from Log
                            </span>
                        )}
                    </div>
                    <VPDWidget initialTemp={currentConditions.temp} initialHumidity={currentConditions.humidity} />
                </div>
                <StreakBadge showDetails={true} />
            </div>

            {/* ACTIONABLE ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* YIELD PERFORMANCE CHART (Replaces Growth Analysis) */}
                <div className="lg:col-span-2">
                    <YieldChart />
                </div>

                {/* HARVEST TIMELINE (Replaces Water Efficiency) */}
                <div className="lg:col-span-1">
                    <HarvestTimeline />
                </div>
            </div>

            {/* Scientific Intelligence Help Button */}
            <button
                onClick={() => setShowInfoModal(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
                title="Learn about the Science"
            >
                <BookOpen size={24} />
            </button>

            {/* Scientific Info Modal */}
            <ScientificInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
        </div>
    );
};

export default DashboardHome;
