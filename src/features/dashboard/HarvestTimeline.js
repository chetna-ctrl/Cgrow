import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isDemoMode } from '../../utils/sampleData';

const HarvestTimeline = () => {
    const [upcomingHarvests, setUpcomingHarvests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                if (isDemoMode()) {
                    // Demo data
                    setUpcomingHarvests([
                        { crop: 'Radish (Mooli)', date: 'Tomorrow', daysAway: 1, quantity: '4 kg', status: 'ready', batchId: 'MG-001' },
                        { crop: 'Sunflower', date: 'In 3 Days', daysAway: 3, quantity: '2.5 kg', status: 'growing', batchId: 'MG-002' },
                        { crop: 'Lettuce (Romaine)', date: 'In 5 Days', daysAway: 5, quantity: '10 kg', status: 'growing', batchId: 'HY-001' }
                    ]);
                } else {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        setLoading(false);
                        return;
                    }

                    // Fetch active batches with harvest dates
                    const { data: batches, error } = await supabase
                        .from('batches')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('status', 'Growing')
                        .not('harvest_date', 'is', null)
                        .order('harvest_date', { ascending: true })
                        .limit(5);

                    if (error) throw error;

                    if (batches && batches.length > 0) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const upcoming = batches.map(batch => {
                            const harvestDate = new Date(batch.harvest_date);
                            const daysAway = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));

                            let dateStr = '';
                            let status = 'growing';

                            if (daysAway <= 0) {
                                dateStr = 'Ready Now!';
                                status = 'ready';
                            } else if (daysAway === 1) {
                                dateStr = 'Tomorrow';
                                status = 'ready';
                            } else if (daysAway <= 7) {
                                dateStr = `In ${daysAway} Days`;
                                status = daysAway <= 2 ? 'ready' : 'growing';
                            } else {
                                dateStr = `In ${daysAway} Days`;
                                status = 'growing';
                            }

                            return {
                                crop: batch.crop,
                                date: dateStr,
                                daysAway,
                                quantity: `${(batch.yield_grams || 0) / 1000} kg (est.)`,
                                status,
                                batchId: batch.batch_id
                            };
                        }).filter(h => h.daysAway <= 14); // Only show next 2 weeks

                        setUpcomingHarvests(upcoming);
                    } else {
                        setUpcomingHarvests([]);
                    }
                }
            } catch (err) {
                console.error('Error fetching harvest timeline:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcoming();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <p className="text-slate-400">Loading timeline...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    Harvest Forecast
                </h3>
                <a href="/microgreens" className="text-sm text-blue-600 font-medium hover:underline">
                    View All
                </a>
            </div>

            {upcomingHarvests.length > 0 ? (
                <div className="space-y-4">
                    {upcomingHarvests.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                {/* Icon based on status */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${item.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {item.status === 'ready' ? '✅' : '🌱'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{item.crop}</p>
                                    <p className="text-xs text-gray-500">Est. Yield: {item.quantity}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`block text-sm font-bold ${item.status === 'ready' ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {item.date}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {item.batchId}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-slate-600 text-sm">No upcoming harvests</p>
                    <p className="text-xs text-slate-400 mt-1">Create batches to see harvest timeline</p>
                </div>
            )}

            {/* Quick Action Button */}
            <a
                href="/microgreens"
                className="block w-full mt-6 py-2 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors text-sm font-medium text-center"
            >
                + Schedule New Harvest
            </a>
        </div>
    );
};

export default HarvestTimeline;
