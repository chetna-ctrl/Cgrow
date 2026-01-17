import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../StatsCard.css'; // Reusing card styles for consistency

const ChartWidget = ({ title, data }) => {
    return (
        <div className="stats-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="stats-header">
                <span className="stats-title">{title}</span>
            </div>
            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ color: '#10B981' }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#0f172a' }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartWidget;
