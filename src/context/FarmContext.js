import React, { createContext, useContext, useState, useEffect } from 'react';

// --- INITIAL DATA & CONFIG ---
const KEYS = {
    HYDRO_SYSTEMS: 'agri_os_hydro_systems',
    LOGS: 'agri_os_daily_logs',
    MICROGREENS: 'agri_os_microgreens'
};

const DEFAULT_HYDRO = [
    { id: 'NFT-1', type: 'NFT', crop: 'Lettuce', ph: 6.2, ec: 1.4, temp: 20, status: 'Healthy', lastCheck: new Date().toISOString() },
    { id: 'DWC-1', type: 'DWC', crop: 'Basil', ph: 5.4, ec: 2.1, temp: 22, status: 'Warning', lastCheck: new Date().toISOString() }
];

// Create Context
const FarmContext = createContext();

// --- PROVIDER COMPONENT ---
export const FarmProvider = ({ children }) => {
    // 1. STATE INITIALIZATION (Lazy Load from Storage)
    const [hydroSystems, setHydroSystems] = useState(() => {
        try {
            const saved = localStorage.getItem(KEYS.HYDRO_SYSTEMS);
            return saved ? JSON.parse(saved) : DEFAULT_HYDRO;
        } catch { return DEFAULT_HYDRO; }
    });

    const [dailyLogs, setDailyLogs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
        } catch { return []; }
    });

    const [microgreens, setMicrogreens] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(KEYS.MICROGREENS) || '[]');
        } catch { return []; }
    });

    // 2. PERSISTENCE EFFECTS
    useEffect(() => {
        localStorage.setItem(KEYS.HYDRO_SYSTEMS, JSON.stringify(hydroSystems));
    }, [hydroSystems]);

    useEffect(() => {
        localStorage.setItem(KEYS.LOGS, JSON.stringify(dailyLogs));
    }, [dailyLogs]);

    useEffect(() => {
        localStorage.setItem(KEYS.MICROGREENS, JSON.stringify(microgreens));
    }, [microgreens]);

    // 3. LOGIC & ACTIONS

    // --- HYDROPONICS ACTIONS ---
    const calculateStatus = (ph, ec, temp) => {
        if (ph < 5.5 || ph > 6.5) return 'Critical';
        if (ec < 1.0 || ec > 2.5) return 'Warning';
        if (temp > 25) return 'Warning';
        return 'Healthy';
    };

    const addSystem = (newSystem) => {
        const sys = {
            ...newSystem,
            status: calculateStatus(newSystem.ph, newSystem.ec, newSystem.temp),
            lastCheck: new Date().toISOString()
        };
        setHydroSystems(prev => [...prev, sys]);
    };

    const updateSystem = (id, field, value) => {
        setHydroSystems(prev => prev.map(sys => {
            if (sys.id === id) {
                const updated = { ...sys, [field]: value };
                // Re-calc status if metrics change
                if (['ph', 'ec', 'temp'].includes(field)) {
                    updated.status = calculateStatus(updated.ph, updated.ec, updated.temp);
                }
                updated.lastCheck = new Date().toISOString();
                return updated;
            }
            return sys;
        }));
    };

    // --- LOGS ACTIONS ---
    const addLog = (log) => {
        const newLog = { ...log, id: Date.now(), timestamp: new Date().toISOString() };
        setDailyLogs(prev => [newLog, ...prev]);
    };

    // --- MICROGREENS ACTIONS ---
    const addBatch = (batch) => {
        const newBatch = { ...batch, id: Date.now(), status: 'Growing', timestamp: new Date().toISOString() };
        setMicrogreens(prev => [...prev, newBatch]);
    };

    const harvestBatch = (id) => {
        setMicrogreens(prev => prev.map(b => b.id === id ? { ...b, status: 'Harvested', harvestDate: new Date().toISOString() } : b));
    };

    // --- DERIVED STATS (Getters) ---
    const getHydroStats = () => ({
        totalSystems: hydroSystems.length,
        criticalCount: hydroSystems.filter(s => s.status === 'Critical').length,
        healthyCount: hydroSystems.filter(s => s.status === 'Healthy').length,
        avgPh: hydroSystems.length ? (hydroSystems.reduce((acc, s) => acc + Number(s.ph), 0) / hydroSystems.length).toFixed(1) : 0
    });

    const getLatestLog = () => dailyLogs[0] || null;

    // EXPOSED VALUE
    const value = {
        // State
        hydroSystems,
        dailyLogs,
        microgreens,
        // Actions
        addSystem,
        updateSystem,
        addLog,
        addBatch,
        harvestBatch,
        // Helpers
        getHydroStats,
        getLatestLog
    };

    return (
        <FarmContext.Provider value={value}>
            {children}
        </FarmContext.Provider>
    );
};

// Custom Hook for Consumer
export const useFarmContext = () => useContext(FarmContext);
