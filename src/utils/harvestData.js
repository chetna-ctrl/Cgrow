// import { isDemoMode } from './sampleData';
import { supabase } from '../lib/supabaseClient';

// Get all harvest records (from localStorage in demo mode, or Supabase in real mode)
// Get all harvest records (from Supabase)
export async function getAllHarvests() {
    // 🔒 PRODUCTION MODE: Fetch from Supabase
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('harvests') // <--- NEW TABLE
            .select('*')
            .eq('user_id', user.id)
            .order('harvest_date', { ascending: false });

        if (error) {
            console.error('[Harvest Data] Error fetching:', error);
            return [];
        }

        // MAP TO LEGACY FORMAT for compatibility
        return (data || []).map(h => ({
            ...h,
            id: h.id,
            total_revenue: h.revenue,
            yield_kg: (h.quantity_weight || 0) / 1000,
            source_type: 'microgreens', // Default for now as table links to batches
            harvest_date: h.harvest_date
        }));
    } catch (err) {
        console.error('[Harvest Data] Exception:', err);
        return [];
    }
}

// Get total revenue from all harvests
export async function getTotalRevenue() {
    const harvests = await getAllHarvests();
    return harvests.reduce((total, harvest) => total + (harvest.total_revenue || 0), 0);
}

// Get total yield from all harvests (in kg)
export async function getTotalYield() {
    const harvests = await getAllHarvests();
    return harvests.reduce((total, harvest) => total + (harvest.yield_kg || 0), 0);
}

// Get harvest count by source type
export async function getHarvestsByType() {
    const harvests = await getAllHarvests();
    return {
        microgreens: harvests.filter(h => h.source_type === 'microgreens').length,
        hydroponics: harvests.filter(h => h.source_type === 'hydroponics').length,
        total: harvests.length
    };
}

// Get recent harvests (last N days)
export async function getRecentHarvests(days = 30) {
    const harvests = await getAllHarvests();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return harvests.filter(h => {
        const harvestDate = new Date(h.harvest_date);
        return harvestDate >= cutoffDate;
    });
}

// Get harvest stats for dashboard
export async function getHarvestStats() {
    const harvests = await getAllHarvests();
    const recent = await getRecentHarvests(30);
    const totalRevenue = await getTotalRevenue();
    const totalYield = await getTotalYield();

    return {
        totalHarvests: harvests.length,
        recentHarvests: recent.length,
        totalRevenue,
        totalYield,
        byType: await getHarvestsByType(),
        averageYield: harvests.length > 0 ? totalYield / harvests.length : 0,
        averageRevenue: harvests.length > 0 ? totalRevenue / harvests.length : 0
    };
}
