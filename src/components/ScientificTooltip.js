import React from 'react';
import { Info } from 'lucide-react';

const ScientificTooltip = ({ term, definition }) => {
    return (
        <div className="group relative inline-flex items-center ml-1">
            <Info size={12} className="text-slate-400 cursor-help hover:text-emerald-600 transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-slate-600 z-50">
                <span className="font-bold text-emerald-300 block mb-1">{term}</span>
                {definition}
                {/* Arrow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-slate-600"></div>
            </div>
        </div>
    );
};

export default ScientificTooltip;
