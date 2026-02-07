/**
 * Custom Hook: useOfflineSync
 * Handles offline queue management and sync logic
 * Extracted from DailyTrackerPage for better separation of concerns
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const useOfflineSync = () => {
    const [syncStatus, setSyncStatus] = useState({
        isSyncing: false,
        queueLength: 0,
        lastSyncTime: null
    });

    /**
     * Get current offline queue
     */
    const getQueue = () => {
        return JSON.parse(localStorage.getItem('offline_logs_queue') || '[]');
    };

    /**
     * Add log to offline queue
     */
    const addToQueue = (logData) => {
        const queue = getQueue();
        const syncId = `${logData.user_id}_${logData.created_at}`;
        queue.push({ ...logData, sync_id: syncId });
        localStorage.setItem('offline_logs_queue', JSON.stringify(queue));
        setSyncStatus(prev => ({ ...prev, queueLength: queue.length }));
    };

    /**
     * Sync offline logs to cloud
     */
    const syncOfflineLogs = async () => {
        const queue = getQueue();
        if (queue.length === 0 || !navigator.onLine) return;

        setSyncStatus(prev => ({ ...prev, isSyncing: true }));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSyncStatus(prev => ({ ...prev, isSyncing: false }));
                return;
            }

            // Ensure all logs have user_id and sync_id
            const logsToInsert = queue.map(log => ({
                ...log,
                user_id: user.id,
                sync_id: log.sync_id || `${user.id}_${log.created_at}`
            }));

            const { error } = await supabase
                .from('daily_logs')
                .upsert(logsToInsert, {
                    onConflict: 'sync_id',
                    ignoreDuplicates: false
                });

            if (!error) {
                localStorage.removeItem('offline_logs_queue');
                setSyncStatus({
                    isSyncing: false,
                    queueLength: 0,
                    lastSyncTime: new Date().toISOString()
                });
                return { success: true, count: queue.length };
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Sync failed:", error);
            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
            return { success: false, error: error.message };
        }
    };

    /**
     * Auto-sync on mount and when coming online
     */
    useEffect(() => {
        // Initial queue check
        const queue = getQueue();
        setSyncStatus(prev => ({ ...prev, queueLength: queue.length }));

        // Sync on mount if online
        if (navigator.onLine && queue.length > 0) {
            setTimeout(syncOfflineLogs, 2000);
        }

        // Listen for online event
        const handleOnline = () => {
            syncOfflineLogs();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    return {
        syncStatus,
        addToQueue,
        syncOfflineLogs,
        queueLength: syncStatus.queueLength
    };
};
