/**
 * farmStore.js
 * Central "Single Source of Truth" for cGrow.
 * Handles reading/writing to localStorage and aggregating data.
 */

const KEYS = {
    LOGS: 'agri_os_daily_logs',
    MICROGREENS: 'agri_os_microgreens',
    HYDRO_SYSTEMS: 'agri_os_hydro_systems'
};

// --- DATA ACCESS ---

export const getLogs = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
    } catch { return []; }
};

export const getMicrogreens = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.MICROGREENS) || '[]');
    } catch { return []; }
};

export const getHydroSystems = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.HYDRO_SYSTEMS) || '[]');
    } catch { return []; }
};

// --- ANALYTICS HELPERS ---

export const getLatestConditions = () => {
    const logs = getLogs();
    if (logs.length === 0) return null;

    // Get the absolute latest log
    const latest = logs[0];
    return {
        ph: parseFloat(latest.ph) || 6.0,
        temp: parseFloat(latest.temp) || 20,
        ec: parseFloat(latest.ec) || 1.5,
        humidity: 60, // Default as we don't log humidity yet, but could add
        timestamp: latest.timestamp,
        source: latest.targetId
    };
};

export const getFinancialStats = () => {
    const batches = getMicrogreens();

    // Filter for Harvested
    const harvested = batches.filter(b => b.status === 'Harvested');

    // Calculate Totals
    // Assuming Avg Sales Price ₹150/kg => ₹0.15/gram
    const PRICE_PER_GRAM = 0.15; // Conservative estimate

    const totalYieldGrams = harvested.reduce((acc, curr) => acc + (parseFloat(curr.yield) || 0), 0);
    const totalRevenue = totalYieldGrams * PRICE_PER_GRAM;

    return {
        harvestedCount: harvested.length,
        totalYieldGrams,
        totalRevenue: Math.round(totalRevenue)
    };
};

// --- EVENTS ---

// Helper to notify app of changes (for real-time sync across components if they are mounted)
export const notifyUpdates = () => {
    window.dispatchEvent(new Event('AGRI_OS_UPDATE'));
};
