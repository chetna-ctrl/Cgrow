/**
 * Timer Logic Utilities
 * Scientific basis: NASA CEA, ICAR Microgreens Protocol, Hydroponic best practices
 */

/**
 * Calculate time until next event
 * @param {string} schedule - Cron-like expression or interval
 * @param {Date} lastTriggered - Last time event fired
 * @returns {Object} {hours, minutes, nextTime, status}
 */
export const calculateTimeUntilNext = (schedule, lastTriggered) => {
    const now = new Date();

    if (!lastTriggered) {
        return { hours: 0, minutes: 0, nextTime: now, status: 'Ready' };
    }

    const last = new Date(lastTriggered);
    const diff = now - last;

    // Parse schedule (simple format: "daily", "weekly", "monthly", or "Xh Ym")
    let intervalMs = 0;

    if (schedule === 'daily') intervalMs = 24 * 60 * 60 * 1000;
    else if (schedule === 'weekly') intervalMs = 7 * 24 * 60 * 60 * 1000;
    else if (schedule === 'monthly') intervalMs = 30 * 24 * 60 * 60 * 1000;
    else {
        // Parse "2h" or "30m" format
        const hours = schedule.match(/(\d+)h/);
        const mins = schedule.match(/(\d+)m/);
        if (hours) intervalMs += parseInt(hours[1]) * 60 * 60 * 1000;
        if (mins) intervalMs += parseInt(mins[1]) * 60 * 1000;
    }

    const timeRemaining = intervalMs - diff;

    if (timeRemaining <= 0) {
        return { hours: 0, minutes: 0, nextTime: now, status: 'Overdue' };
    }

    const nextTime = new Date(last.getTime() + intervalMs);
    const hoursLeft = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

    return {
        hours: hoursLeft,
        minutes: minutesLeft,
        nextTime,
        status: hoursLeft < 1 ? 'Urgent' : 'Scheduled'
    };
};

/**
 * Pump Cycle Calculator
 * Research: NASA CEA - NFT requires continuous flow, Ebb & Flow cycles
 * @param {string} systemType - 'NFT', 'DWC', 'Ebb & Flow'
 * @returns {Object} Pump schedule configuration
 */
export const calculatePumpCycle = (systemType) => {
    const configs = {
        'NFT': {
            cycle: '24/7',
            onMinutes: 1440, // Always on
            offMinutes: 0,
            flowRate: '1-2 L/min',
            critical: 'Pump failure = plant death in 2-4 hours',
            alert: 'Check pump daily'
        },
        'DWC': {
            cycle: 'Air stones 24/7',
            onMinutes: 1440,
            offMinutes: 0,
            flowRate: 'N/A (airstones)',
            critical: 'Air pump failure = root rot in 6-12 hours',
            alert: 'Check air bubbles daily'
        },
        'Ebb & Flow': {
            cycle: '15 min ON / 45 min OFF',
            onMinutes: 15,
            offMinutes: 45,
            flowRate: 'Fill tray in 5-10 min',
            critical: 'Roots dry out if cycle stops > 2 hours',
            alert: 'Verify cycle 2x daily'
        }
    };

    return configs[systemType] || configs['NFT'];
};

/**
 * Light Cycle Calculator
 * Research: Photoperiod effects on plant growth
 * @param {string} cropType - 'Leafy Greens', 'Fruiting', 'Microgreens'
 * @returns {Object} Light schedule
 */
export const calculateLightCycle = (cropType) => {
    const cycles = {
        'Leafy Greens': {
            hoursOn: 16,
            hoursOff: 8,
            intensity: '200-300 μmol/m²/s (PPFD)',
            reason: 'Long days promote vegetative growth',
            dli: '12-17 mol/m²/day',
            scientific: 'Wageningen University photoperiod studies'
        },
        'Fruiting': {
            hoursOn: 12,
            hoursOff: 12,
            intensity: '400-600 μmol/m²/s (PPFD)',
            reason: 'Equal day/night triggers flowering',
            dli: '17-25 mol/m²/day',
            scientific: 'Cornell CEA fruiting research'
        },
        'Microgreens': {
            hoursOn: 12,
            hoursOff: 12,
            intensity: '100-200 μmol/m²/s (PPFD)',
            reason: 'Moderate light for tender greens',
            dli: '5-10 mol/m²/day',
            scientific: 'ICAR microgreens guidelines'
        }
    };

    return cycles[cropType] || cycles['Leafy Greens'];
};

/**
 * Blackout Mode Timer (TIMEZONE-FIXED ✅)
 * Critical for microgreens stem elongation
 * @param {Date|string} sowDate - Sowing date
 * @param {boolean} isStillInBlackout - Whether user manually says it's still covered
 * @returns {Object} Blackout status with warnings
 */
export const calculateBlackoutStatus = (sowDate, isStillInBlackout = null) => {
    if (!sowDate) return null;

    // ✅ FIX: Ignore hours/minutes for accurate day count
    const sow = new Date(sowDate);
    sow.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const age = Math.floor((today - sow) / (1000 * 60 * 60 * 24));

    // Day 0-3: Blackout Phase (KEEP COVERED)
    if (age >= 0 && age <= 3) {
        const daysRemaining = 3 - age;

        return {
            phase: 'blackout',
            age: age,
            displayAge: `Day ${age}`,
            daysRemaining,
            status: 'KEEP COVERED (Blackout)',
            icon: '🌑', // Dark moon icon
            iconColor: 'text-slate-800',
            action: `Keep covered in darkness. ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining.`,
            urgency: 'critical',
            bgColor: 'bg-slate-800',
            textColor: 'text-white',
            borderColor: 'border-slate-600',
            scientific: 'ICAR Protocol: 72h darkness promotes stem elongation',
            warning: null
        };
    }

    // Day 4+: Growth Phase (UNDER LIGHTS)
    if (age > 3) {
        const daysUnderLight = age - 3;

        // ⚠️ WARNING: Check if user claims it's still in blackout
        let warning = null;
        if (isStillInBlackout === true) {
            warning = {
                severity: 'CRITICAL',
                message: `⚠️ ALERT: Day ${age} crop should be under lights!`,
                action: 'Remove covers immediately to prevent weak, leggy growth',
                bgColor: 'bg-red-100',
                textColor: 'text-red-900',
                borderColor: 'border-red-500'
            };
        }

        return {
            phase: 'growth',
            age: age,
            displayAge: `Day ${age}`,
            daysRemaining: 0,
            status: 'UNDER LIGHTS',
            icon: '☀️', // Sun icon
            iconColor: 'text-yellow-500',
            action: `Provide 12-16 hours of light daily. Growth day ${daysUnderLight}.`,
            urgency: age === 4 ? 'immediate' : 'normal',
            bgColor: age === 4 ? 'bg-orange-50' : 'bg-green-50',
            textColor: age === 4 ? 'text-orange-900' : 'text-green-900',
            borderColor: age === 4 ? 'border-orange-500' : 'border-green-300',
            scientific: 'Light triggers chlorophyll & photosynthesis',
            warning: warning
        };
    }

    return null;
};

/**
 * Maintenance Schedule Generator
 * @param {string} frequency - 'daily', 'weekly', 'monthly'
 * @returns {Array} Task list
 */
export const getMaintenanceTasks = (frequency, systemType = 'Hydroponics') => {
    const tasks = {
        daily: {
            Hydroponics: [
                { task: 'Check pH & EC', time: '8:00 AM', priority: 'high' },
                { task: 'Check water temperature', time: '8:00 AM', priority: 'high' },
                { task: 'Inspect pump/airstone', time: '8:00 AM', priority: 'high' },
                { task: 'Check water level', time: '6:00 PM', priority: 'medium' },
                { task: 'Inspect leaves (turgidity)', time: '6:00 PM', priority: 'medium' },
                { task: 'Look for algae/slime', time: '6:00 PM', priority: 'low' }
            ],
            Microgreens: [
                { task: 'Check moisture (lift tray)', time: '8:00 AM', priority: 'high' },
                { task: 'Check humidity', time: '8:00 AM', priority: 'high' },
                { task: 'Mist if needed', time: '8:00 AM', priority: 'medium' },
                { task: 'Run ventilation fans', time: '10:00 AM', priority: 'medium', duration: '2 hours' },
                { task: 'Check for  mold', time: '6:00 PM', priority: 'high' },
                { task: 'Blackout check (if applicable)', time: '6:00 PM', priority: 'critical' }
            ]
        },
        weekly: {
            Hydroponics: [
                { task: 'Change nutrient solution', day: 'Sunday', priority: 'high' },
                { task: 'Clean filters', day: 'Sunday', priority: 'high' },
                { task: 'Inspect roots (color, smell)', day: 'Wednesday', priority: 'medium' },
                { task: 'Verify timer sync', day: 'Friday', priority: 'low' }
            ],
            Microgreens: [
                { task: 'Sanitize trays (if reusing)', day: 'Sunday', priority: 'high' },
                { task: 'Check seed inventory', day: 'Wednesday', priority: 'medium' },
                { task: 'Clean grow lights', day: 'Friday', priority: 'low' }
            ]
        },
        monthly: {
            Hydroponics: [
                { task: 'System deep clean & sterilization', priority: 'critical', duration: '2-4 hours' },
                { task: 'Calibrate pH/EC meters', priority: 'high' },
                { task: 'Replace air stones', priority: 'medium' },
                { task: 'Inspect plumbing for leaks', priority: 'medium' }
            ],
            Microgreens: [
                { task: 'Deep clean grow area', priority: 'high' },
                { task: 'Test germination rate', priority: 'medium' },
                { task: 'Replace grow lights (if needed)', priority: 'low' }
            ]
        }
    };

    return tasks[frequency]?.[systemType] || [];
};

/**
 * Generate daily reminders
 * @param {Date} currentTime
 * @returns {Array} Active reminders
 */
export const getDailyReminders = (currentTime = new Date()) => {
    const hour = currentTime.getHours();
    const reminders = [];

    // Morning reminders (8 AM)
    if (hour === 8) {
        reminders.push({
            time: '8:00 AM',
            title: '☀️ Morning Check',
            tasks: [
                'Check pH & EC (Hydroponics)',
                'Check moisture & humidity (Microgreens)',
                'Inspect plants for stress signs'
            ],
            priority: 'high'
        });
    }

    // Evening reminders (6 PM)
    if (hour === 18) {
        reminders.push({
            time: '6:00 PM',
            title: '🌙 Evening Check',
            tasks: [
                'Top off water reservoirs',
                'Check for mold/disease',
                'Verify timers are functioning'
            ],
            priority: 'medium'
        });
    }

    return reminders;
};
