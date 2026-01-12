import { useState, useEffect } from 'react';

// HELPER: Date Math (unchanged)
const calculateDays = (sowingDate, status, harvestDate) => {
    const start = new Date(sowingDate);
    const end = (status === 'Harvested' && harvestDate) ? new Date(harvestDate) : new Date();
    const diffTime = end - start;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
};

// INITIAL DATA (Used only if storage is empty)
const MOCK_DATA = [
    { id: 'B001', crop: 'Radish', sowingDate: '2026-01-01', status: 'Harvest Ready', harvestDate: null, qty: 5, yield: 0 },
    { id: 'B002', crop: 'Sunflower', sowingDate: '2026-01-08', status: 'Growing', harvestDate: null, qty: 3, yield: 0 }
];

export const useMicrogreens = () => {
    // 1. IMPROVEMENT: Load from LocalStorage on startup
    const [batches, setBatches] = useState(() => {
        const saved = localStorage.getItem('agri_os_microgreens');
        return saved ? JSON.parse(saved) : MOCK_DATA;
    });

    // 2. ADDITION: Save to LocalStorage whenever 'batches' changes
    // This fixes the link to the Daily Tracker page
    useEffect(() => {
        localStorage.setItem('agri_os_microgreens', JSON.stringify(batches));
    }, [batches]);

    // ACTION: Add Batch
    const addBatch = (newBatch) => {
        const id = `B${(batches.length + 1).toString().padStart(3, '0')}`;
        const batch = {
            id,
            ...newBatch, // { crop, sowDate, qty }
            status: 'Growing', // Default status
            harvestDate: null,
            yield: 0
        };
        setBatches(prev => [batch, ...prev]);
    };

    // ACTION: Harvest Batch (Fixes status sticking)
    const harvestBatch = (id) => {
        setBatches(currentBatches =>
            currentBatches.map(batch => {
                if (batch.id === id) {
                    return {
                        ...batch,
                        status: 'Harvested',
                        harvestDate: new Date().toISOString().split('T')[0]
                    };
                }
                return batch;
            })
        );
    };

    // ALGORITHM: Yield Predictor
    // Calculates expected grams based on historical average of the same crop
    const predictYield = (cropName, qty) => {
        const history = batches.filter(b => b.crop === cropName && b.status === 'Harvested');
        if (history.length === 0) return qty * 150; // Default fallback: 150g per tray

        const totalYield = history.reduce((sum, b) => sum + (b.yield || 150), 0); // Assume 150g if yield missing
        const avgYieldPerTray = totalYield / history.length;

        return Math.floor(avgYieldPerTray * qty);
    };

    // Process data to add the "days" calculation dynamically
    const processedBatches = batches.map(batch => ({
        ...batch,
        daysCurrent: calculateDays(batch.sowingDate, batch.status, batch.harvestDate)
    }));

    return {
        batches: processedBatches,
        harvestBatch,
        addBatch,
        predictYield // Export the new algorithm
    };
};
