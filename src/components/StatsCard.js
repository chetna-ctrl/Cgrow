import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, unit, icon: Icon, trend, trendValue, color = 'primary', index = 0 }) => {
    // Add staggered delay based on index
    const delayClass = index < 4 ? `delay-${(index + 1) * 100}` : '';

    return (
        <div
            className={`stats-card border-${color} animate-entry ${delayClass}`}
            style={{
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
            }}
        >
            <div className="stats-header">
                <span className="stats-title">{title}</span>
                {Icon && <Icon className={`stats-icon text-${color}`} size={20} />}
            </div>
            <div className="stats-content">
                <div className="stats-value">
                    {value} <span className="stats-unit">{unit}</span>
                </div>
                {trend && (
                    <div className={`stats-trend ${trend}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
