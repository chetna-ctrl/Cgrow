import React from 'react';
import AgronomyPanel from '../components/AgronomyPanel';
import { Sprout } from 'lucide-react';

const AgronomyPage = () => {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Sprout className="text-emerald-500" /> Agronomy Intelligence
                </h1>
                <p className="text-slate-400">Biological insights, VPD tracking, and Nutrient lockout monitoring.</p>
            </div>

            <AgronomyPanel />
        </div>
    );
};

export default AgronomyPage;
