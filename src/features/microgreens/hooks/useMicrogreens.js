import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { calculateDays, predictYield as predictYieldUtil, getHarvestStatus, isReadyToHarvest } from '../../../utils/predictions';
import { isDemoMode } from '../../../utils/sampleData';
import { BatchSchema } from '../../../utils/validationSchemas';
import { z } from 'zod';
import { useMemo } from 'react';

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
            if (isDemoMode()) {
                const stored = localStorage.getItem('demo_batches');
                return stored ? JSON.parse(stored) : [];
            } else {
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
            }
        },
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });

    // 2. MUTATION: Add Batch
    const addBatchMutation = useMutation({
        mutationFn: async (newBatch) => {
            // 🔒 VALIDATE INPUT
            const validated = BatchSchema.parse(newBatch);

            if (isDemoMode()) {
                const batchToInsert = {
                    id: `demo-batch-${Date.now()}`,
                    batch_id: `B${Date.now().toString().slice(-6)}`,
                    crop: validated.crop,
                    qty: validated.qty,
                    tray_id: `${validated.qty} Trays`,
                    sow_date: validated.sowDate,
                    status: 'Growing',
                    yield_grams: 0,
                    user_id: 'demo-user'
                };

                const currentBatches = queryClient.getQueryData(['microgreens']) || [];
                const updated = [batchToInsert, ...currentBatches];
                localStorage.setItem('demo_batches', JSON.stringify(updated));
                return updated;
            } else {
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
                    yield_grams: 0
                };

                const { data, error } = await supabase
                    .from('batches')
                    .insert([batchToInsert])
                    .select();

                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            // Invalidate and refetch to update UI
            queryClient.invalidateQueries(['microgreens']);
        }
    });

    // 3. MUTATION: Harvest Batch
    const harvestBatchMutation = useMutation({
        mutationFn: async (id) => {
            const today = new Date().toISOString().split('T')[0];
            const batch = batches.find(b => b.id === id);

            // Validate harvest date
            if (batch && new Date(today) < new Date(batch.sow_date)) {
                throw new Error("Harvest date cannot be before sowing date!");
            }

            if (isDemoMode()) {
                const currentBatches = queryClient.getQueryData(['microgreens']) || [];
                const updated = currentBatches.map(b =>
                    b.id === id ? { ...b, status: 'Harvested', harvest_date: today } : b
                );
                localStorage.setItem('demo_batches', JSON.stringify(updated));
                return updated;
            } else {
                const { error } = await supabase
                    .from('batches')
                    .update({ status: 'Harvested', harvest_date: today })
                    .eq('id', id);

                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['microgreens']);
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

    const harvestBatch = async (id) => {
        try {
            await harvestBatchMutation.mutateAsync(id);
        } catch (error) {
            alert(error.message);
        }
    };

    // 4. ALGORITHM: Yield Predictor
    const predictYield = (cropName, qty) => {
        return predictYieldUtil(cropName, qty);
    };

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

            return {
                ...batch,
                sowingDate: sowDate,
                harvestDate: harvestDate,
                qty,
                daysCurrent,
                harvestStatus: harvestStatusInfo,
                readyToHarvest
            };
        });
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
