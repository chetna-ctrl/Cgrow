import React from 'react';

const StatCard = ({ title, value, subtext, icon, trend }) => {
    // Determine color based on trend (positive = green, negative = red/neutral)
    const isPositive = trend && (trend.includes('+') || trend.includes('Up'));

    return (
        <div className="card-panel border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group bg-white">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono tracking-tight">{value}</h3>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-emerald-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                    {/* Fix: Support both <Icon /> and Icon */}
                    {React.isValidElement(icon) ? icon : (icon && React.createElement(icon, { size: 24 }))}
                </div>
            </div>

            {/* Optional Trend or Subtext */}
            {(subtext || trend) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    {trend && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {trend}
                        </span>
                    )}
                    {subtext && <span className="text-slate-500 text-xs truncate">{subtext}</span>}
                </div>
            )}
        </div>
    );
};

export default StatCard;
