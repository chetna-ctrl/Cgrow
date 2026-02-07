import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { calculateDays, getHarvestStatus } from '../../../utils/predictions';
import { calculateFarmHealth, GDD_TARGETS, calculateDailyGDD } from '../../../utils/agriUtils';
import { HydroSystemSchema } from '../../../utils/validationSchemas';
// import { isDemoMode } from '../../../utils/sampleData';
import { z } from 'zod';
import React, { useState, useEffect, useMemo } from 'react';

export const useHydroponics = () => {
    const queryClient = useQueryClient();

    // 1. QUERY: Fetch Systems
    const {
        data: systems = [],
        isLoading: loading,
        refetch
    } = useQuery({
        queryKey: ['hydroponics'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('systems')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });

    // 2. MUTATION: Add System
    const addSystemMutation = useMutation({
        mutationFn: async (newSystem) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // 🔒 VALIDATE INPUT
            const validated = HydroSystemSchema.parse(newSystem);

            const { data, error } = await supabase
                .from('systems')
                .insert([{
                    user_id: user.id,
                    system_id: validated.id,
                    system_type: validated.type,
                    crop: validated.crop,
                    plant_date: newSystem.plantDate || new Date().toISOString().split('T')[0], // Allow custom date
                    status: 'active',
                    current_ph: validated.ph,
                    current_ec: validated.ec,
                    current_temp: validated.temp
                }])
                .select();
            // ...


            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['hydroponics']);
            alert('System added successfully!');
        }
    });

    // 3. MUTATION: Update System
    const updateSystemMutation = useMutation({
        mutationFn: async ({ id, field, value }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('systems')
                .update({ [field]: value })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['hydroponics']);
        }
    });

    // 4. MUTATION: Delete System
    const deleteSystemMutation = useMutation({
        mutationFn: async (systemId) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('systems')
                .delete()
                .eq('id', systemId)
                .eq('user_id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['hydroponics']);
        }
    });

    // Wrapper functions for compatibility
    const addSystem = async (newSystem) => {
        try {
            await addSystemMutation.mutateAsync(newSystem);
        } catch (err) {
            // Handle validation errors
            if ((err instanceof z.ZodError) || (err && err.issues && Array.isArray(err.issues)) || (err && err.errors && Array.isArray(err.errors))) {
                const issues = err.issues || err.errors || [];
                const friendlyMessage = issues.map(e => e.message).join(', ');
                alert(`Invalid input: ${friendlyMessage}`);
                return;
            }
            console.error('Add error:', err);
            alert('Error adding system');
        }
    };

    const updateSystem = async (id, field, value) => {
        try {
            await updateSystemMutation.mutateAsync({ id, field, value });
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const deleteSystem = async (systemId) => {
        try {
            await deleteSystemMutation.mutateAsync(systemId);
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    // 5. MUTATION: Harvest System
    const harvestSystemMutation = useMutation({
        mutationFn: async ({ id, yield_kg, quality_grade, price_per_kg, harvest_date }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // 1. Update System Status
            const { data: updatedData, error: sysError } = await supabase
                .from('systems')
                .update({ status: 'Harvested', harvest_date })
                .eq('id', id)
                .select();

            if (sysError) throw sysError;
            if (!updatedData || updatedData.length === 0) {
                throw new Error(`Failed to harvest: System ID ${id} not found/updated. Check permissions.`);
            }

            // 2. Create Harvest Record
            // Fetch crop name for record
            const { data: sysData } = await supabase.from('systems').select('crop').eq('id', id).single();

            const { error: recordError } = await supabase
                .from('harvest_records')
                .insert([{
                    user_id: user.id,
                    source_type: 'hydroponics',
                    source_id: id,
                    crop: sysData?.crop || 'Unknown',
                    harvest_date,
                    yield_kg,
                    quality_grade,
                    selling_price_per_kg: price_per_kg,
                    total_revenue: yield_kg * price_per_kg,
                    notes: `Hydroponic harvest`
                }]);

            if (recordError) throw recordError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['hydroponics']);
            queryClient.invalidateQueries(['harvest_records']);
        }
    });

    const harvestSystem = async (id, data) => {
        try {
            await harvestSystemMutation.mutateAsync({ id, ...data });
        } catch (err) {
            console.error('Harvest error:', err);
            alert(err.message);
        }
    };


    // 1.5. QUERY: Fetch Logs for GDD (Unified Key)
    const { data: logs = [] } = useQuery({
        queryKey: ['daily_logs'], // UNIFIED KEY - Matches Tracker
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Fetch ALL logs for the user to ensure single source of truth
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*') // Select all columns
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching logs:", error);
                return [];
            }
            return data;
        },
        staleTime: 0 // Always fetch fresh logs
    });

    // 1.7. FETCH HISTORICAL WEATHER (For Backfilling)
    const [historicalWeather, setHistoricalWeather] = useState({}); // { 'YYYY-MM-DD': { min, max } }

    // Process data for UI
    const processedSystems = useMemo(() => {
        return systems.map(sys => {
            const plantDate = sys.plant_date || sys.created_at;
            const status = sys.status;
            const harvestDate = sys.harvest_date;

            // Calculate days (stops after harvest)
            const daysCurrent = (status === 'harvested' || status === 'Harvested') && harvestDate
                ? calculateDays(plantDate, harvestDate)
                : calculateDays(plantDate, new Date());

            // Get harvest status message
            const harvestStatus = getHarvestStatus(sys.crop, plantDate, status);

            // GDD Calculation
            // Match logs by target_id or system_id
            const systemLogs = logs.filter(l =>
                String(l.target_id) === String(sys.id) ||
                String(l.target_id) === String(sys.system_id) ||
                String(l.system_id) === String(sys.id)
            );

            // DETECT LOG GAPS & BACKFILL
            let gddAccumulated = 0;
            let missingDays = 0;
            let needsCatchup = false;

            const startDate = new Date(plantDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = (status === 'harvested' || status === 'Harvested') ? new Date(harvestDate) : new Date();
            endDate.setHours(0, 0, 0, 0);

            // Iterate through every day from planting to now
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const logForDay = systemLogs.find(l => (l.created_at || '').split('T')[0] === dateStr);

                if (logForDay) {
                    const dailyGDD = calculateDailyGDD(logForDay.temp || 24, logForDay.temp || 24, sys.crop);
                    gddAccumulated += dailyGDD;
                } else {
                    // MISSING LOG: Backfill with historical weather if available
                    const hist = historicalWeather[dateStr];
                    if (hist) {
                        const dailyGDD = calculateDailyGDD(hist.max, hist.min, sys.crop);
                        gddAccumulated += dailyGDD;
                    }
                    if (d < endDate) {
                        missingDays++;
                        needsCatchup = true;
                    }
                }
            }

            // Find latest log for current status
            const latestLog = systemLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

            // If missing logs, we create a "Virtual Log" for the health engine to flag gaps
            const effectiveLog = latestLog || {
                created_at: new Date().toISOString(),
                isBackfilled: true
            };

            // Health Logic
            const { score: healthScore, reasons, details: healthDetails } = calculateFarmHealth(effectiveLog, daysCurrent, 'hydroponics', sys.crop);
            // Re-calculate with sub-type awareness if effectiveLog doesn't have it
            if (!effectiveLog.system_type) {
                effectiveLog.system_type = sys.system_type;
            }
            const { score: refinedScore, reasons: refinedReasons, details: refinedDetails } = calculateFarmHealth(effectiveLog, daysCurrent, 'hydroponics', sys.crop);

            // Maturity Logic: (GDD% * 0.4) + (Health% * 0.6)
            const targetGDD = GDD_TARGETS[sys.crop] || (sys.crop === 'Lettuce' ? 700 : 1500);
            const gddProgress = Math.min(100, ((gddAccumulated || 0) / targetGDD) * 100);
            const rawMaturity = (gddProgress * 0.4) + (healthScore * 0.6);
            const maturityPercentage = Math.min(100, Math.round(rawMaturity));

            return {
                ...sys,
                daysCurrent,
                harvestStatus,
                ph: latestLog?.ph || sys.current_ph || 6.0,
                ec: latestLog?.ec || sys.current_ec || 1.5,
                temp: latestLog?.temp || sys.current_temp || 22,
                water_level: latestLog?.water_level || sys.water_level || 'OK',
                gddAccumulated: Math.round(gddAccumulated),
                lastLogDate: latestLog?.created_at,
                healthScore: refinedScore,
                maturityPercentage,
                healthDetails: refinedDetails,
                healthReasons: refinedReasons,
                missingDays,
                needsCatchup
            };
        });
    }, [systems, logs, historicalWeather]);

    // Side Effect: Fetch missing historical weather
    useEffect(() => {
        const fetchMissing = async () => {
            const gaps = [];
            systems.forEach(sys => {
                if (sys.status === 'Harvested') return;
                const start = new Date(sys.plant_date || sys.created_at);
                const end = new Date();
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const ds = d.toISOString().split('T')[0];
                    if (!historicalWeather[ds]) gaps.push(ds);
                }
            });

            if (gaps.length > 0) {
                const sortedGaps = gaps.sort();
                const minDate = sortedGaps[0];
                const maxDate = sortedGaps[sortedGaps.length - 1];

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

        if (systems.length > 0) fetchMissing();
    }, [systems]);

    const stats = useMemo(() => ({
        totalSystems: systems.filter(s => s.status !== 'Harvested').length,
        criticalCount: systems.filter(s => s.status === 'critical' || s.status === 'Critical').length,
        healthyCount: systems.filter(s => s.status === 'active' || s.status === 'Healthy').length,
        avgPh: systems.length ? (systems.reduce((acc, s) => acc + Number(s.current_ph || s.ph || 0), 0) / systems.length).toFixed(1) : 0
    }), [systems]);

    return {
        systems: processedSystems,
        updateSystem,
        addSystem,
        deleteSystem,
        stats,
        loading,
        refresh: refetch,
        harvestSystem
    };
};
