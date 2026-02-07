import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for realtime sensor data updates
 * Subscribes to sensor_readings table and auto-updates dashboard
 * 
 * @param {string} batchId - Optional batch ID to filter updates
 * @param {string} targetId - Optional target ID to filter updates
 * @returns {object} { latestReading, isLive }
 */
export const useSensorData = (batchId = null, targetId = null) => {
    const [latestReading, setLatestReading] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Subscribe to realtime sensor updates
        const channel = supabase
            .channel('sensor-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'sensor_readings'
            }, (payload) => {
                const newReading = payload.new;

                // Filter by batch/target if specified
                if (batchId && newReading.batch_id !== batchId) return;
                if (targetId && newReading.target_id !== targetId) return;

                // Update state
                setLatestReading(newReading);
                setIsLive(true);

                // Invalidate queries to refresh dashboard
                queryClient.invalidateQueries(['daily_logs']);
                queryClient.invalidateQueries(['sensor_readings']);

                console.log('📡 New sensor data received:', newReading);
            })
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [batchId, targetId, queryClient]);

    return { latestReading, isLive };
};

/**
 * Hook to check if user has any IoT devices
 * Used to conditionally show IoT features
 */
export const useHasIoTDevices = () => {
    const [hasDevices, setHasDevices] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkDevices = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('iot_devices')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);

            if (!error && data && data.length > 0) {
                setHasDevices(true);
            }

            setLoading(false);
        };

        checkDevices();
    }, []);

    return { hasDevices, loading };
};
