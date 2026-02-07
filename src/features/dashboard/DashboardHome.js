import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Sprout, Droplets, Thermometer, TrendingUp, ArrowRight, Activity, CloudRain, AlertTriangle, Shield, Wallet, Brain, BookOpen,
    Moon, Sun, ShoppingCart,
    Calendar, CheckCircle, Clock, Layout, Wind, Zap, Sparkles, Settings, Info, HelpCircle
} from 'lucide-react';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import StatBox from '../../components/common/StatBox';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { predictDiseaseRisk } from '../../utils/agronomyAlgorithms';
import { getHarvestStats } from '../../utils/harvestData';
import { getUpcomingHarvests, getIntelligentInsights } from '../../utils/predictions';
import { useMicrogreens } from '../microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../hydroponics/hooks/useHydroponics';
import { fetchMarketPrice } from '../../services/marketService';
import YieldChart from './YieldChart';
import HarvestTimeline from './HarvestTimeline';
import VPDWidget from '../../components/VPDWidget';
import StreakBadge from '../../components/StreakBadge';
import { generateContextAwareAlerts, analyzeTrend, calculateFarmHealth } from '../../utils/agriUtils';
import WeatherCard from './WeatherWidget';
import HealthMeter from './HealthMeter';

import { supabase } from '../../lib/supabaseClient';
import ScientificInfoModal from '../../components/ScientificInfoModal';

// PHASE 2 & 3: New Components
import { StaleDataAlert } from '../../components/StaleDataAlert';
import { CatchUpModal } from '../../components/CatchUpModal';
import { SimpleDashboard } from '../../components/SimpleDashboard';
import OnboardingTutorial from '../../components/OnboardingTutorial';
import { calculateHealthDecay, getTrendBasedDefaults } from '../../utils/trendAnalysis';
import { requestNotificationPermission, scheduleReminder, areNotificationsEnabled } from '../../utils/notificationUtils';
import { useGhostSync } from './hooks/useGhostSync';
import ErrorBoundary from '../../components/ErrorBoundary';
import { NFTSchematic, SensorNetworkDiagram } from '../../components/AgriTechVisuals';

const DashboardHome = () => {
    return (
        <ErrorBoundary>
            <DashboardContent />
        </ErrorBoundary>
    );
};

const DashboardContent = () => {
    const [slideIndex, setSlideIndex] = useState(0);
    const [weatherData, setWeatherData] = useState({ temp: null, humidity: null, rain: 0, solar: 0 });
    const [marketPrices, setMarketPrices] = useState({});
    const [loadingInsights, setLoadingInsights] = useState(true);
    const [showInfoModal, setShowInfoModal] = useState(false);

    // PHASE 2 & 3: New State
    const [showCatchUpModal, setShowCatchUpModal] = useState(false);
    const { isBeginnerMode, toggleMode, t } = useBeginnerMode();

    // Hooks for data
    const { batches } = useMicrogreens();
    const { systems } = useHydroponics();
    const queryClient = useQueryClient();

    // 1. QUERY: Harvest Stats
    const { data: harvestStats = {
        totalHarvests: 0,
        recentHarvests: 0,
        totalRevenue: 0,
        totalYield: 0,
        byType: { microgreens: 0, hydroponics: 0, total: 0 },
        averageYield: 0,
        averageRevenue: 0
    } } = useQuery({
        queryKey: ['harvest_records', 'stats'],
        queryFn: getHarvestStats,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // 2. QUERY: Recent Logs (Increased limit for master coverage)
    const { data: recentLogs = [] } = useQuery({
        queryKey: ['daily_logs', 'all_active'],
        queryFn: async () => {
            const { data } = await supabase
                .from('daily_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20); // Cover all active systems/batches
            return data || [];
        },
        staleTime: 2 * 60 * 1000, // 2 minutes - fresh data for dashboard
        cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false // Don't refetch on tab switch
    });

    // PHASE 2: Catch-up flow trigger
    useEffect(() => {
        if (!recentLogs || recentLogs.length === 0) return;

        const latestLog = recentLogs[0];
        const daysSinceLastLog = Math.floor(
            (Date.now() - new Date(latestLog.created_at)) / (1000 * 60 * 60 * 24)
        );

        // Trigger catch-up modal if user returns after 3+ days
        if (daysSinceLastLog >= 3 && !sessionStorage.getItem('catchup_shown')) {
            setShowCatchUpModal(true);
            sessionStorage.setItem('catchup_shown', 'true'); // Show once per session
        }
    }, [recentLogs]);

    // PHASE 5: Request notification permission and schedule reminders
    useEffect(() => {
        const initNotifications = async () => {
            // Only request once per session
            if (sessionStorage.getItem('notification_requested')) return;

            // Wait 5 seconds after dashboard load to avoid overwhelming user
            setTimeout(async () => {
                const hasPermission = await requestNotificationPermission();
                sessionStorage.setItem('notification_requested', 'true');

                // If permission granted, check if reminder needed
                if (hasPermission && recentLogs.length > 0) {
                    const latestLog = recentLogs[0];
                    scheduleReminder(new Date(latestLog.created_at));
                }
            }, 5000);
        };

        initNotifications();
    }, [recentLogs]);

    // PHASE 2: Handle catch-up completion
    const handleCatchUpComplete = async ({ answers, estimatedHealthDrop, daysMissed }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Apply health decay to all active crops
            const catchUpNotes = `Catch-up: ${daysMissed} days gap. ` +
                `Wilting: ${answers.wilting ? 'Yes' : 'No'}, ` +
                `Water maintained: ${answers.water_level ? 'Yes' : 'No'}, ` +
                `Pests: ${answers.pests ? 'Yes' : 'No'}, ` +
                `Overall: ${answers.general_health}. ` +
                `Estimated health drop: -${estimatedHealthDrop}%`;

            // Log catch-up entry for each active crop
            const catchUpLogs = allActiveCrops.map(crop => ({
                user_id: user.id,
                system_type: crop.itemType === 'microgreens' ? 'Microgreens' : 'Hydroponics',
                batch_id: crop.itemType === 'microgreens' ? crop.id : null,
                target_id: crop.itemType === 'hydroponics' ? crop.id : null,
                notes: catchUpNotes,
                health_score: Math.max(0, (crop.healthScore || 100) - estimatedHealthDrop),
                created_at: new Date().toISOString()
            }));

            await supabase.from('daily_logs').insert(catchUpLogs);

            setShowCatchUpModal(false);
            queryClient.invalidateQueries(['daily_logs']);
            alert(`✅ Catch-up complete! Health trends updated for ${catchUpLogs.length} crops.`);
        } catch (error) {
            console.error('Catch-up error:', error);
            alert('Error updating catch-up data');
        }
    };

    const latestLog = recentLogs.length > 0 ? recentLogs[0] : null;

    // 3. WEATHER (Cached & Protected)
    useEffect(() => {
        const loadWeather = async () => {
            try {
                const cachedWeather = localStorage.getItem('cGrow_weather_cache');
                const weatherTimestamp = localStorage.getItem('cGrow_weather_ts');
                const isWeatherFresh = weatherTimestamp && (Date.now() - parseInt(weatherTimestamp) < 1000 * 60 * 60);

                if (isWeatherFresh && cachedWeather) {
                    setWeatherData(JSON.parse(cachedWeather));
                } else {
                    const { fetchWeather } = await import('../../services/weatherService');
                    const fetchLocalWeather = async (lat, lon) => {
                        try {
                            const wData = await fetchWeather(lat, lon);
                            const cleanData = {
                                temp: wData.current.temp,
                                humidity: wData.current.humidity,
                                rain: wData.current.condition === 'Rain' ? 55 : 0,
                                solar: wData.current.solar
                            };
                            setWeatherData(cleanData);
                            localStorage.setItem('cGrow_weather_cache', JSON.stringify(cleanData));
                            localStorage.setItem('cGrow_weather_ts', Date.now().toString());
                            if (lat && lon) {
                                localStorage.setItem('cGrow_lat', lat);
                                localStorage.setItem('cGrow_lon', lon);
                            }
                        } catch (err) {
                            console.warn("Weather fallback (429/Offline):", err);
                            // CIRCUIT BREAKER: If API fails, save fallback to cache to STOP LOOPS
                            const fallbackData = {
                                temp: 22,
                                humidity: 50,
                                rain: 0,
                                solar: 0,
                                isFallback: true
                            };
                            setWeatherData(fallbackData);
                            localStorage.setItem('cGrow_weather_cache', JSON.stringify(fallbackData));
                            localStorage.setItem('cGrow_weather_ts', Date.now().toString());
                        }
                    };

                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                            (pos) => fetchLocalWeather(pos.coords.latitude, pos.coords.longitude),
                            () => fetchLocalWeather(),
                            { timeout: 5000 }
                        );
                    } else {
                        fetchLocalWeather();
                    }
                }
            } catch (e) {
                console.error("Weather Init Error:", e);
                // Last resort fallback
                setWeatherData({ temp: 22, humidity: 50, rain: 0, solar: 0 });
            }
        };
        loadWeather();
    }, []);

    // 4. MARKET PRICES (Depends on Active Crops)
    useEffect(() => {
        const loadMarketData = async () => {
            if (batches.length === 0 && systems.length === 0) return;

            try {
                const activeCrops = [...new Set([...batches, ...systems].map(i => i.crop))];
                if (activeCrops.length === 0) return;

                const pricePromises = activeCrops.map(async (crop) => {
                    const price = await fetchMarketPrice(crop);
                    return { crop, price };
                });
                const priceResults = await Promise.all(pricePromises);
                const prices = {};
                priceResults.forEach(r => prices[r.crop] = r.price);
                setMarketPrices(prices);
            } catch (e) {
                console.error("Market Data Error:", e);
            } finally {
                setLoadingInsights(false);
            }
        };
        loadMarketData();
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
            // Logic for Log Gaps
            needsCatchup: batches.some(b => b.needsCatchup) || systems.some(s => s.needsCatchup),
            missingDays: Math.max(0, ...batches.map(b => b.missingDays || 0), ...systems.map(s => s.missingDays || 0))
        };

        const alerts = generateContextAwareAlerts(sensorData, 'General');
        return alerts.filter(a => a.priority === 'CRITICAL' || a.priority === 'HIGH').slice(0, 3);
    }, [currentConditions, batches]);

    // PREDICTIVE ANALYTICS: Trend Detection
    const predictiveAlerts = useMemo(() => {
        if (!recentLogs || recentLogs.length < 3) return [];

        const trends = [
            analyzeTrend(recentLogs, 'ph'),
            analyzeTrend(recentLogs, 'ec'),
            analyzeTrend(recentLogs, 'vpd_kpa')
        ];

        return trends.filter(t => t.risk === 'HIGH');
    }, [recentLogs]);

    // Combined items for predictions
    const allActiveItems = useMemo(() => [
        ...batches.map(b => ({ ...b, itemType: 'microgreens' })),
        ...systems.map(s => ({ ...s, itemType: 'hydroponics' }))
    ], [batches, systems]);

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

    const allActiveCrops = useMemo(() => {
        const mg = batches.filter(b => b.status !== 'Harvested');
        const hydro = systems.filter(s => s.status !== 'Harvested');

        return [...mg, ...hydro].map(item => {
            // FIXED: Strict ID matching with system_type filter to prevent race conditions
            const isMicrogreens = item.itemType === 'microgreens' || !item.plant_date;
            const systemTypeFilter = isMicrogreens ? 'Microgreens' : 'Hydroponics';
            const matchField = isMicrogreens ? 'batch_id' : 'target_id';

            const latestLogForItem = recentLogs.find(l =>
                l[matchField] === item.id &&
                l.system_type === systemTypeFilter
            );

            return {
                ...item,
                // Prioritize the health_score directly from the logs table
                healthScore: latestLogForItem?.health_score !== undefined ? latestLogForItem.health_score : (item.healthScore || 0),
                lastUpdate: latestLogForItem?.created_at || item.lastLogDate,
                healthDetails: latestLogForItem?.details || item.healthDetails
            };
        });
    }, [batches, systems, recentLogs]);

    const farmHealthIndex = useMemo(() => {
        if (allActiveCrops.length === 0) return null;
        const total = allActiveCrops.reduce((sum, item) => sum + (item.healthScore || 0), 0);
        return Math.round(total / allActiveCrops.length) || 0;
    }, [allActiveCrops]);

    // NEW: Automated Ghost Log Sync (90+ QC Score Enhancement)
    const { isSyncing: ghostSyncActive, syncStats } = useGhostSync(allActiveCrops, recentLogs);

    const riskItems = useMemo(() => {
        return allActiveCrops
            .filter(item => (item.healthScore || 100) < 70)
            .map(item => ({
                name: item.crop || item.id,
                issue: item.healthDetails?.air === 'WARN' ? 'Air/VPD Issue' : item.healthDetails?.nutrient === 'WARN' ? 'Nutrient Issue' : 'General Check',
                score: item.healthScore
            }));
    }, [allActiveCrops]);




    // Phase 4: Dashboard Smart Alerts & Health Score Active

    return (
        <div className="flex flex-col gap-6">
            {/* HEADER & GLOBAL TOGGLE: Premium Header with attention guidance */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 relative">
                {/* Subtle Background Diagram */}
                <div className="absolute -top-10 -right-20 w-80 h-40 opacity-[0.03] pointer-events-none hidden lg:block">
                    <NFTSchematic />
                </div>

                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                        <span className="text-emerald-600">cGrow</span> Operations
                        <span className="text-emerald-500 animate-pulse"><Activity size={24} /></span>
                        {ghostSyncActive && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 animate-pulse">
                                <Sparkles size={12} className="text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Ghost Sync Active...</span>
                            </div>
                        )}
                        {syncStats.inserted > 0 && !ghostSyncActive && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                <CheckCircle size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Verified: {syncStats.inserted} Gap Logs Synced</span>
                            </div>
                        )}
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{t("Research Intelligence Dashboard", "Research Operations Hub")}</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 1-TAP OK BUTTON (Quick Accessibility: Always Visible) */}
                    <button
                        onClick={async () => {
                            if (!window.confirm("Log 'All Healthy' for all active crops?")) return;
                            try {
                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) return alert('Please log in');

                                const { data: recentUserLogs } = await supabase
                                    .from('daily_logs')
                                    .select('*')
                                    .eq('user_id', user.id)
                                    .order('created_at', { ascending: false })
                                    .limit(10);

                                const logsToInsert = [];
                                const timestamp = new Date().toISOString();

                                batches.filter(b => b.status !== 'Harvested').forEach(b => {
                                    const cropDefaults = getTrendBasedDefaults(recentUserLogs, b.crop);
                                    const healthCheck = calculateFarmHealth({
                                        temp: currentConditions.temp,
                                        humidity: currentConditions.humidity,
                                        ph: cropDefaults.ph,
                                        ec: cropDefaults.ec
                                    }, b.daysCurrent || 0, 'microgreens');

                                    logsToInsert.push({
                                        user_id: user.id,
                                        system_type: 'Microgreens',
                                        batch_id: b.id,
                                        visual_check: 'Looking Perfect ✨',
                                        notes: `1-Tap Log: Validated against local weather (${currentConditions.temp}°C). Defaults: ${cropDefaults._source.ph}/${cropDefaults._source.ec}`,
                                        created_at: timestamp,
                                        health_score: healthCheck.score,
                                        details: {
                                            airTemp: currentConditions.temp,
                                            humidity: currentConditions.humidity,
                                            ph: cropDefaults.ph,
                                            ec: cropDefaults.ec,
                                            lightHours: 16
                                        }
                                    });
                                });

                                systems.filter(s => s.status !== 'Harvested').forEach(s => {
                                    const healthCheck = calculateFarmHealth({
                                        temp: currentConditions.temp,
                                        humidity: currentConditions.humidity,
                                        ph: 6.0,
                                        ec: 1.8
                                    }, s.daysCurrent || 0, 'hydroponics', s.crop);

                                    logsToInsert.push({
                                        user_id: user.id,
                                        system_type: 'Hydroponics',
                                        target_id: s.id,
                                        visual_check: 'Crystal Clear & Green ✨',
                                        notes: `1-Tap Log: Validated against local weather (${currentConditions.temp}°C)`,
                                        created_at: timestamp,
                                        health_score: healthCheck.score,
                                        details: {
                                            airTemp: currentConditions.temp,
                                            humidity: currentConditions.humidity,
                                            ph: 6.0,
                                            ec: 1.8,
                                            lightHours: 16,
                                            waterTemp: 20
                                        }
                                    });
                                });

                                if (logsToInsert.length === 0) return alert('No active crops to log!');
                                const { error } = await supabase.from('daily_logs').insert(logsToInsert);
                                if (error) throw error;
                                alert(`✅ All nominal! Logged for ${logsToInsert.length} items.`);
                                queryClient.invalidateQueries({ queryKey: ['daily_logs'] });
                            } catch (err) {
                                alert('Error: ' + err.message);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all bg-emerald-500 text-white shadow-md shadow-emerald-100 hover:bg-emerald-600"
                    >
                        <CheckCircle size={14} /> 1-Tap OK
                    </button>



                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                        <button
                            onClick={() => toggleMode()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isBeginnerMode ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <Sparkles size={14} /> {t("New Farmer", "Beginner")}
                        </button>
                        <button
                            onClick={() => toggleMode()}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${!isBeginnerMode ? 'bg-slate-800 text-white shadow-md shadow-slate-300' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <Activity size={14} /> {t("Scientist", "Advanced")}
                        </button>
                    </div>
                </div>
            </div>

            {/* PHASE 2: Stale Data Warning */}
            <StaleDataAlert latestLog={latestLog} threshold={12} />

            {/* BENTO BOX GRID: Phase 6 Strict Hierarchy Implementation */}
            <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6">

                {/* 1. MASTER HEALTH (Dominant Primary) - md:col-span-12 or 5 */}
                <div className="md:col-span-5 row-span-2 group">
                    <div className="h-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full -mr-24 -mt-24 opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-[0.04] pointer-events-none">
                            <SensorNetworkDiagram />
                        </div>
                        <HealthMeter
                            latestLog={latestLog}
                            healthIndex={farmHealthIndex}
                            riskItems={riskItems}
                            dataAge={getTimeAgo(latestLog?.created_at)}
                            isStale={!currentConditions.isRealData}
                        />
                    </div>
                </div>

                {/* 2. PRIORITY ACTION (Secondary) - md:col-span-7 */}
                <div className="md:col-span-7 row-span-1">
                    <div className="h-full min-h-[220px] bg-slate-900 rounded-3xl overflow-hidden relative shadow-xl shadow-slate-900/20">
                        {/* Integrated Task Carousel into the Bento structure */}
                        <div className="p-8 h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="bg-slate-800 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30">
                                    {t("Research Objective", "Operational Priority")}
                                </span>
                                <Clock className="text-slate-500" size={20} />
                            </div>

                            <div className="mt-4">
                                {upcomingHarvests.length > 0 ? (
                                    <Link to={upcomingHarvests[0].itemType === 'hydroponics' ? '/hydroponics' : '/microgreens'} className="group block">
                                        <h2 className="text-3xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-tight">
                                            {t("Harvest Ready!", `Harvest ${upcomingHarvests[0].crop}`)}
                                        </h2>
                                        <p className="text-slate-400 font-medium">
                                            {upcomingHarvests[0].crop} is peaking. Est. Sales: ₹{Math.round(upcomingHarvests[0].predicted_yield / 1000 * (marketPrices[upcomingHarvests[0].crop] || 150)).toLocaleString()}
                                        </p>
                                    </Link>
                                ) : (
                                    <div>
                                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                                            {t("Farm is Stable", "No Critical Alerts")}
                                        </h2>
                                        <p className="text-slate-400 font-medium">Enjoy the peace. Your crops are growing strong.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mt-4">
                                <Link to="/tracker" className="w-max">
                                    <button className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg w-full md:w-auto">
                                        {t("Update Daily Log", "Daily Operations")} <ArrowRight size={18} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SUPPORTING METRICS (Small/Medium) - md:col-span-7 */}
                <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[240px]">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl shadow-blue-500/20 overflow-hidden text-white relative h-full">
                        <WeatherCard weather={weatherData} />
                        <div className="absolute top-4 right-4 group">
                            <HelpCircle size={16} className="text-white/50 hover:text-white cursor-help" />
                            <div className="absolute right-0 top-6 w-48 p-2 bg-slate-800 text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                <strong>Solar Activity:</strong> High solar radiation (&gt;400W/m²) triggers intense photosynthesis, causing plants to drink more water to stay cool.
                            </div>
                        </div>
                    </div>
                    <div className="h-full">
                        <VPDWidget
                            initialTemp={latestLog?.temp || weatherData?.temp}
                            initialHumidity={latestLog?.humidity || weatherData?.humidity}
                            isLive={currentConditions.isRealData}
                        />
                    </div>
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
                                        <span className="ml-2 group relative inline-block">
                                            <Info size={14} className="inline cursor-help opacity-60" />
                                            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                                <p className="font-bold border-b border-white/20 pb-1 mb-1">Scientific Theory: Disease Triangle</p>
                                                <p>Fungal/Bacterial outbreaks require three factors: a susceptible Host, a Pathogen, and a favorable Environment (High Humidity/Temp). Disrupting the environment stops the outbreak.</p>
                                            </div>
                                        </span>
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

            {/* PREDICTIVE ALERTS (Phase 2 Upgrade) */}
            {predictiveAlerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictiveAlerts.map((trend, idx) => (
                        <div key={idx} className="bg-orange-50 border-l-4 border-l-orange-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-800 text-sm">Early Warning: Trend Detected</h4>
                                <p className="text-xs text-orange-700 font-bold mt-1">{trend.message}</p>
                                <p className="text-[10px] text-orange-600 mt-1">Slope: {trend.slope} / day</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                        label="Total Production"
                        value={`${harvestStats.totalYield.toFixed(1)} kg`}
                        icon={TrendingUp}
                        subtext={`${harvestStats.totalHarvests} Harvests`}
                        trend="positive"
                    />
                </Link>
            </div>



            {/* ACTIONABLE ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* YIELD PERFORMANCE CHART (Replaces Growth Analysis) */}
                <div className="lg:col-span-2">
                    <YieldChart />
                </div>

                {/* HARVEST TIMELINE (Replaces Water Efficiency) */}
                <div className="lg:col-span-1">
                    <HarvestTimeline harvests={upcomingHarvests} />
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

            {/* PHASE 2: Catch-Up Modal */}
            {showCatchUpModal && latestLog && (
                <CatchUpModal
                    daysMissed={Math.floor((Date.now() - new Date(latestLog.created_at)) / (1000 * 60 * 60 * 24))}
                    onComplete={handleCatchUpComplete}
                    onClose={() => setShowCatchUpModal(false)}
                />
            )}

            {/* PHASE 5: Onboarding Tutorial */}
            <OnboardingTutorial />
        </div>
    );
};

export default DashboardHome;
