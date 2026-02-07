import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Save, Sprout, Droplets, AlertTriangle, CheckCircle, BookOpen, Download, Sun, Info, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { calculateStreak } from '../../utils/agronomyLogic';
import { calculateDays } from '../../utils/predictions';
import { useMicrogreens } from '../microgreens/hooks/useMicrogreens';
import { useHydroponics } from '../hydroponics/hooks/useHydroponics';
import {
    calculateDailyGDD,
    estimatePPFD,
    getDailyTaskAdvice,
    getCropParams,
    MANUAL_PATTERNS,
    calculateFarmHealth,
    LIGHTING_OPTIONS,
    WEATHER_CONDITIONS,
    calculateVPD,
    analyzeNutrientHealth
} from '../../utils/agriUtils';
import { detectThermalStress } from '../../utils/agronomyAlgorithms'; // Fixed Import Source
import { CheckSquare, ClipboardList, Activity, Search, HelpCircle, Wind } from 'lucide-react'; // Restored/Consolidated
import ScientificInfoModal from '../../components/ScientificInfoModal';
import { useBeginnerMode } from '../../context/BeginnerModeContext';
import CostCalculator from '../../components/CostCalculator';




const INTERVENTION_OPTIONS = [
    { value: 'NO_ACTION', label: 'No Action Needed (Routine Check)' },
    { value: 'ADJUST_PH_DOWN', label: '🧪 Added pH Down (Acid)' },
    { value: 'ADJUST_PH_UP', label: '🧪 Added pH Up (Base)' },
    { value: 'ADDED_NUTRIENTS_AB', label: '🍼 Added Nutrients (Sol A+B)' },
    { value: 'ADDED_WATER', label: '💧 Top-up Water' },
    { value: 'FLUSH_SYSTEM', label: '🚿 Flushed System (Water Change)' },
    { value: 'SPRAY_NEEM', label: '🛡️ Sprayed Neem Oil/Pesticide' },
    { value: 'SPRAY_H2O2', label: '🚑 Root Treatment (H2O2)' },
    { value: 'ADJUST_LIGHT_HEIGHT', label: '💡 Adjusted Light Height' },
    { value: 'ADJUST_LIGHT_HOURS', label: '⏰ Changed Light Schedule' },
    { value: 'HARVEST_PARTIAL', label: '✂️ Partial Harvest' }
];



// --- NEW COMPONENT: SCIENTIFIC CITATION TOOLTIP ---
const ResearchTooltip = () => (
    <div className="group relative inline-block ml-1 align-middle z-50">
        <Info size={14} className="text-gray-400 cursor-help hover:text-blue-600 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-600">
            <h5 className="font-bold text-blue-300 border-b border-slate-600 pb-1 mb-2">🔬 Research Sources:</h5>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 leading-tight">
                <li><strong className="text-white">Purdue Univ. Extension:</strong> defined the optimal DLI range (12-17 mol) for Leafy Greens.</li>
                <li><strong className="text-white">Cornell CEA:</strong> Linear Light Decay logic (for Tube LEDs) vs Inverse Square Law.</li>
                <li><strong className="text-white">Tetens Formula:</strong> Used for precise VPD (Air Drying Power) calculation.</li>
            </ul>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-600"></div>
        </div>
    </div>
);

const ScientificContextTooltip = ({ title, content }) => (
    <div className="group relative inline-block ml-1 align-middle z-50">
        <HelpCircle size={12} className="text-blue-400 cursor-help hover:text-blue-600 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <p className="font-bold border-b border-white/20 pb-1 mb-1">{title}</p>
            <p>{content}</p>
        </div>
    </div>
);

// --- NEW COMPONENT: VISUAL DLI METER ---
const DLIMeter = ({ source, hours, weather, setDistance, distance }) => {
    const calculateAdvancedPPFD = () => {
        let basePPFD = estimatePPFD(source, weather);
        const distFactor = distance === 'far' ? 0.5 : 1.0;
        return basePPFD * distFactor;
    };

    const ppfd = calculateAdvancedPPFD();
    const dli = (ppfd * (parseFloat(hours) || 0) * 0.0036).toFixed(1);
    const rotation = Math.min((dli / 30) * 180, 180);

    let color = '#FBBF24'; // Yellow
    let status = 'Weak 🌑';
    if (dli >= 10 && dli <= 18) {
        color = '#10B981'; // Green
        status = 'Perfect 🌱';
    } else if (dli > 18) {
        color = '#EF4444'; // Red
        status = 'Too Intense 🔥';
    }

    return (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center relative overflow-visible h-full justify-between">
            <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex items-center justify-center">
                Light Intensity (DLI)
                <ResearchTooltip />
            </h4>
            <div className="relative w-32 h-16 mb-2">
                <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-t-full"></div>
                <div className="absolute top-full left-1/2 w-1 h-16 origin-top -translate-x-1/2 transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg) scaleY(-1)`, backgroundColor: 'black' }}
                >
                    <div className="w-3 h-3 bg-black rounded-full absolute top-0 left-1/2 -translate-x-1/2"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-2 flex">
                    <div className="w-1/3 h-full bg-yellow-300 rounded-bl-full"></div>
                    <div className="w-1/3 h-full bg-green-400"></div>
                    <div className="w-1/3 h-full bg-red-400 rounded-br-full"></div>
                </div>
            </div>
            <div className="text-center z-10">
                <span className="text-3xl font-black text-gray-800">{dli}</span>
                <span className="text-xs text-gray-500 block">mol / m² / day</span>
                <span className="text-xs font-bold mt-1 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>{status}</span>
            </div>
            <div className="mt-3 w-full flex bg-white rounded-lg border border-gray-300 p-1">
                <button onClick={() => setDistance('close')} className={`flex-1 text-[10px] font-bold py-1 rounded ${distance === 'close' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}>Close (&lt;1ft)</button>
                <button onClick={() => setDistance('far')} className={`flex-1 text-[10px] font-bold py-1 rounded ${distance === 'far' ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}>Far (&gt;1ft)</button>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS FOR SMART ASSISTANT ---

const HydroGuide = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen size={16} /> Hydroponics Quick Guide
        </h4>
        <ul className="space-y-2 text-blue-900">
            <li className="flex gap-2">
                <span className="font-bold min-w-[60px]">pH:</span>
                <span>5.5 - 6.5. <span className="text-xs text-blue-700 block">High (&gt;7) = Nutrient blockage (Yellowing). Low (&lt;5) = Root damage.</span></span>
            </li>
            <li className="flex gap-2">
                <span className="font-bold min-w-[60px]">Food (EC):</span>
                <span>1.2 - 2.5 (mS/cm). <span className="text-xs text-blue-700 block">Low = Hungry Plants. High = Tip Burn.</span></span>
            </li>
            <li className="flex gap-2">
                <span className="font-bold min-w-[60px]">Temp:</span>
                <span>18°C - 24°C. <span className="text-xs text-red-600 block">&gt;25°C = Root Rot Risk! Use chiller/ice.</span></span>
            </li>
        </ul>
    </div>
);

// NutrientCalculator removed to simplify Daily Tracker. Use Dashboard for Calculator.

const DailyTrackerPage = () => {
    const location = useLocation(); // <--- Added this
    const { isBeginnerMode, t } = useBeginnerMode();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [lightDist, setLightDist] = useState('close'); // New DLI Distance Logic

    // State for Forms
    const [microgreensEntry, setMicrogreensEntry] = useState({
        batchId: '',
        visualCheck: '',
        humidity: '',
        temperature: '',
        wateringSystem: '',
        lightingSource: 'LED_TUBES_WHITE',
        lightHours: '14',
        weatherCondition: 'Sunny',
        notes: '',
        intervention: 'NO_ACTION', // Default
        visualSymptoms: [], // New: For manual observation
        manualAir: '', // New: For manual air quality selection
        nutrientStrength: '', // New: For manual nutrient strength selection
        trayWeight: '', // New: For manual weight check (Heuristic)
        fanStatus: 'ON' // New: For Burp Alert Logic
    });

    const [trayType, setTrayType] = useState('SINGLE'); // 'SINGLE' or 'DOUBLE'

    // BUSINESS SETTINGS (Local State for now)
    const [elecRate, setElecRate] = useState(8); // ₹ per Unit
    const [setupWatts, setSetupWatts] = useState(200); // Total Watts

    const [hydroponicsEntry, setHydroponicsEntry] = useState({
        targetId: '',
        visualCheck: '',
        ph: '',
        ec: '',
        waterTemp: '',
        waterLevel: 'OK',
        temperature: '',
        humidity: '',
        lightingSource: 'GROW_LIGHTS_FULL',
        lightHours: '16',
        weatherCondition: 'Sunny',
        notes: '',
        intervention: 'NO_ACTION', // Default
        visualSymptoms: [], // New: For manual observation
        manualAir: '', // New: For manual air quality selection
        nutrientStrength: '', // New: For manual nutrient strength selection
        pumpStatus: 'ON',
        waterFlow: 'Normal',
        airStones: 'Bubbling',
        hydrationStress: false,
        lastCycleTime: ''
    });

    const [streak, setStreak] = useState(0);
    const [smartAdvice, setSmartAdvice] = useState(null);

    // Hooks
    const { batches } = useMicrogreens();
    const { systems } = useHydroponics();

    const activeBatches = useMemo(() => batches.filter(b => b.status && !b.status.toLowerCase().includes('harvested')), [batches]);
    const activeSystems = useMemo(() => systems.filter(s => s.status && !s.status.toLowerCase().includes('harvested')), [systems]);

    // NEW: Handle Deep Linking from Dashboard
    useEffect(() => {
        if (location.state?.batchId) {
            setMicrogreensEntry(prev => ({ ...prev, batchId: location.state.batchId }));
            // Smooth scroll to Microgreens section
            document.getElementById('microgreens-section')?.scrollIntoView({ behavior: 'smooth' });
        }
        if (location.state?.targetId) {
            setHydroponicsEntry(prev => ({ ...prev, targetId: location.state.targetId }));
            document.getElementById('hydroponics-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location.state]);

    // Calculate Smart Advice when Batch Changes or Inputs Change
    useEffect(() => {
        if (microgreensEntry.batchId) {
            const batch = activeBatches.find(b => b.id == microgreensEntry.batchId);
            if (batch) {
                // Pass all params to the new signature: (batch, lightHours, humidity, trayWeight)
                const lightHours = parseFloat(microgreensEntry.lightHours) || 0;
                const humidity = parseFloat(microgreensEntry.humidity) || null;
                const trayWeight = microgreensEntry.trayWeight || 'NORMAL';
                const fanStatus = microgreensEntry.fanStatus || 'ON';

                const advice = getDailyTaskAdvice(batch, lightHours, humidity, trayWeight, fanStatus, trayType);
                setSmartAdvice(advice);
            }
        } else {
            setSmartAdvice(null);
        }
    }, [microgreensEntry.batchId, microgreensEntry.humidity, microgreensEntry.trayWeight, microgreensEntry.lightHours, microgreensEntry.fanStatus, activeBatches, trayType]);

    // Calculate VPD
    const vpdData = useMemo(() => {
        const temp = parseFloat(microgreensEntry.temperature);
        const humidity = parseFloat(microgreensEntry.humidity);
        if (temp && humidity && temp > 0 && humidity > 0) {
            return calculateVPD(temp, humidity);
        }
        return null;
    }, [microgreensEntry.temperature, microgreensEntry.humidity]);


    // Calculate Nutrient Health
    const nutrientWarnings = useMemo(() => {
        const ph = parseFloat(hydroponicsEntry.ph);
        const ec = parseFloat(hydroponicsEntry.ec);
        const waterTemp = parseFloat(hydroponicsEntry.waterTemp);
        const airTemp = parseFloat(hydroponicsEntry.temperature);

        if (ph || ec || waterTemp) {
            return analyzeNutrientHealth({
                ph, ec, waterTemp, airTemp, dissolvedOxygen: null
            });
        }
        return [];
    }, [hydroponicsEntry.ph, hydroponicsEntry.ec, hydroponicsEntry.waterTemp, hydroponicsEntry.temperature]);


    // INTELLIGENCE: Thermal Stress (Invisible Check)
    const thermalAlert = useMemo(() => {
        const temp = parseFloat(hydroponicsEntry.temperature);
        if (!temp || !hydroponicsEntry.targetId) return null;

        const selectedSystem = activeSystems.find(s => s.id == hydroponicsEntry.targetId);
        // Map generic crop names to library IDs if needed, or rely on loose matching in algorithm
        const cropId = selectedSystem?.crop || 'Lettuce';

        return detectThermalStress(cropId, temp);
    }, [hydroponicsEntry.temperature, hydroponicsEntry.targetId, activeSystems]);


    // Load streak
    useEffect(() => {
        const loadStreak = async () => {
            // Removed isDemoMode() check
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: logs } = await supabase
                .from('daily_logs')
                .select('created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(60);
            setStreak(calculateStreak(logs || []));
        };
        loadStreak();
    }, []);

    // OFFLINE SYNC LOGIC
    useEffect(() => {
        const syncOfflineLogs = async () => {
            const queue = JSON.parse(localStorage.getItem('offline_logs_queue') || '[]');
            if (queue.length > 0 && navigator.onLine) {
                console.log("Attempting to sync", queue.length, "logs...");
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    // FIXED: Use upsert with conflict resolution to prevent overwriting newer data
                    const logsToInsert = queue.map(log => ({
                        ...log,
                        user_id: user.id,
                        // Ensure we have a unique identifier for conflict resolution
                        sync_id: log.sync_id || `${user.id}_${log.created_at}`
                    }));

                    const { error } = await supabase
                        .from('daily_logs')
                        .upsert(logsToInsert, {
                            onConflict: 'sync_id',
                            ignoreDuplicates: false
                        });

                    if (!error) {
                        alert(`✅ Synced ${queue.length} offline logs to cloud!`);
                        localStorage.removeItem('offline_logs_queue');
                        window.location.reload(); // Refresh to update streaks/logs
                    }
                } catch (e) {
                    console.error("Sync failed", e);
                }
            }
        };

        window.addEventListener('online', syncOfflineLogs);
        // Try on mount too
        setTimeout(syncOfflineLogs, 2000);

        return () => window.removeEventListener('online', syncOfflineLogs);
    }, []);

    // SAVE LOGIC
    const handleSave = async (e, type) => {
        e.preventDefault();
        setLoading(true);
        try {
            const logData = {
                system_type: type,
                notes: type === 'Microgreens' ? microgreensEntry.notes : hydroponicsEntry.notes,
                created_at: new Date().toISOString(),
                intervention_actions: type === 'Microgreens'
                    ? (microgreensEntry.intervention !== 'NO_ACTION' ? [microgreensEntry.intervention] : [])
                    : (hydroponicsEntry.intervention !== 'NO_ACTION' ? [hydroponicsEntry.intervention] : [])
            };

            let derivedMetrics = {};

            if (type === 'Microgreens') {
                logData.batch_id = microgreensEntry.batchId || null;
                logData.visual_check = microgreensEntry.visualCheck;
                logData.humidity = parseFloat(microgreensEntry.humidity) || null;
                logData.temp = parseFloat(microgreensEntry.temperature) || null;
                logData.watering_system = microgreensEntry.wateringSystem;
                logData.observation_tags = microgreensEntry.visualSymptoms; // Ensure column exists or use details

                // Save Lighting Data for ML
                logData.lighting_source = microgreensEntry.lightingSource;
                logData.light_hours_per_day = parseFloat(microgreensEntry.lightHours) || 0;

                // VPD Calculation
                const vpdData = (logData.temp && logData.humidity) ? calculateVPD(logData.temp, logData.humidity) : null;
                if (vpdData) {
                    derivedMetrics.vpd_kpa = vpdData.vpd_kpa;
                    derivedMetrics.vpd_risk_factor = vpdData.risk_factor;
                }

                // GDD Calculation
                if (logData.temp) {
                    const selectedBatch = activeBatches.find(b => b.id == microgreensEntry.batchId);
                    const cropName = selectedBatch ? selectedBatch.crop : 'Lettuce';
                    const gdd = calculateDailyGDD(logData.temp + 2, logData.temp - 2, cropName);
                    derivedMetrics.gdd_daily = gdd;
                }

                // DLI Calculation
                const ppfd = estimatePPFD(microgreensEntry.lightingSource, microgreensEntry.weatherCondition);
                const dli = (ppfd * (parseFloat(microgreensEntry.lightHours) || 0) * 0.0036).toFixed(2);
                derivedMetrics.dli_mol_per_m2 = parseFloat(dli);

                // Prepare Details JSONB
                logData.details = {
                    light: 'OK', // Default, updated by calculateFarmHealth
                    manual_air_quality: microgreensEntry.manualAir,
                    isManualEstimate: !logData.humidity && !!microgreensEntry.manualAir
                };

                const logForHealth = {
                    ...logData,
                    observation_tags: microgreensEntry.visualSymptoms
                };
                const selectedBatchObject = activeBatches.find(b => b.id == microgreensEntry.batchId);
                const batchAge = selectedBatchObject ? calculateDays(selectedBatchObject.sow_date, new Date()) : 99;
                const healthRes = calculateFarmHealth(logForHealth, batchAge, 'microgreens', selectedBatchObject?.crop);

                derivedMetrics.health_score = healthRes.score;
                derivedMetrics.alert_severity = healthRes.details.air === 'DANGER' || healthRes.details.nutrient === 'DANGER' ? 'HIGH' : 'NONE';

            } else {
                // Hydroponics Data
                logData.target_id = hydroponicsEntry.targetId;
                logData.ph = parseFloat(hydroponicsEntry.ph) || null;
                logData.ec = parseFloat(hydroponicsEntry.ec) || null;
                logData.water_temp = parseFloat(hydroponicsEntry.waterTemp) || null;
                logData.water_level = hydroponicsEntry.waterLevel;
                logData.temp = parseFloat(hydroponicsEntry.temperature) || null;
                // Add tag if thermal stress detected automatically
                if (thermalAlert && thermalAlert.risk === 'High') {
                    // Auto-tag thermal stress for record
                    logData.details = { ...logData.details, thermal_stress: thermalAlert.status };
                }

                logData.humidity = parseFloat(hydroponicsEntry.humidity) || null;
                logData.observation_tags = hydroponicsEntry.visualSymptoms;

                // Prepare Details JSONB
                logData.details = {
                    manual_air_quality: hydroponicsEntry.manualAir,
                    nutrient_strength: hydroponicsEntry.nutrientStrength,
                    isManualEstimate: (!logData.ph && !logData.ec) && (!!hydroponicsEntry.visualSymptoms?.length || !!hydroponicsEntry.nutrientStrength)
                };

                // GDD Calculation (Hydroponics)
                if (logData.temp) {
                    const selectedSystem = activeSystems.find(s => s.id == hydroponicsEntry.targetId);
                    const cropName = selectedSystem ? selectedSystem.crop : 'Lettuce';
                    derivedMetrics.gdd_daily = calculateDailyGDD(logData.temp + 2, logData.temp - 2, cropName);
                }

                // Save Lighting Data
                logData.lighting_source = hydroponicsEntry.lightingSource;
                logData.light_hours_per_day = parseFloat(hydroponicsEntry.lightHours) || 0;

                // DLI Calculation
                const ppfd = estimatePPFD(hydroponicsEntry.lightingSource, hydroponicsEntry.weatherCondition);
                const dli = (ppfd * (parseFloat(hydroponicsEntry.lightHours) || 0) * 0.0036).toFixed(2);
                derivedMetrics.dli_mol_per_m2 = parseFloat(dli);

                // Unified Health Score via Engine
                const selectedSystem = activeSystems.find(s => s.id == hydroponicsEntry.targetId);
                const batchAge = selectedSystem ? calculateDays(selectedSystem.plant_date, new Date()) : 99;

                // Add Sub-Type Telemetry to Log Data for Health Engine
                logData.system_type = selectedSystem?.system_type || 'NFT';
                logData.pump_status = hydroponicsEntry.pumpStatus;
                logData.water_flow = hydroponicsEntry.waterFlow;
                logData.air_stones = hydroponicsEntry.airStones;
                logData.hydration_stress = hydroponicsEntry.hydrationStress;
                logData.last_cycle_time = parseFloat(hydroponicsEntry.lastCycleTime) || 0;

                // Also store in details for record keeping
                logData.details = {
                    ...logData.details,
                    pump_status: logData.pump_status,
                    water_flow: logData.water_flow,
                    air_stones: logData.air_stones,
                    hydration_stress: logData.hydration_stress,
                    last_cycle_time: logData.last_cycle_time
                };

                const healthRes = calculateFarmHealth(logData, batchAge, 'hydroponics', selectedSystem?.crop);

                derivedMetrics.health_score = healthRes.score;
                derivedMetrics.alert_severity = healthRes.details.air === 'DANGER' || healthRes.details.nutrient === 'DANGER' ? 'HIGH' : 'NONE';
            }

            const enhancedLogData = { ...logData, ...derivedMetrics };

            // OFFLINE CHECK
            if (!navigator.onLine) {
                const existingQueue = JSON.parse(localStorage.getItem('offline_logs_queue') || '[]');
                existingQueue.push(enhancedLogData);
                localStorage.setItem('offline_logs_queue', JSON.stringify(existingQueue));
                alert("💾 Saved to Offline Queue! Will sync when internet returns.");
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not logged in');
                const { error } = await supabase.from('daily_logs').insert([{ ...enhancedLogData, user_id: user.id }]);
                if (error) throw error;

                // Invalidate all views that depend on daily logs
                // We explicitely invalidate specific keys to force re-renders in Dashboard and System pages
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['daily_logs'] }),
                    queryClient.invalidateQueries({ queryKey: ['microgreens'] }),
                    queryClient.invalidateQueries({ queryKey: ['hydroponics'] }),
                    queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] })
                ]);

                setStreak(streak + 1);
                alert("✅ Log saved successfully!");
            }
        } catch (err) {
            alert('❌ Error saving log: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // SMART CSV EXPORT (Pro Version)
    const exportToCSV = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { alert('Please log in'); return; }
            const { data } = await supabase.from('daily_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            const logs = data || [];
            if (logs.length === 0) { alert('No data to export'); return; }

            // 1. AGGREGATION: Latest Entry Wins per ID per Date
            // Key format: SystemType_ID_Date
            const uniqueEntries = {};
            logs.forEach(log => {
                const dateKey = new Date(log.created_at).toLocaleDateString();
                const idKey = log.batch_id || log.target_id || log.system_id || 'Unknown';
                const uniqueKey = `${log.system_type}_${idKey}_${dateKey}`;

                // Since logs are ordered DESC by created_at, the first one we encounter is the latest.
                if (!uniqueEntries[uniqueKey]) {
                    uniqueEntries[uniqueKey] = log;
                }
            });
            const aggregatedLogs = Object.values(uniqueEntries);

            // 2. PROCESSING & CLEANING
            const processedLogs = aggregatedLogs.map(log => {
                const isMicro = log.system_type === 'Microgreens';
                const dateObj = new Date(log.created_at);

                // Calculate Missing DLI (Legacy Repair)
                let finalDLI = log.dli_mol_per_m2;
                if (!finalDLI && log.light_hours_per_day && log.lighting_source) {
                    const estimatedPPFD = estimatePPFD(log.lighting_source, 'Sunny'); // Default to sunny if unknown
                    finalDLI = (estimatedPPFD * log.light_hours_per_day * 0.0036).toFixed(2);
                }

                return {
                    Date: dateObj.toLocaleDateString(),
                    Time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    System: log.system_type,
                    ID: log.batch_id || log.target_id || log.system_id || 'N/A',
                    Status: log.visual_check || log.status || 'OK',

                    // ENVIRONMENT
                    Temp: log.temp ? `${log.temp}°C` : '-',
                    Humidity: isMicro && log.humidity ? `${log.humidity}%` : '-',
                    VPD: isMicro && log.vpd_kpa ? `${log.vpd_kpa} kPa` : '-',

                    // WATER
                    pH: !isMicro && log.ph ? log.ph : '-',
                    EC: !isMicro && log.ec ? log.ec : '-',
                    WaterTemp: !isMicro && log.water_temp ? `${log.water_temp}°C` : '-',

                    // LIGHTING & DLI
                    LightSource: log.lighting_source || '-',
                    Hours: log.light_hours_per_day || 0,
                    DLI: finalDLI || '-',

                    // ALERTS
                    Warnings: log.nutrient_warnings_count || 0,
                    Notes: log.notes ? `"${log.notes}"` : ''
                };
            });

            // Sort by Date DESC, then System
            processedLogs.sort((a, b) => new Date(b.Date) - new Date(a.Date));

            const headers = Object.keys(processedLogs[0]).join(',');
            const rows = processedLogs.map(row => Object.values(row).join(','));
            const csv = [headers, ...rows].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `cGrow_Daily_Report_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        } catch (error) { alert('Error exporting: ' + error.message); }
    };

    // CSV IMPORT
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const csv = event.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',');

                // Parse Rows
                const parsedLogs = lines.slice(1).filter(l => l.trim()).map(line => {
                    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Regex to split by comma ignoring quotes
                    const log = {};

                    // Simple mapping based on known columns
                    // Note: A robust importer would map headers to DB keys. 
                    // For now, assuming Export format re-import:
                    // Date,System,ID,Status,Temp,Humidity,VPD,pH,EC,WaterTemp,LightSource,Hours,DLI,Warnings,Notes
                    return values;
                });

                alert(`📂 Read ${parsedLogs.length} rows! (Feature pending backend integration)`);

            } catch (err) {
                alert('Import Error: ' + err.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                        <Clock size={32} />
                    </div>
                    <div>
                        <h1 className="page-title"><span className="text-emerald-600">cGrow</span> Daily Tracker</h1>
                        <p className="text-slate-500">Log metrics & Get Real-time Science Advice</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition border border-emerald-200 shadow-sm font-bold"
                    >
                        <HelpCircle size={18} /> Farming Guide
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer border border-slate-300">
                        <Upload size={18} /> Import
                        <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
                    </label>
                    <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* MICROGREENS COLUMN */}
                <div id="microgreens-section" className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Sprout className="text-green-600" size={24} />
                        <h2 className="text-xl font-bold text-green-900">🌱 Microgreens Tracker</h2>
                    </div>

                    <form onSubmit={(e) => handleSave(e, 'Microgreens')} className="space-y-4">
                        {/* Batch Selection */}
                        <div>
                            <label className="block text-sm font-bold text-green-900 mb-1">Select Batch</label>
                            <select
                                className="w-full p-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                value={microgreensEntry.batchId}
                                onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, batchId: e.target.value })}
                            >
                                <option value="">Choose a batch...</option>
                                {activeBatches.map(batch => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.crop} - Qty {batch.qty} (Day {batch.daysCurrent || 0})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TRAY SETTINGS UI (New Feature) */}
                        <div className="mb-4 p-3 bg-white rounded-xl border border-dashed border-emerald-300 flex justify-between items-center">
                            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">
                                MY SETUP: {trayType} TRAY
                            </span>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setTrayType('SINGLE')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${trayType === 'SINGLE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    SINGLE (Tub)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTrayType('DOUBLE')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${trayType === 'DOUBLE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    DOUBLE (Bot)
                                </button>
                            </div>
                        </div>



                        {/* ONE-QUESTION START: Visual health check promoted to top */}
                        <div className="bg-white p-4 rounded-lg border-2 border-emerald-200 shadow-sm">
                            <label className="block text-sm font-bold text-green-900 mb-2">
                                📸 How do the leaves look today?
                            </label>
                            <select
                                required
                                className="w-full p-3 border-2 border-green-300 rounded-lg text-lg font-medium"
                                value={microgreensEntry.visualCheck}
                                onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, visualCheck: e.target.value })}
                            >
                                <option value="">Select status...</option>
                                <option>Looking Perfect ✨</option>
                                <option>Slightly Yellowing 🟡</option>
                                <option>Mold/White Spots Detected 🍄</option>
                                <option>Wilting/Droopy 🥀</option>
                                <option>Ready for Harvest! ✂️</option>
                            </select>
                        </div>

                        {/* WEIGHT CHECK (Heuristic Input) */}
                        <div className="bg-white p-4 rounded-lg border-2 border-emerald-200 shadow-sm">
                            <label className="block text-sm font-bold text-green-900 mb-2">
                                ⚖️ Tray Weight (Lift to check)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'LIGHT', label: '🪶 Light (Dry)', color: 'bg-orange-50 border-orange-200' },
                                    { value: 'NORMAL', label: '⚖️ Normal', color: 'bg-green-50 border-green-200' },
                                    { value: 'HEAVY', label: '💧 Heavy (Wet)', color: 'bg-blue-50 border-blue-200' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setMicrogreensEntry({ ...microgreensEntry, trayWeight: option.value })}
                                        className={`p-2 rounded-lg border-2 text-sm font-bold transition-all ${microgreensEntry.trayWeight === option.value
                                            ? 'border-emerald-500 ring-2 ring-emerald-200 scale-105'
                                            : `${option.color} text-gray-600 hover:bg-gray-50`
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* SMART ADVICE CARD */}
                        {smartAdvice && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-fade-in">
                                <h4 className="font-bold text-blue-800 text-sm mb-2">
                                    📅 Day {smartAdvice.age}: Task Guide
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">{smartAdvice.watering.icon}</span>
                                        <div>
                                            <p className="font-bold text-blue-900">{smartAdvice.watering.type}</p>
                                            <p className="text-xs text-blue-700 leading-tight">{smartAdvice.watering.tip}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-xl">💡</span>
                                        <div>
                                            <p className="font-bold text-orange-800">{smartAdvice.lighting.status}</p>
                                            <p className="text-xs text-orange-700 leading-tight">{smartAdvice.lighting.action}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}


                        {/* Remove redundant Visual Check (already moved to top) */}

                        {/* CROP DOCTOR (Remediation Protocol) */}
                        {microgreensEntry.visualCheck && microgreensEntry.visualCheck.includes('Mold') && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm animate-pulse">
                                <h4 className="flex items-center gap-2 text-red-800 font-bold mb-2">
                                    <AlertTriangle size={20} /> 🚑 Crop Doctor: Immediate Action Needed
                                </h4>
                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                    <li><strong>Spray:</strong> 3% Hydrogen Peroxide (H2O2) solution.</li>
                                    <li><strong>Environment:</strong> Reduce Humidity to 50% immediately.</li>
                                    <li><strong>Airflow:</strong> Increase fan speed or ventilation.</li>
                                </ul>
                            </div>
                        )}

                        {/* MANUAL OBSERVATION SECTION */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Search size={20} className="text-purple-500" /> Manual Observation (No Sensors?)
                            </h3>

                            {/* VISUAL SYMPTOMS SELECTOR */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Visual Inspection</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Look Healthy', 'Leaf Yellowing', 'Wilting', 'Algae', 'Stunted Growth'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                const current = microgreensEntry.visualSymptoms || [];
                                                const createNew = current.includes(tag)
                                                    ? current.filter(t => t !== tag)
                                                    : [...current, tag];
                                                setMicrogreensEntry({ ...microgreensEntry, visualSymptoms: createNew });
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${(microgreensEntry.visualSymptoms || []).includes(tag)
                                                ? 'bg-purple-100 border-purple-500 text-purple-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* MANUAL ESTIMATION BUTTONS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Air Feel (Est. Humidity)</label>
                                    <div className="flex gap-1">
                                        {Object.entries(MANUAL_PATTERNS.AIR_QUALITY).map(([key, val]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setMicrogreensEntry({
                                                    ...microgreensEntry,
                                                    humidity: val.humidity, // Auto-fill numeric
                                                    manualAir: key // Tag it
                                                })}
                                                className={`flex-1 py-2 text-xs font-bold rounded border ${microgreensEntry.manualAir === key
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LIGHTING SYSTEM SECTION (New Professional Meter) */}
                        <div className="bg-white/50 p-4 rounded-lg border border-green-100">
                            <label className="block text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                                <Sun size={16} /> Lighting Data (For AI Growth Tracking)
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Left: Inputs */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold mb-1 block">Light Source</label>
                                        <select
                                            value={microgreensEntry.lightingSource}
                                            onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, lightingSource: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                                        >
                                            {LIGHTING_OPTIONS.MICROGREENS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-bold mb-1 block">Hours On (Today)</label>
                                        <input
                                            type="number" step="0.5"
                                            value={microgreensEntry.lightHours}
                                            onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, lightHours: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    {/* Weather Dropdown (Conditional) */}
                                    {['SUNLIGHT', 'WINDOW', 'BALCONY'].includes(microgreensEntry.lightingSource) && (
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold mb-1 block">Weather Condition</label>
                                            <select
                                                value={microgreensEntry.weatherCondition}
                                                onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, weatherCondition: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                                            >
                                                {WEATHER_CONDITIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                    )}


                                    {/* Cost Calculator */}
                                    <CostCalculator lightHours={microgreensEntry.lightHours} />

                                    {/* FAN STATUS TOGGLE (For Air Check) */}
                                    <div className="mt-3 bg-slate-100 p-2 rounded-lg flex items-center justify-between border border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <Wind size={16} className={microgreensEntry.fanStatus === 'ON' ? 'text-blue-500' : 'text-slate-400'} />
                                            <label className="text-xs font-bold text-slate-600">Fan / Ventilation</label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMicrogreensEntry({ ...microgreensEntry, fanStatus: microgreensEntry.fanStatus === 'ON' ? 'OFF' : 'ON' })}
                                            className={`px-3 py-1 rounded text-[10px] font-black tracking-widest transition-all ${microgreensEntry.fanStatus === 'ON'
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-white border border-slate-300 text-slate-400'
                                                }`}
                                        >
                                            {microgreensEntry.fanStatus}
                                        </button>
                                    </div>
                                </div>

                                {/* Right: The New Meter */}
                                <DLIMeter
                                    source={microgreensEntry.lightingSource}
                                    hours={microgreensEntry.lightHours}
                                    weather={microgreensEntry.weatherCondition}
                                    distance={lightDist}
                                    setDistance={setLightDist}
                                />
                            </div>



                            {/* GDD Badge (Preserved below the section) */}
                            {microgreensEntry.temperature && microgreensEntry.batchId && (
                                (() => {
                                    const selectedBatchObject = activeBatches.find(b => b.id == microgreensEntry.batchId);
                                    if (!selectedBatchObject) return null;
                                    const params = getCropParams(selectedBatchObject.crop);
                                    const gdd = calculateDailyGDD(parseFloat(microgreensEntry.temperature), parseFloat(microgreensEntry.temperature), selectedBatchObject.crop);
                                    return (
                                        <div className={`mt-3 flex items-center gap-2 text-xs p-2 rounded border ${params.type === 'WARM' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                                            <span className="font-bold">🌡️ GDD Tracker:</span>
                                            <span className="opacity-80">{params.type} CROP (Base {params.base_temp}°C)</span>
                                            <span className="font-bold ml-auto">{gdd} Units</span>
                                        </div>
                                    )
                                })()
                            )}
                        </div>


                        {/* MANUAL WEIGHT INPUT (Heuristic Engine) */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">⚖️ Tray Weight Check (Before Watering)</label>
                            <div className="flex gap-2">
                                {['LIGHT', 'NORMAL', 'HEAVY'].map(w => (
                                    <button
                                        key={w}
                                        type="button"
                                        onClick={() => setMicrogreensEntry({ ...microgreensEntry, trayWeight: w })}
                                        className={`flex-1 py-3 text-xs font-black rounded-lg border transition-all ${microgreensEntry.trayWeight === w
                                            ? (w === 'HEAVY' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-blue-100 border-blue-400 text-blue-700')
                                            : 'bg-white border-slate-300 text-slate-400 hover:bg-white'
                                            }`}
                                    >
                                        {w === 'LIGHT' ? '🪶 LIGHT' : w === 'NORMAL' ? '⚖️ NORMAL' : '💧 HEAVY'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Humidity & Temp */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-green-900 mb-1">
                                    Humidity (%)
                                    <ScientificContextTooltip title="VPD Influence" content="Humidity regulates the 'Air Drying Power'. High humidity prevents transpiration, causing calcium deficiency." />
                                </label>
                                <input type="number" step="0.1" placeholder="65" className="w-full p-2 border border-green-300 rounded-lg"
                                    value={microgreensEntry.humidity} onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, humidity: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-green-900 mb-1">
                                    Temp (°C)
                                    <ScientificContextTooltip title="GDD Thermal Time" content="Temperature controls metabolic speed. Use this to track GDD (Growing Degree Days) for precise harvest timing." />
                                </label>
                                <input type="number" step="0.1" placeholder="22" className="w-full p-2 border border-green-300 rounded-lg"
                                    value={microgreensEntry.temperature} onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, temperature: e.target.value })} />
                            </div>
                        </div>

                        {/* Watering System Used */}
                        <div>
                            <label className="block text-sm font-bold text-green-900 mb-1">Watering Method Used</label>
                            <select className="w-full p-2 border border-green-300 rounded-lg"
                                value={microgreensEntry.wateringSystem} onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, wateringSystem: e.target.value })}>
                                <option value="">Select...</option>
                                <option>Bottom Watering</option>
                                <option>Top Spray</option>
                                <option>Misting</option>
                            </select>
                        </div>

                        {/* VPD Status */}
                        {vpdData && (
                            <div className={`p-4 rounded-lg border-2 ${vpdData.risk_factor === 'HIGH' ? 'bg-red-50 border-red-300' : vpdData.risk_factor === 'MEDIUM' ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {vpdData.risk_factor === 'LOW' ? <CheckCircle size={20} className="text-green-600" /> : <AlertTriangle size={20} className={vpdData.risk_factor === 'HIGH' ? 'text-red-600' : 'text-yellow-600'} />}
                                    <h4 className="font-bold text-sm">Air Comfort Analysis</h4>
                                </div>
                                <p className="text-lg font-bold">{vpdData.vpd_kpa} kPa</p>
                                <p className="text-xs font-semibold">{vpdData.status}</p>
                                <p className="text-xs mt-1 text-slate-600">Action: {vpdData.recommendation}</p>
                            </div>
                        )}

                        {/* INTERVENTION LOGGING (New Feature) */}
                        <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                            <label className="block text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                                <Activity size={16} className="text-emerald-600" /> Action Taken Today
                            </label>
                            <select
                                className="w-full p-2 border border-green-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                                value={microgreensEntry.intervention}
                                onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, intervention: e.target.value })}
                            >
                                {INTERVENTION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notes Field (Restored) */}
                        <div>
                            <label className="block text-sm font-bold text-green-900 mb-1">Notes / Observations</label>
                            <textarea
                                rows="2"
                                placeholder="Any other details..."
                                className="w-full p-2 border border-green-300 rounded-lg text-sm"
                                value={microgreensEntry.notes}
                                onChange={(e) => setMicrogreensEntry({ ...microgreensEntry, notes: e.target.value })}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? 'Saving...' : <><Save size={18} /> Save Microgreens Log</>}
                        </button>
                    </form>
                </div>

                {/* HYDROPONICS COLUMN */}
                <div id="hydroponics-section" className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplets className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-blue-900">💧 Hydroponics Tracker</h2>
                    </div>

                    <form onSubmit={(e) => handleSave(e, 'Hydroponics')} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-blue-900 mb-1">Select System</label>
                            <select required className="w-full p-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={hydroponicsEntry.targetId} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, targetId: e.target.value })}>
                                <option value="">Choose a system...</option>
                                {activeSystems.map(system => (
                                    <option key={system.id} value={system.id}>{system.system_id || system.id} - {system.crop}</option>
                                ))}
                            </select>
                        </div>

                        {/* ONE-QUESTION START: Visual health check promoted to top for Hydroponics */}
                        {/* Main Tracker Form */}
                        <div id="daily-tracker-form" className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
                            <label className="block text-sm font-bold text-blue-900 mb-2">
                                📸 How do the plants look today?
                            </label>
                            <select
                                required
                                className="w-full p-3 border-2 border-blue-300 rounded-lg text-lg font-medium"
                                value={hydroponicsEntry.visualCheck}
                                onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, visualCheck: e.target.value })}
                            >
                                <option value="">Select status...</option>
                                {(() => {
                                    const selectedSystem = activeSystems.find(s => s.id == hydroponicsEntry.targetId);
                                    const subType = selectedSystem?.system_type || 'DEFAULT';
                                    const options = {
                                        DEFAULT: [
                                            'Crystal Clear & Green ✨',
                                            'Yellowing Tips (Burn?) 🟡',
                                            'Droopy/Limp Leaves 🥀',
                                            'Algae/Green Water Found 🦠',
                                            'Roots look Slimy/Brown 🟤'
                                        ],
                                        NFT: [
                                            'Roots white & clean ✨',
                                            'Water film visible in pipes ✅',
                                            'Yellowing Tips (Burn?) 🟡',
                                            'Dry zones in gullies ⚠️',
                                            'Roots look Slimy/Brown 🟤'
                                        ],
                                        DWC: [
                                            'Bubbles strong & active 🫧',
                                            'Water smells fresh & clean 🌊',
                                            'Leaf Yellowing 🟡',
                                            'Stagnant water smell 🤢',
                                            'Roots look Slimy/Brown 🟤'
                                        ],
                                        'Ebb & Flow': [
                                            'Media is moist & healthy 🪴',
                                            'Leaf Yellowing 🟡',
                                            'Media is bone dry! 🌵',
                                            'Standing water in tray ⚠️',
                                            'Roots look Slimy/Brown 🟤'
                                        ],
                                        'Drip': [
                                            'Media moist & draining well 💧',
                                            'Plants wilting (Clog?) 🥀',
                                            'Leaves Yellowing 🟡',
                                            'Algae on Perlite surface 🟢',
                                            'Run-off is too heavy 🌊'
                                        ]
                                    };
                                    return (options[subType] || options.DEFAULT).map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ));
                                })()}
                            </select>

                            {/* SYSTEM-SPECIFIC TELEMETRY (Sub-type Aware) */}
                            {(() => {
                                const system = activeSystems.find(s => s.id == hydroponicsEntry.targetId);
                                if (!system) return null;

                                if (system.system_type === 'NFT') {
                                    return (
                                        <div className="mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-200 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-cyan-700 uppercase mb-1">Pump Status</label>
                                                <select className="w-full p-2 bg-white border border-cyan-300 rounded-lg text-sm" value={hydroponicsEntry.pumpStatus} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, pumpStatus: e.target.value })}>
                                                    <option value="ON">ON ✅</option>
                                                    <option value="OFF">OFF 🛑 (Critical)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-cyan-700 uppercase mb-1">Water Flow</label>
                                                <select className="w-full p-2 bg-white border border-cyan-300 rounded-lg text-sm" value={hydroponicsEntry.waterFlow} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, waterFlow: e.target.value })}>
                                                    <option value="Normal">Normal ✅</option>
                                                    <option value="Blocked">Blocked 🛑</option>
                                                    <option value="Slow">Slow ⚠️</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }

                                if (system.system_type === 'DWC') {
                                    return (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <label className="block text-[10px] font-black text-blue-700 uppercase mb-1">Air Stones Status</label>
                                            <select className="w-full p-2 bg-white border border-blue-300 rounded-lg text-sm" value={hydroponicsEntry.airStones} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, airStones: e.target.value })}>
                                                <option value="Bubbling">Strongly Bubbling 🫧</option>
                                                <option value="Weak">Weak Bubbles ⚠️</option>
                                                <option value="Not Bubbling">Not Bubbling 🛑</option>
                                            </select>
                                        </div>
                                    );
                                }

                                if (system.system_type === 'Ebb & Flow') {
                                    return (
                                        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-700 uppercase mb-1">Hydration Stress?</label>
                                                <select className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-sm" value={hydroponicsEntry.hydrationStress} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, hydrationStress: e.target.value === 'true' })}>
                                                    <option value="false">No (Media Moist) ✅</option>
                                                    <option value="true">Yes (Media Dry) ⚠️</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-emerald-700 uppercase mb-1">Hours Since Last Cycle</label>
                                                <input type="number" step="0.5" className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-sm" placeholder="e.g. 2" value={hydroponicsEntry.lastCycleTime} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, lastCycleTime: e.target.value })} />
                                            </div>
                                        </div>
                                    );
                                }

                                if (system.system_type === 'Drip') {
                                    return (
                                        <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-orange-700 uppercase mb-1">Dripper Status</label>
                                                <select className="w-full p-2 bg-white border border-orange-300 rounded-lg text-sm" value={hydroponicsEntry.waterFlow} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, waterFlow: e.target.value })}>
                                                    <option value="Normal">Flowing Well 💧</option>
                                                    <option value="Blocked">Clogged / Dry 🛑</option>
                                                    <option value="Uneven">Uneven Rate ⚠️</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-orange-700 uppercase mb-1">Catch Cup (Run-off)</label>
                                                <select className="w-full p-2 bg-white border border-orange-300 rounded-lg text-sm" value={hydroponicsEntry.lastCycleTime} onChange={e => setHydroponicsEntry({ ...hydroponicsEntry, lastCycleTime: e.target.value })}>
                                                    <option value="10">10-20% (Perfect) ✅</option>
                                                    <option value="0">No Run-off (Too Dry) 🌵</option>
                                                    <option value="50">High (Wasting Water) 🌊</option>
                                                </select>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>


                        {/* SMART ASSISTANT BLOCK */}
                        <HydroGuide />


                        {/* MANUAL OBSERVATION SECTION (Hydroponics) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Search size={20} className="text-purple-500" /> Manual Observation (No Sensors?)
                            </h3>

                            {/* VISUAL SYMPTOMS SELECTOR */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Visual Inspection</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Look Healthy', 'Leaf Yellowing', 'Wilting', 'Algae', 'Stunted Growth'].map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => {
                                                const current = hydroponicsEntry.visualSymptoms || [];
                                                const createNew = current.includes(tag)
                                                    ? current.filter(t => t !== tag)
                                                    : [...current, tag];
                                                setHydroponicsEntry({ ...hydroponicsEntry, visualSymptoms: createNew });
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${(hydroponicsEntry.visualSymptoms || []).includes(tag)
                                                ? 'bg-purple-100 border-purple-500 text-purple-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* MANUAL ESTIMATION BUTTONS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Air Feel (Est. Humidity)</label>
                                    <div className="flex gap-1">
                                        {Object.entries(MANUAL_PATTERNS.AIR_QUALITY).map(([key, val]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setHydroponicsEntry({
                                                    ...hydroponicsEntry,
                                                    humidity: val.humidity, // Auto-fill numeric
                                                    manualAir: key // Tag it
                                                })}
                                                className={`flex-1 py-2 text-xs font-bold rounded border ${hydroponicsEntry.manualAir === key
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                                        Nutrient Strength (Est. EC)
                                        <ScientificContextTooltip title="Osmotic Pressure" content="EC measures salt concentration. High EC creates osmotic stress, preventing roots from absorbing water." />
                                    </label>
                                    <div className="flex gap-1">
                                        {Object.entries(MANUAL_PATTERNS.NUTRIENT_STRENGTH).map(([key, val]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setHydroponicsEntry({
                                                    ...hydroponicsEntry,
                                                    ec: val.ec, // Auto-fill numeric
                                                    nutrientStrength: key // Tag it
                                                })}
                                                className={`flex-1 py-2 text-xs font-bold rounded border ${hydroponicsEntry.nutrientStrength === key
                                                    ? 'bg-green-100 border-green-500 text-green-700'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                {key}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LIGHTING SYSTEM SECTION */}
                        <div className="bg-white/50 p-3 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Sun size={16} /> Lighting Data
                            </label>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Light Source</p>
                                    <select
                                        value={hydroponicsEntry.lightingSource}
                                        onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, lightingSource: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        {LIGHTING_OPTIONS.HYDROPONICS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Hours On</p>
                                    <input type="number" step="0.5" value={hydroponicsEntry.lightHours}
                                        onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, lightHours: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                            {/* Weather Dropdown (Conditional) */}
                            {['SUNLIGHT', 'GREENHOUSE', 'WINDOW'].includes(hydroponicsEntry.lightingSource) && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500 mb-1">Weather Condition</p>
                                    <select
                                        value={hydroponicsEntry.weatherCondition}
                                        onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, weatherCondition: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        {WEATHER_CONDITIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                            )}
                            {/* DLI Badge */}
                            {/* DLI Badge */}
                            <div className="flex gap-2 mt-2">
                                <div className="flex-1 text-xs bg-green-100 text-green-800 p-2 rounded text-center font-bold">
                                    Estimated DLI: {(estimatePPFD(hydroponicsEntry.lightingSource, hydroponicsEntry.weatherCondition) * (parseFloat(hydroponicsEntry.lightHours) || 0) * 0.0036).toFixed(2)} mol/m²/d
                                </div>
                                {/* GDD Badge */}
                                {hydroponicsEntry.waterTemp && hydroponicsEntry.targetId && (
                                    (() => {
                                        // Find crop from activeSystems
                                        const sys = activeSystems.find(s => s.id === hydroponicsEntry.targetId || s.system_id === hydroponicsEntry.targetId);
                                        const crop = sys ? sys.crop : 'Lettuce';
                                        // Use Water Temp as proxy for Plant Temp in Hydro (simplified)
                                        const temp = parseFloat(hydroponicsEntry.waterTemp);
                                        const params = getCropParams(crop);
                                        const gdd = calculateDailyGDD(temp, temp, crop);

                                        return (
                                            <div className={`flex-1 text-xs p-2 rounded text-center font-bold border ${params.type === 'WARM' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'}`}>
                                                <span className="block text-[10px] uppercase opacity-70">{params.type} CROP (Base {params.base_temp}°C)</span>
                                                GDD: {gdd}
                                            </div>
                                        )
                                    })()
                                )}
                            </div>
                        </div>

                        {/* pH & EC */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                                    <Activity size={12} className="text-blue-500" /> pH Level
                                    <ScientificContextTooltip title="Precipitation Theory" content="When pH is high (>6.5), nutrients like Iron and Phosphorus form solid crystals (precipitate) and become unavailable to the plant." />
                                </label>
                                <input type="number" step="0.1" placeholder="6.0" className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                                    value={hydroponicsEntry.ph} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, ph: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                                    <Zap size={12} className="text-blue-500" /> EC (mS/cm)
                                    <ScientificContextTooltip title="Ionic Concentration" content="EC levels indicate the total dissolved salts. High EC causes osmotic shock, while low EC leads to nutrient starvation." />
                                </label>
                                <input type="number" step="0.1" placeholder="1.8" className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                                    value={hydroponicsEntry.ec} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, ec: e.target.value })} />
                                {parseFloat(hydroponicsEntry.ec) > 0 && parseFloat(hydroponicsEntry.ec) < 1.5 && (
                                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800 font-bold animate-pulse">
                                        🥣 Low Food Alert! Current EC is low. Add more nutrient solution to reach target 1.8 - 2.0.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                                    <Thermometer size={12} className="text-blue-500" /> Air Temp (°C)
                                </label>
                                <input type="number" step="0.1" placeholder="24" className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                                    value={hydroponicsEntry.temperature} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, temperature: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                                    <Droplets size={12} className="text-blue-500" /> Air Humidity (%)
                                </label>
                                <input type="number" step="0.1" placeholder="60" className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                                    value={hydroponicsEntry.humidity} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, humidity: e.target.value })} />
                            </div>
                        </div>

                        {/* Water Temp & Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1">
                                    Water Temp (°C)
                                    <ScientificContextTooltip title="Dissolved Oxygen (DO)" content="As water temperature rises, its ability to hold Oxygen decreases. High temp (>25°C) leads to root hypoxia and rot." />
                                </label>
                                <input type="number" step="0.1" placeholder="21" className="w-full p-2 border border-blue-300 rounded-lg"
                                    value={hydroponicsEntry.waterTemp} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, waterTemp: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-blue-900 mb-1 flex items-center gap-1">
                                    Water Level <Info size={12} title="Check the sight tube on your reservoir" />
                                </label>
                                <select className="w-full p-2 border border-blue-300 rounded-lg"
                                    value={hydroponicsEntry.waterLevel} onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, waterLevel: e.target.value })}>
                                    <option>OK</option>
                                    <option>Top-up Needed</option>
                                    <option>Overflowing</option>
                                </select>
                                <p className="text-[10px] text-gray-500 mt-1">Check sight tube marking.</p>
                            </div>
                        </div>

                        {/* Nutrient Warnings */}
                        {nutrientWarnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-blue-900">⚗️ Nutrient Analysis</h4>
                                {nutrientWarnings.map((warning, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg border-2 text-xs ${warning.severity === 'CRITICAL' ? 'bg-red-50 border-red-300 text-red-900' : 'bg-yellow-50 border-yellow-300 text-yellow-900'}`}>
                                        <p className="font-bold mb-1">{warning.title}</p>
                                        <p className="mb-1">{warning.diagnosis}</p>
                                        <p className="font-semibold text-[11px]">Action: {warning.action}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* INTERVENTION LOGGING (New Feature) */}
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <Activity size={16} className="text-blue-600" /> Action Taken Today
                            </label>
                            <select
                                className="w-full p-2 border border-blue-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
                                value={hydroponicsEntry.intervention}
                                onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, intervention: e.target.value })}
                            >
                                {INTERVENTION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notes Field (Restored) */}
                        <div>
                            <label className="block text-sm font-bold text-blue-900 mb-1">Notes / Observations</label>
                            <textarea
                                rows="2"
                                placeholder="Any other details..."
                                className="w-full p-2 border border-blue-300 rounded-lg text-sm"
                                value={hydroponicsEntry.notes}
                                onChange={(e) => setHydroponicsEntry({ ...hydroponicsEntry, notes: e.target.value })}
                            />
                        </div>


                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? 'Saving...' : <><Save size={18} /> Save Hydroponics Log</>}
                        </button>
                    </form>
                </div>
            </div >

            {/* Scientific Info Modal */}
            < button onClick={() => setShowInfoModal(true)} className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40" >
                <BookOpen size={24} />
            </button >
            <ScientificInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
        </div >
    );
};

export default DailyTrackerPage;
