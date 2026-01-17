import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { calculateDays, getHarvestStatus } from '../../../utils/predictions';
import { HydroSystemSchema } from '../../../utils/validationSchemas';
import { z } from 'zod';
import { useMemo } from 'react';

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
                    plant_date: new Date().toISOString().split('T')[0],
                    status: 'active',
                    current_ph: validated.ph,
                    current_ec: validated.ec,
                    current_temp: validated.temp
                }])
                .select();

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

            return {
                ...sys,
                daysCurrent,
                harvestStatus,
                ph: sys.current_ph || 6.0,
                ec: sys.current_ec || 1.5,
                temp: sys.current_temp || 22
            };
        });
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
        refresh: refetch
    };
};
