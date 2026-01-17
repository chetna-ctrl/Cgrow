import React, { useState, useEffect, useCallback } from 'react';
import {
    Clock,
    Bell,
    Zap,
    Sun,
    Moon,
    Droplets,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Lock,
    Timer
} from 'lucide-react';
import {
    calculatePumpCycle,
    calculateLightCycle,
    calculateBlackoutStatus,
    getMaintenanceTasks,
    getDailyReminders
} from '../utils/timerLogic';
import { notificationService } from '../services/notificationService';
import BlackoutModeBadge from '../components/BlackoutModeBadge';
import SmartHeader from '../components/SmartHeader';
import { isDemoMode } from '../utils/sampleData';
import { supabase } from '../lib/supabase';

// COOLDOWN DURATION: 60 minutes (in milliseconds)
const COOLDOWN_MS = 60 * 60 * 1000;

const SchedulerPage = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [selectedSystemType, setSelectedSystemType] = useState('Hydroponics');
    const [selectedCropType, setSelectedCropType] = useState('Leafy Greens');
    const [pumpConfig, setPumpConfig] = useState(null);
    const [lightConfig, setLightConfig] = useState(null);
    const [dailyTasks, setDailyTasks] = useState([]);
    const [weeklyTasks, setWeeklyTasks] = useState([]);
    const [monthlyTasks, setMonthlyTasks] = useState([]);
    const [microgreensBatches, setMicrogreensBatches] = useState([]);
    const [taskCooldowns, setTaskCooldowns] = useState({}); // Track task cooldowns
    const [currentTime, setCurrentTime] = useState(new Date());

    // Live clock for cooldown calculations
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load cooldowns from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('agri_os_task_cooldowns');
        if (saved) {
            setTaskCooldowns(JSON.parse(saved));
        }
    }, []);

    // Check if a task is on cooldown
    const isTaskLocked = useCallback((taskName) => {
        const lastDone = taskCooldowns[taskName];
        if (!lastDone) return false;
        return (currentTime.getTime() - lastDone) < COOLDOWN_MS;
    }, [taskCooldowns, currentTime]);

    // Get remaining cooldown time
    const getCooldownRemaining = useCallback((taskName) => {
        const lastDone = taskCooldowns[taskName];
        if (!lastDone) return null;
        const remaining = COOLDOWN_MS - (currentTime.getTime() - lastDone);
        if (remaining <= 0) return null;
        const mins = Math.floor(remaining / 60000);
        return `${mins}m`;
    }, [taskCooldowns, currentTime]);

    // Mark task as done (with cooldown)
    const handleTaskComplete = (taskName) => {
        // Check if on cooldown
        if (isTaskLocked(taskName)) {
            const remaining = getCooldownRemaining(taskName);
            alert(`⏳ Cooldown Active!\n\nYou completed "${taskName}" recently.\nWait ${remaining} before logging again.`);
            return;
        }

        // Check for late completion
        const hour = currentTime.getHours();
        if (hour >= 10 && taskName.includes('Morning')) {
            alert(`⚠️ Late Check!\n\n"${taskName}" was scheduled for morning.\nLogging at ${currentTime.toLocaleTimeString()}.`);
        }

        // Log the completion
        const newCooldowns = {
            ...taskCooldowns,
            [taskName]: currentTime.getTime()
        };
        setTaskCooldowns(newCooldowns);
        localStorage.setItem('agri_os_task_cooldowns', JSON.stringify(newCooldowns));

        // Show success
        alert(`✅ Task Logged!\n\n"${taskName}" completed at ${currentTime.toLocaleTimeString()}.\n\nCooldown active for 1 hour.`);
    };

    // Request notification permission
    useEffect(() => {
        const checkPermission = async () => {
            const granted = await notificationService.requestPermission();
            setNotificationsEnabled(granted);
        };
        checkPermission();
    }, []);

    // Load microgreens batches for blackout tracking
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                if (isDemoMode()) {
                    const demoBatches = JSON.parse(localStorage.getItem('demo_batches') || '[]');
                    const activeBatches = demoBatches.filter(b => b.status && b.status.toLowerCase() !== 'harvested');
                    console.log('[Blackout Tracker] Demo mode - Active batches:', activeBatches);
                    setMicrogreensBatches(activeBatches);
                } else {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        console.log('[Blackout Tracker] No user logged in');
                        return;
                    }

                    const { data, error } = await supabase
                        .from('batches')
                        .select('*')
                        .eq('user_id', user.id)
                        .neq('status', 'Harvested') // Capital H
                        .neq('status', 'harvested'); // Lowercase h

                    if (error) {
                        console.error('[Blackout Tracker] Error fetching batches:', error);
                    } else {
                        console.log('[Blackout Tracker] Fetched batches from Supabase:', data);
                        setMicrogreensBatches(data || []);
                    }
                }
            } catch (err) {
                console.error('[Blackout Tracker] Exception:', err);
            }
        };

        fetchBatches();
    }, []);

    // Calculate pump cycle
    useEffect(() => {
        const config = calculatePumpCycle(selectedSystemType);
        setPumpConfig(config);
    }, [selectedSystemType]);

    // Calculate light cycle
    useEffect(() => {
        const config = calculateLightCycle(selectedCropType);
        setLightConfig(config);
    }, [selectedCropType]);

    // Load maintenance tasks
    useEffect(() => {
        setDailyTasks(getMaintenanceTasks('daily', selectedSystemType));
        setWeeklyTasks(getMaintenanceTasks('weekly', selectedSystemType));
        setMonthlyTasks(getMaintenanceTasks('monthly', selectedSystemType));
    }, [selectedSystemType]);

    // Send daily reminders
    useEffect(() => {
        if (!notificationsEnabled) return;

        const reminders = getDailyReminders();
        reminders.forEach(reminder => {
            reminder.tasks.forEach(task => {
                notificationService.showTaskReminder(task, reminder.priority);
            });
        });
    }, [notificationsEnabled]);

    const handleEnableNotifications = async () => {
        const granted = await notificationService.requestPermission();
        setNotificationsEnabled(granted);

        if (granted) {
            notificationService.show('✅ Notifications Enabled', {
                body: 'You\'ll receive reminders for maintenance tasks and alerts'
            });
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* SMART HEADER: Live Clock, Weather, Sowing Window */}
            <SmartHeader />

            {/* Page Title */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600">
                        <Clock size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Operations Command Center</h1>
                        <p className="text-slate-600">Smart scheduling with cooldown protection</p>
                    </div>
                </div>

                {/* Notification Toggle */}
                <button
                    onClick={handleEnableNotifications}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${notificationsEnabled
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                >
                    <Bell size={18} />
                    {notificationsEnabled ? 'Notifications ON' : 'Enable Notifications'}
                </button>
            </div>

            {/* System Type Selector */}
            <div className="mb-6 flex gap-4">
                <div>
                    <label className="block text-sm font-bold mb-2">System Type:</label>
                    <select
                        className="p-3 border rounded-lg"
                        value={selectedSystemType}
                        onChange={(e) => setSelectedSystemType(e.target.value)}
                    >
                        <option>NFT</option>
                        <option>DWC</option>
                        <option>Ebb & Flow</option>
                        <option>Hydroponics</option>
                        <option>Microgreens</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Crop Type:</label>
                    <select
                        className="p-3 border rounded-lg"
                        value={selectedCropType}
                        onChange={(e) => setSelectedCropType(e.target.value)}
                    >
                        <option>Leafy Greens</option>
                        <option>Fruiting</option>
                        <option>Microgreens</option>
                    </select>
                </div>
            </div>

            {/* Automated Timers Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pump Cycle Timer */}
                {pumpConfig && (
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold">Pump Cycle Timer</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Cycle:</span>
                                <span className="text-lg font-bold text-blue-600">{pumpConfig.cycle}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Flow Rate:</span>
                                <span className="text-md">{pumpConfig.flowRate}</span>
                            </div>

                            <div className="bg-red-50 border border-red-300 rounded-lg p-3">
                                <p className="text-xs font-bold text-red-800 mb-1">⚠️ CRITICAL</p>
                                <p className="text-xs text-red-700">{pumpConfig.critical}</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
                                <p className="text-xs font-bold">📋 {pumpConfig.alert}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Light Cycle Timer */}
                {lightConfig && (
                    <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Sun className="text-yellow-600" size={24} />
                            <h2 className="text-xl font-bold">Light Cycle Timer</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Schedule:</span>
                                <span className="text-lg font-bold text-yellow-600">
                                    {lightConfig.hoursOn}h ON / {lightConfig.hoursOff}h OFF
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Intensity:</span>
                                <span className="text-md">{lightConfig.intensity}</span>
                            </div>

                            <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                                <p className="text-xs font-bold text-blue-800 mb-1">📚 Scientific Basis</p>
                                <p className="text-xs text-blue-700">{lightConfig.reason}</p>
                                <p className="text-xs text-slate-600 mt-1 italic">{lightConfig.scientific}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Sun className="text-yellow-500" size={16} />
                                <span className="text-xs">DLI: {lightConfig.dli}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Blackout Mode Tracker */}
            {microgreensBatches.length > 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Moon className="text-slate-700" size={24} />
                        <h2 className="text-xl font-bold">Blackout Mode Tracker</h2>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">
                        Critical 72-hour darkness phase for stem elongation (ICAR Protocol)
                    </p>

                    <div className="space-y-3">
                        {microgreensBatches.map(batch => {
                            // Check if user marked it as still in blackout (from database)
                            const isStillInBlackout = batch.is_in_blackout;
                            const blackoutStatus = calculateBlackoutStatus(batch.sow_date, isStillInBlackout);

                            if (!blackoutStatus) return null;

                            return (
                                <div key={batch.id}>
                                    {/* Main Status Card */}
                                    <div
                                        className={`p-4 rounded-lg border-2 ${blackoutStatus.borderColor} ${blackoutStatus.bgColor} ${blackoutStatus.textColor} transition-all`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{blackoutStatus.icon}</span>
                                                <div>
                                                    <span className="font-bold">{batch.crop} - Batch {batch.batch_id}</span>
                                                    <p className="text-xs opacity-75">{blackoutStatus.displayAge} since sowing</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${blackoutStatus.borderColor} ${blackoutStatus.bgColor}`}>
                                                {blackoutStatus.status}
                                            </div>
                                        </div>
                                        <p className="text-sm mb-2">{blackoutStatus.action}</p>
                                        <p className="text-xs italic opacity-75">{blackoutStatus.scientific}</p>
                                    </div>

                                    {/* WARNING ALERT (if applicable) */}
                                    {blackoutStatus.warning && (
                                        <div className={`mt-2 p-3 rounded-lg border-2 ${blackoutStatus.warning.borderColor} ${blackoutStatus.warning.bgColor} ${blackoutStatus.warning.textColor} animate-pulse`}>
                                            <p className="text-sm font-bold mb-1">{blackoutStatus.warning.message}</p>
                                            <p className="text-xs">{blackoutStatus.warning.action}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Maintenance Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Daily Tasks - WITH COOLDOWN LOGIC */}
                <div className="bg-white border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-emerald-600" size={20} />
                        <h3 className="font-bold text-lg">Daily Tasks</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full ml-auto">
                            1hr Cooldown
                        </span>
                    </div>

                    <div className="space-y-2">
                        {dailyTasks.map((task, i) => {
                            const locked = isTaskLocked(task.task);
                            const remaining = getCooldownRemaining(task.task);

                            return (
                                <button
                                    key={i}
                                    onClick={() => handleTaskComplete(task.task)}
                                    disabled={locked}
                                    className={`w-full p-3 rounded-lg border text-left transition-all ${locked
                                        ? 'bg-slate-100 border-slate-300 cursor-not-allowed opacity-60'
                                        : task.priority === 'high' || task.priority === 'critical'
                                            ? 'bg-red-50 border-red-300 hover:bg-red-100'
                                            : task.priority === 'medium'
                                                ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                                                : 'bg-white border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold flex items-center gap-2">
                                            {locked && <Lock size={12} className="text-slate-500" />}
                                            {task.task}
                                        </span>
                                        {locked ? (
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full flex items-center gap-1">
                                                <Timer size={10} />
                                                {remaining}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-emerald-600 font-bold">
                                                ✓ Log
                                            </span>
                                        )}
                                    </div>
                                    {task.time && !locked && (
                                        <span className="text-xs text-slate-500">{task.time}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Tasks */}
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-blue-600" size={20} />
                        <h3 className="font-bold text-lg">Weekly Tasks</h3>
                    </div>

                    <div className="space-y-2">
                        {weeklyTasks.map((task, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-lg border ${task.priority === 'high'
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-slate-50 border-slate-300'
                                    }`}
                            >
                                <p className="text-sm font-bold">{task.task}</p>
                                {task.day && (
                                    <span className="text-xs text-slate-600">{task.day}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Tasks */}
                <div className="bg-white border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-purple-600" size={20} />
                        <h3 className="font-bold text-lg">Monthly Tasks</h3>
                    </div>

                    <div className="space-y-2">
                        {monthlyTasks.map((task, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-lg border ${task.priority === 'critical'
                                    ? 'bg-red-50 border-red-300'
                                    : task.priority === 'high'
                                        ? 'bg-amber-50 border-amber-300'
                                        : 'bg-slate-50 border-slate-300'
                                    }`}
                            >
                                <p className="text-sm font-bold">{task.task}</p>
                                {task.duration && (
                                    <span className="text-xs text-slate-600">{task.duration}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchedulerPage;
