import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * Blackout Mode Badge - Critical for Microgreens
 * Days 0-3: Complete darkness to stretch stems
 * Day 4+: Expose to light
 * 
 * Scientific Basis: ICAR Microgreens Protocol (72h darkness)
 */
const BlackoutModeBadge = ({ sowDate, status }) => {
    if (status === 'Harvested') return null;

    const calculateBlackoutStatus = () => {
        if (!sowDate) return null;

        const sow = new Date(sowDate);
        const today = new Date();
        const daysSinceSowing = Math.floor((today - sow) / (1000 * 60 * 60 * 24));

        // Blackout Phase: Days 0-3
        if (daysSinceSowing >= 0 && daysSinceSowing <= 3) {
            const daysRemaining = 3 - daysSinceSowing;
            return {
                inBlackout: true,
                daysRemaining,
                message: `Day ${daysSinceSowing + 1}/4 - KEEP COVERED`,
                color: 'bg-slate-800 text-white border-slate-600',
                icon: AlertTriangle
            };
        }

        // Day 4: CRITICAL - Remove covers now!
        if (daysSinceSowing === 4) {
            return {
                inBlackout: false,
                daysRemaining: 0,
                message: '🚨 REMOVE COVERS NOW!',
                color: 'bg-orange-500 text-white border-orange-600 animate-pulse',
                icon: AlertTriangle
            };
        }

        // Post-blackout (Day 5+)
        if (daysSinceSowing > 4) {
            return {
                inBlackout: false,
                daysRemaining: 0,
                message: 'Under Lights ☀️',
                color: 'bg-green-500 text-white border-green-600',
                icon: Clock
            };
        }

        return null;
    };

    const blackoutStatus = calculateBlackoutStatus();

    if (!blackoutStatus) return null;

    const Icon = blackoutStatus.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border-2 ${blackoutStatus.color}`}>
            <Icon size={14} />
            <span>{blackoutStatus.message}</span>
            {blackoutStatus.inBlackout && (
                <span className="ml-1 text-xs opacity-80">
                    ({blackoutStatus.daysRemaining}d left)
                </span>
            )}
        </div>
    );
};

export default BlackoutModeBadge;
