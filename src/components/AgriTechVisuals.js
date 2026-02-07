import React from 'react';

/**
 * AgriTechVisuals: Minimal, flat SVG illustrations for smart farming dashboard.
 * Designed to be used as subtle background elements or illustrative markers.
 */

export const NFTSchematic = ({ className = "w-full h-full", color = "#94a3b8" }) => (
    <svg viewBox="0 0 200 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 70H180V80H20V70Z" fill={color} fillOpacity="0.2" />
        <path d="M40 70V40H50V70H40Z" fill={color} fillOpacity="0.3" />
        <path d="M45 40C45 35 50 30 55 30H60V35" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <path d="M90 70V30H100V70H90Z" fill={color} fillOpacity="0.3" />
        <path d="M95 30C95 25 100 20 105 20H110V25" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <path d="M140 70V50H150V70H140Z" fill={color} fillOpacity="0.3" />
        <path d="M145 50C145 45 150 40 155 40H160V45" stroke={color} strokeWidth="1" strokeLinecap="round" />
        <circle cx="55" cy="30" r="3" fill={color} fillOpacity="0.4" />
        <circle cx="105" cy="25" r="3" fill={color} fillOpacity="0.4" />
        <circle cx="155" cy="40" r="3" fill={color} fillOpacity="0.4" />
        <path d="M10 85H190" stroke={color} strokeWidth="2" strokeDasharray="4 4" opacity="0.2" />
    </svg>
);

export const TrayVisual = ({ className = "w-12 h-12", color = "#10b981" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="60" width="80" height="20" rx="2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
        <path d="M25 60V45C25 40 30 35 35 35" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M50 60V30C50 25 55 20 60 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M75 60V50C75 45 80 40 85 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="35" cy="35" r="3" fill={color} />
        <circle cx="60" cy="20" r="3" fill={color} />
        <circle cx="85" cy="40" r="3" fill={color} />
    </svg>
);

export const SensorNetworkDiagram = ({ className = "w-full h-full", color = "#64748b" }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="10" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
        <circle cx="100" cy="100" r="40" stroke={color} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
        <circle cx="100" cy="100" r="70" stroke={color} strokeWidth="0.5" strokeDasharray="8 8" opacity="0.2" />

        <g opacity="0.4">
            <circle cx="60" cy="60" r="4" fill={color} />
            <line x1="100" y1="100" x2="60" y2="60" stroke={color} strokeWidth="0.5" />
            <circle cx="150" cy="80" r="4" fill={color} />
            <line x1="100" y1="100" x2="150" y2="80" stroke={color} strokeWidth="0.5" />
            <circle cx="80" cy="150" r="4" fill={color} />
            <line x1="100" y1="100" x2="80" y2="150" stroke={color} strokeWidth="0.5" />
        </g>
    </svg>
);

export const GrowthStages = ({ stage = 1, className = "w-full h-8" }) => {
    const activeColor = "#10b981";
    const inactiveColor = "#e2e8f0";

    return (
        <div className={`flex items-center justify-between px-2 ${className}`}>
            {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                    <div className={`w-3 h-3 rounded-full transition-colors ${s <= stage ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    {s < 3 && <div className={`flex-1 h-0.5 mx-1 transition-colors ${s < stage ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                </React.Fragment>
            ))}
        </div>
    );
};
