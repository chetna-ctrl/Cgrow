import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { calculateMissingLogGaps, generateGhostLogFromWeather } from '../../../utils/agriUtils';
import { fetchHistoricalWeather } from '../../../services/weatherService';

/**
 * Hook to automatically synchronize "Ghost Logs" for missing days
 * This bridges the gap between manual logs using historical weather data.
 */
export function useGhostSync(activeCrops, recentLogs) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStats, setSyncStats] = useState({ inserted: 0, crops: 0 });
    const queryClient = useQueryClient();

    useEffect(() => {
        const performSync = async () => {
            if (!activeCrops || activeCrops.length === 0 || isSyncing) return;

            // Limit sync to once per dashboard load
            if (sessionStorage.getItem('ghost_sync_done')) return;

            setIsSyncing(true);
            let totalInserted = 0;
            let cropsProcessed = 0;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Sync logic per crop
                for (const crop of activeCrops) {
                    const isMicrogreens = crop.itemType === 'microgreens';
                    const matchField = isMicrogreens ? 'batch_id' : 'target_id';
                    const systemType = isMicrogreens ? 'Microgreens' : 'Hydroponics';

                    // Find latest log for this specific crop
                    const latestLog = recentLogs.find(l =>
                        l[matchField] === crop.id &&
                        l.system_type === systemType
                    );

                    const lastDate = latestLog?.created_at || crop.plant_date || crop.sow_date;
                    if (!lastDate) continue;

                    const gaps = calculateMissingLogGaps(lastDate);

                    if (gaps.length > 0) {
                        // 1. Fetch historical weather for gaps
                        // We use the first gap as start and last as end
                        // Geolocation is defaulted to Delhi if not available, but ideally we'd pass it
                        // For now, let's use a generic fetch or get lat/lon from localStorage if available
                        const cachedLat = localStorage.getItem('cGrow_lat') || 28.61;
                        const cachedLon = localStorage.getItem('cGrow_lon') || 77.20;

                        const historicalWeather = await fetchHistoricalWeather(
                            cachedLat,
                            cachedLon,
                            gaps[0],
                            gaps[gaps.length - 1]
                        );

                        if (historicalWeather && historicalWeather.length > 0) {
                            const ghostLogs = historicalWeather.map(day => {
                                const baseLog = generateGhostLogFromWeather(day, crop.crop);
                                return {
                                    ...baseLog,
                                    user_id: user.id,
                                    system_type: systemType,
                                    [matchField]: crop.id
                                };
                            });

                            // 2. Batch Insert Ghost Logs
                            const { error } = await supabase.from('daily_logs').insert(ghostLogs);
                            if (!error) {
                                totalInserted += ghostLogs.length;
                                cropsProcessed++;
                            } else {
                                console.error(`Sync error for ${crop.crop}:`, error);
                            }
                        }
                    }
                }

                if (totalInserted > 0) {
                    setSyncStats({ inserted: totalInserted, crops: cropsProcessed });
                    queryClient.invalidateQueries(['daily_logs']);
                    console.log(`🤖 Ghost Sync Complete: Inserted ${totalInserted} logs across ${cropsProcessed} crops.`);
                }

                sessionStorage.setItem('ghost_sync_done', 'true');
            } catch (err) {
                console.error("Ghost Sync Fatal Error:", err);
            } finally {
                setIsSyncing(false);
            }
        };

        // Delay sync by 3 seconds to let dashboard settle
        const timer = setTimeout(performSync, 3000);
        return () => clearTimeout(timer);
    }, [activeCrops, recentLogs, queryClient]);

    return { isSyncing, syncStats };
}
