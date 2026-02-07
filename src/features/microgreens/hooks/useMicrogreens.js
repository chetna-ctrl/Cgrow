import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { calculateDays, predictYield as predictYieldUtil, getHarvestStatus, isReadyToHarvest } from '../../../utils/predictions';
import { calculateFarmHealth, calculateDailyGDD, getMicrogreensAction } from '../../../utils/agriUtils';
// import { isDemoMode } from '../../../utils/sampleData';
import { BatchSchema } from '../../../utils/validationSchemas';
import { z } from 'zod';
import React, { useState, useEffect, useMemo } from 'react';

export const useMicrogreens = () => {
    const queryClient = useQueryClient();

    // 1. FETCH QUERY
    const {
        data: batches = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['microgreens'],
        queryFn: async () => {
            // 🔒 SECURITY: Fetch only current user's batches
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return []; // Return empty array if not logged in

            const { data, error } = await supabase
                .from('batches')
                .select('*')
                .eq('user_id', user.id) // 🔑 Filter by user ID
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });

    // 2. MUTATION: Add Batch
    const addBatchMutation = useMutation({
        mutationFn: async (newBatch) => {
            // 🔒 VALIDATE INPUT
            const validated = BatchSchema.parse(newBatch);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const batchToInsert = {
                user_id: user.id,
                batch_id: `B${Date.now().toString().slice(-6)}`,
                crop: validated.crop,
                qty: validated.qty,
                tray_id: `${validated.qty} Trays`,
                sow_date: validated.sowDate,
                status: 'Growing',
                yield_grams: 0,
                seed_weight: validated.seedWeight || 0 // Store actual seed weight
            };

            const { data, error } = await supabase
                .from('batches')
                .insert([batchToInsert])
                .select();

            if (error) throw error;

            // --- SMART SEED VAULT LOGIC ---
            try {
                // 1. Estimate Seed Needs (Approx 150g per tray for Sunflower/Peas, 50g for small seeds)
                // This is a rough heuristic. In future, fetch density from a 'crops' table.
                const isLargeSeed = ['Sunflower', 'Pea', 'Wheatgrass'].some(c => validated.crop.includes(c));
                const gramsPerTray = isLargeSeed ? 150 : 40;
                const totalGramsNeeded = validated.qty * gramsPerTray;

                // 2. Check & Deduct from Inventory
                // We use RPC or simple update. Using simple update for now.
                // NOTE: This assumes 'inventory' table exists. Fails silently if not to prevent blocking batch creation.
                const { data: stock, error: invError } = await supabase
                    .from('inventory')
                    .select('id, quantity_grams')
                    .eq('crop_name', validated.crop)
                    .single();

                if (stock) {
                    const newQty = Math.max(0, stock.quantity_grams - totalGramsNeeded);
                    await supabase
                        .from('inventory')
                        .update({ quantity_grams: newQty })
                        .eq('id', stock.id);

                    if (newQty < 200) {
                        alert(`⚠️ Low Seed Alert: Only ${newQty}g ${validated.crop} seeds remaining!`);
                    }
                }
            } catch (invErr) {
                console.warn("Seed Vault: Inventory update failed (Feature likely not set up yet)", invErr);
            }
            // -------------------------------

            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch to update UI
            queryClient.invalidateQueries(['microgreens']);
        }
    });

    // 3. MUTATION: Harvest Batch
    const harvestBatchMutation = useMutation({
        mutationFn: async ({ id, yield_grams, quality_grade, price_per_kg, harvest_date }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // 🔍 FETCH BATCH DIRECTLY (More Robust)
            const { data: batch, error: fetchError } = await supabase
                .from('batches')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError || !batch) throw new Error("Batch not found in database: " + (fetchError?.message || ''));

            // 1. Update Batch Status
            const { error: batchError } = await supabase
                .from('batches')
                .update({
                    status: 'Harvested',
                    lifecycle_stage: 'completed', // <--- Added lifecycle update
                    harvest_date,
                    yield_grams,
                    revenue: (yield_grams / 1000) * price_per_kg
                })
                .eq('id', id);

            if (batchError) throw batchError;

            // 2. Create Harvest Record
            const { error: recordError } = await supabase
                .from('harvests') // <--- CHANGED from harvest_records
                .insert([{
                    user_id: user.id,
                    batch_id: batch.id, // Use valid UUID
                    quantity_weight: yield_grams, // Store in grams as per schema
                    revenue: (yield_grams / 1000) * price_per_kg,
                    waste_weight: 0, // Default for now
                    harvest_date,
                    notes: `Harvested ${batch.crop}. Grade: ${quality_grade}`
                }]);

            if (recordError) throw recordError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['microgreens']);
            queryClient.invalidateQueries(['harvests']);
        }
    });

    // Wrapper function to maintain API compatibility
    const addBatch = async (newBatch) => {
        try {
            await addBatchMutation.mutateAsync(newBatch);
            return { success: true };
        } catch (error) {
            // Handle validation errors separately
            if ((error instanceof z.ZodError) || (error && error.issues && Array.isArray(error.issues)) || (error && error.errors && Array.isArray(error.errors))) {
                const issues = error.issues || error.errors || [];
                const friendlyMessage = issues.map(e => e.message).join(', ');
                alert(`Invalid input: ${friendlyMessage}`);
                return { success: false, error };
            }
            alert(error.message);
            return { success: false, error };
        }
    };

    const harvestBatch = async (id, data) => {
        try {
            await harvestBatchMutation.mutateAsync({ id, ...data });
        } catch (error) {
            console.error("Harvest error:", error);
            alert(error.message);
        }
    };

    // 4. ALGORITHM: Yield Predictor
    const predictYield = (cropName, qty) => {
        return predictYieldUtil(cropName, qty);
    };

    // 2. FETCH LOGS (Unified Key)
    const { data: logs = [] } = useQuery({
        queryKey: ['daily_logs'], // UNIFIED KEY
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('daily_logs')
                .select('*') // Select all columns
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching logs for GDD:", error);
                return [];
            }
            return data;
        },
        staleTime: 0 // Always fetch fresh logs
    });

    // 5. FETCH HISTORICAL WEATHER (For Backfilling)
    const [historicalWeather, setHistoricalWeather] = useState({}); // { 'YYYY-MM-DD': { min, max } }

    // Process data for UI (OPTIMIZED with useMemo)
    const processedBatches = useMemo(() => {
        return batches.map(batch => {
            const sowDate = batch.sow_date;
            const status = batch.status;
            const harvestDate = batch.harvest_date;

            // Robust quantity parsing
            const qty = batch.qty || parseInt(batch.tray_id?.match(/\d+/)?.[0]) || 1;

            // Calculate days
            const daysCurrent = status === 'Harvested' && harvestDate
                ? calculateDays(sowDate, harvestDate)
                : calculateDays(sowDate, new Date());

            const harvestStatusInfo = getHarvestStatus(batch.crop, sowDate, status);
            const readyToHarvest = isReadyToHarvest(batch.crop, sowDate, status);

            // GDD Calculation
            // Robust matching: Check batch_id, target_id, and system_id (covers legacy and manual logs)
            const batchLogs = logs.filter(l =>
                String(l.batch_id) === String(batch.id) ||
                String(l.batch_id) === String(batch.batch_id) ||
                String(l.target_id) === String(batch.id) ||
                String(l.target_id) === String(batch.batch_id) ||
                String(l.system_id) === String(batch.id)
            );

            // DETECT LOG GAPS & BACKFILL
            let gddAccumulated = 0;
            let missingDays = 0;
            let needsCatchup = false;

            const startDate = new Date(sowDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = status === 'Harvested' ? new Date(harvestDate) : new Date();
            endDate.setHours(0, 0, 0, 0);

            // Iterate through every day from sowing to now
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const logForDay = batchLogs.find(l => l.created_at.split('T')[0] === dateStr);

                if (logForDay) {
                    const dailyGDD = calculateDailyGDD(logForDay.temp || 24, logForDay.temp || 24, batch.crop);
                    gddAccumulated += dailyGDD;
                } else {
                    // MISSING LOG: Backfill with historical weather if available
                    const hist = historicalWeather[dateStr];
                    if (hist) {
                        const dailyGDD = calculateDailyGDD(hist.max, hist.min, batch.crop);
                        gddAccumulated += dailyGDD;
                    }
                    if (d < endDate) { // Don't count "today" as a gap yet if it's early
                        missingDays++;
                        needsCatchup = true;
                    }
                }
            }

            // Latest Log for Health
            const latestLog = batchLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            // If missing logs, we create a "Virtual Log" for the health engine to flag gaps
            const effectiveLog = latestLog || {
                created_at: new Date().toISOString(),
                isBackfilled: true
            };

            const { score: healthScore, reasons, details: healthDetails } = calculateFarmHealth(
                effectiveLog,
                daysCurrent,
                'microgreens',
                batch.crop
            );

            // Maturity Logic: (GDD% * 0.4) + (Health% * 0.6)
            const gddProgress = Math.min(100, (gddAccumulated / (batch.crop === 'Sunflower' ? 200 : 120)) * 100);
            const rawMaturity = (gddProgress * 0.4) + (healthScore * 0.6);
            const maturityPercentage = Math.min(100, Math.round(rawMaturity));

            return {
                ...batch,
                sowingDate: sowDate,
                harvestDate: harvestDate,
                qty,
                daysCurrent,
                harvestStatus: harvestStatusInfo,
                readyToHarvest,
                gddAccumulated: Math.round(gddAccumulated),
                lastLogDate: latestLog?.created_at,
                healthScore,
                maturityPercentage,
                healthDetails,
                actionNeeded: getMicrogreensAction(daysCurrent, batch.crop),
                missingDays,
                needsCatchup
            };
        });
    }, [batches, logs, historicalWeather]);

    // Side Effect: Fetch missing historical weather
    useEffect(() => {
        const fetchMissing = async () => {
            const gaps = [];
            batches.forEach(batch => {
                if (batch.status === 'Harvested') return;
                const start = new Date(batch.sow_date);
                const end = new Date();
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const ds = d.toISOString().split('T')[0];
                    if (!historicalWeather[ds]) gaps.push(ds);
                }
            });

            if (gaps.length > 0) {
                const minDate = gaps.sort()[0];
                const maxDate = gaps.sort().reverse()[0];

                // Get Location (Default to Delhi for GDD fallback if Geo fails)
                const lat = 28.61, lon = 77.20;

                const { fetchHistoricalWeather } = await import('../../../services/weatherService');
                const weather = await fetchHistoricalWeather(lat, lon, minDate, maxDate);

                const newHist = { ...historicalWeather };
                weather.forEach(w => {
                    newHist[w.date] = { min: w.min, max: w.max };
                });
                setHistoricalWeather(newHist);
            }
        };

        if (batches.length > 0) fetchMissing();
    }, [batches]);

    return {
        batches: processedBatches,
        loading,
        error: error ? error.message : null,
        harvestBatch,
        addBatch,
        predictYield
    };
};
