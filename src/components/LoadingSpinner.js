import React from 'react';
import { Sprout } from 'lucide-react';

/**
 * LoadingSpinner Component
 * Optimized loading fallback for lazy-loaded routes
 * Shows during code splitting delays
 */
const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50">
            <div className="relative">
                {/* Animated spinner */}
                <div className="animate-spin text-emerald-500 mb-4">
                    <Sprout size={48} />
                </div>

                {/* Pulsing ring */}
                <div className="absolute inset-0 animate-ping opacity-20">
                    <Sprout size={48} className="text-emerald-300" />
                </div>
            </div>

            <p className="text-slate-600 text-sm font-medium animate-pulse mt-4">
                {message}
            </p>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-slate-200 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-progress" />
            </div>
        </div>
    );
};

export default LoadingSpinner;
