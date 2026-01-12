import { useState, useEffect } from 'react';

// Default Data (only used if storage is empty)
const INITIAL_SYSTEMS = [
    { id: 'NFT-1', type: 'NFT', crop: 'Lettuce', ph: 6.2, ec: 1.4, temp: 20, status: 'Healthy', lastCheck: new Date().toISOString() },
    { id: 'DWC-1', type: 'DWC', crop: 'Basil', ph: 5.4, ec: 2.1, temp: 22, status: 'Warning', lastCheck: new Date().toISOString() }
];

export const useHydroponics = () => {
    // 1. Load from Storage
    const [systems, setSystems] = useState(() => {
        const saved = localStorage.getItem('agri_os_hydro_systems');
        return saved ? JSON.parse(saved) : INITIAL_SYSTEMS;
    });

    // 2. Save to Storage on Change
    useEffect(() => {
        localStorage.setItem('agri_os_hydro_systems', JSON.stringify(systems));
    }, [systems]);

    // Logic: Determine Health Status
    const calculateStatus = (ph, ec, temp) => {
        if (ph < 5.5 || ph > 6.5) return 'Critical';
        if (ec < 1.0 || ec > 2.5) return 'Warning';
        if (temp > 25) return 'Warning';
        return 'Healthy';
    };

    const updateSystem = (id, field, value) => {
        setSystems(current => current.map(sys => {
            if (sys.id === id) {
                const updated = { ...sys, [field]: value };
                updated.status = calculateStatus(updated.ph, updated.ec, updated.temp);
                updated.lastCheck = new Date().toISOString();
                return updated;
            }
            return sys;
        }));
    };

    const addSystem = (newSystem) => {
        setSystems([...systems, { ...newSystem, status: 'Healthy', lastCheck: new Date().toISOString() }]);
    };

    const stats = {
        totalSystems: systems.length,
        criticalCount: systems.filter(s => s.status === 'Critical').length,
        healthyCount: systems.filter(s => s.status === 'Healthy').length,
        avgPh: (systems.reduce((acc, s) => acc + Number(s.ph), 0) / systems.length).toFixed(1)
    };

    return { systems, updateSystem, addSystem, stats };
};
