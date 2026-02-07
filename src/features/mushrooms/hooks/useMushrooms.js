import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { MushroomBatchSchema } from '../../../utils/validationSchemas';
import { z } from 'zod';

export const useMushrooms = () => {
    const queryClient = useQueryClient();

    // 1. QUERY: Fetch Batches
    const {
        data: batches = [],
        isLoading: loading,
        refetch
    } = useQuery({
        queryKey: ['mushrooms'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('mushroom_batches')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Mushroom fetch error:", error);
                return [];
            }
            return data || [];
        }
    });

    // 2. MUTATION: Add Batch
    const addBatchMutation = useMutation({
        mutationFn: async (newBatch) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // Validate
            const validated = MushroomBatchSchema.parse(newBatch);

            const { data, error } = await supabase
                .from('mushroom_batches')
                .insert([{
                    user_id: user.id,
                    name: `${validated.type} #${batches.length + 1}`,
                    mushroom_type: validated.type,
                    bag_count: validated.bags,
                    start_date: validated.startDate,
                    status: 'Active',
                    current_stage: 'Spawn Run'
                }])
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['mushrooms']);
        }
    });

    // 3. MUTATION: Delete Batch
    const deleteBatchMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('mushroom_batches')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['mushrooms']);
        }
    });

    // Wrapper functions
    const addBatch = async (data) => {
        try {
            await addBatchMutation.mutateAsync(data);
        } catch (err) {
            if (err instanceof z.ZodError) {
                alert(`Validation Error: ${err.issues.map(i => i.message).join(', ')}`);
            } else {
                console.error('Add batch error:', err);
                alert('Backend Sync Failed: Ensure mushroom_batches table exists in Supabase.');
            }
        }
    };

    const deleteBatch = async (id) => {
        try {
            await deleteBatchMutation.mutateAsync(id);
        } catch (err) {
            console.error('Delete batch error:', err);
        }
    };

    return {
        batches,
        loading,
        addBatch,
        deleteBatch,
        refresh: refetch
    };
};
