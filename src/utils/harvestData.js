// import { isDemoMode } from './sampleData';
import { supabase } from '../lib/supabaseClient';

// Get all harvest records (from localStorage in demo mode, or Supabase in real mode)
// Get all harvest records (from Supabase)
export async function getAllHarvests() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // 1. Fetch from 'harvests' (Microgreens)
        const { data: microData, error: microError } = await supabase
            .from('harvests')
            .select('*')
            .eq('user_id', user.id);

        // 2. Fetch from 'harvest_records' (Hydroponics)
        const { data: hydroData, error: hydroError } = await supabase
            .from('harvest_records')
            .select('*')
            .eq('user_id', user.id);

        if (microError) console.error('[Harvest Data] Microgreens error:', microError);
        if (hydroError) console.error('[Harvest Data] Hydroponics error:', hydroError);

        // Normalize Microgreens
        const micro = (microData || []).map(h => ({
            ...h,
            id: h.id,
            total_revenue: h.revenue || 0,
            yield_kg: (h.quantity_weight || 0) / 1000,
            source_type: 'microgreens',
            display_notes: h.notes || 'Microgreens Harvest',
            harvest_date: h.harvest_date
        }));

        // Normalize Hydroponics
        const hydro = (hydroData || []).map(h => ({
            ...h,
            id: h.id,
            total_revenue: h.total_revenue || 0,
            yield_kg: h.yield_kg || 0,
            source_type: 'hydroponics',
            display_notes: `${h.crop || 'Hydro'} Harvest (${h.quality_grade || 'A'})`,
            harvest_date: h.harvest_date
        }));

        // Combine and sort
        return [...micro, ...hydro].sort((a, b) => new Date(b.harvest_date) - new Date(a.harvest_date));
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
