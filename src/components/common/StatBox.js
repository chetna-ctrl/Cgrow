import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import Card from './Card';

const StatBox = ({ label, value, trend, icon: Icon, subtext, trendValue }) => {
    // Trend Logic: "positive" = green, "negative" = red
    // Allow explicit trend or auto-detect

    let trendColor = 'text-slate-400';
    let TrendIcon = Minus;

    if (trend === 'positive' || trend === 'up') {
        trendColor = 'text-emerald-500';
        TrendIcon = ArrowUpRight;
    } else if (trend === 'negative' || trend === 'down' || trend === 'critical') {
        trendColor = 'text-red-500';
        TrendIcon = ArrowDownRight;
    } else if (trend === 'warning') {
        trendColor = 'text-amber-500';
        TrendIcon = Minus;
    }

    return (
        <Card className="flex flex-col gap-1 relative overflow-hidden">
            <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
                {Icon && <Icon size={18} className="text-slate-500 opacity-50" />}
            </div>

            <div className="flex items-end gap-3 mt-1">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>

                {trend && (
                    <span className={`flex items-center text-xs font-bold ${trendColor} bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded`}>
                        <TrendIcon size={12} className="mr-1" />
                        {trendValue || trend}
                    </span>
                )}
            </div>

            {subtext && (
                <p className="text-[10px] text-slate-400 font-medium mt-2">{subtext}</p>
            )}
        </Card>
    );
};

export default StatBox;
