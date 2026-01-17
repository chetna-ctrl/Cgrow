import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isDemoMode } from '../../utils/sampleData';

const YieldChart = () => {
    const [yieldData, setYieldData] = useState([]);
    const [performance, setPerformance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYieldData = async () => {
            try {
                if (isDemoMode()) {
                    // Demo data
                    setYieldData([
                        { name: 'Radish A', actual: 4.2, target: 4.0 },
                        { name: 'Peas B', actual: 3.8, target: 4.5 },
                        { name: 'Basil', actual: 2.1, target: 2.0 },
                        { name: 'Lettuce', actual: 12.0, target: 11.5 },
                        { name: 'Sunflower', actual: 3.5, target: 3.2 }
                    ]);
                    setPerformance(8);
                } else {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        setLoading(false);
                        return;
                    }

                    // Fetch harvest records from batches table
                    const { data: harvests, error } = await supabase
                        .from('batches')
                        .select('crop, batch_id, yield_grams, status')
                        .eq('user_id', user.id)
                        .eq('status', 'Harvested')
                        .order('harvest_date', { ascending: false })
                        .limit(5);

                    if (error) throw error;

                    if (harvests && harvests.length > 0) {
                        // Convert to kg and add target based on crop type
                        const cropTargets = {
                            'Radish': 4.0,
                            'Sunflower': 3.5,
                            'Peas': 4.5,
                            'Basil': 2.0,
                            'Lettuce': 11.5,
                            'Fenugreek': 3.0,
                            'Default': 3.5
                        };

                        const chartData = harvests.map(h => ({
                            name: h.batch_id || h.crop,
                            actual: (h.yield_grams || 0) / 1000, // Convert to kg
                            target: cropTargets[h.crop] || cropTargets.Default
                        }));

                        setYieldData(chartData);

                        // Calculate performance
                        const totalActual = chartData.reduce((sum, d) => sum + d.actual, 0);
                        const totalTarget = chartData.reduce((sum, d) => sum + d.target, 0);
                        const perf = totalTarget > 0 ? ((totalActual / totalTarget - 1) * 100).toFixed(0) : 0;
                        setPerformance(perf);
                    } else {
                        // No harvests yet - show demo data
                        setYieldData([
                            { name: 'No harvests yet', actual: 0, target: 4.0 }
                        ]);
                        setPerformance(0);
                    }
                }
            } catch (err) {
                console.error('Error fetching yield data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchYieldData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex items-center justify-center">
                <p className="text-slate-400">Loading yield data...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Yield Performance (kg)</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${performance >= 0
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-50'
                    }`}>
                    {performance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {performance >= 0 ? '+' : ''}{performance}% vs Target
                </span>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            fontSize={11}
                            angle={-15}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            fontSize={12}
                            label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 11 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                        <Bar
                            dataKey="target"
                            fill="#e5e7eb"
                            radius={[4, 4, 0, 0]}
                            name="Target Yield"
                            barSize={20}
                        />
                        <Bar
                            dataKey="actual"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            name="Actual Yield"
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                📊 Compares last 5 harvests vs expected yields. Green = meeting targets.
            </p>
        </div>
    );
};

export default YieldChart;
