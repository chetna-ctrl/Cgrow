import React, { useMemo } from 'react';
import {
    Activity, BatteryCharging, Thermometer,
    Droplets, AlertTriangle, Wind, Timer,
    ShieldAlert, RefreshCw
} from 'lucide-react';
import { calculatePowerFailureBuffer, detectStratification } from '../../modules/hydroIntelligence/dftAlgorithms';
import { calculateOxygenSolubility, calculateAlgaeRisk, detectDeadZones, checkWaterChangeNeeded } from '../../modules/hydroIntelligence/waterQuality';

// STYLES
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${className}`}>
        {children}
    </div>
);

const MetricRow = ({ label, value, subtext, icon: Icon, color = "text-slate-600" }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
            </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

/**
 * DFT "Pro-Level" Intelligence Dashboard
 * Visualizes deep biophysics metrics for advanced growers.
 */
const DFTIntelligencePanel = ({
    waterTemp = 24,
    ambientTemp = 30,
    volumeLiters = 100,
    plantCount = 20,
    ph = 6.0,
    ec = 1.2,
    doPPM = 6.5, // Dissolved Oxygen
    isChillerOn = false
}) => {

    // 1. CALCULATE INTELLIGENCE
    const buffer = useMemo(() =>
        calculatePowerFailureBuffer(volumeLiters, waterTemp, plantCount),
        [volumeLiters, waterTemp, plantCount]);

    const maxDO = useMemo(() =>
        calculateOxygenSolubility(waterTemp),
        [waterTemp]);

    const algaeRisk = useMemo(() =>
        calculateAlgaeRisk(50, 60, waterTemp), // Assuming 50 lux leak, 60% humidity for now
        [waterTemp]);

    const waterChange = useMemo(() =>
        checkWaterChangeNeeded(ec * 500, 300), // Convert EC to TDS approx
        [ec]);

    // Chiller Efficiency
    const chillerDelta = ambientTemp - waterTemp;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <BrainIcon className="text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Hydro Intelligence™ (DFT Core)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. SURVIVAL BUFFER */}
                <Card className={buffer.status === 'CRITICAL' ? 'border-red-200 bg-red-50' : ''}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Timer className={buffer.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'} />
                            <span className="font-semibold text-slate-700">Power Fail Buffer</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${buffer.status === 'SAFE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {buffer.status}
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">
                        {buffer.minutesBuffer} <span className="text-lg font-normal text-slate-500">min</span>
                    </div>
                    <p className="text-xs text-slate-500">
                        Estimated root survival time without aeration at {waterTemp}°C.
                    </p>
                </Card>

                {/* 2. OXYGEN SOLUBILITY INDEX */}
                <Card>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Wind className="text-sky-500" />
                            <span className="font-semibold text-slate-700">O₂ Solubility Limit</span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-3xl font-bold text-slate-800">{maxDO}</span>
                        <span className="text-sm text-slate-500 mb-1">mg/L (Max)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                        <div
                            className="bg-sky-500 h-2 rounded-full"
                            style={{ width: `${(doPPM / maxDO) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        Current Saturation: {((doPPM / maxDO) * 100).toFixed(0)}% of Physics Max
                    </p>
                </Card>

                {/* 3. ALGAE & BIO RISK */}
                <Card>
                    <MetricRow
                        label="Algae Risk Score"
                        value={`${algaeRisk.riskScore}/100`}
                        subtext={algaeRisk.advice}
                        icon={ShieldAlert}
                        color={algaeRisk.level === 'HIGH' ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}
                    />
                    <MetricRow
                        label="Water Refresh"
                        value={waterChange.action === 'TOP_UP' ? 'OK' : 'CHANGE NOW'}
                        subtext={waterChange.reason}
                        icon={RefreshCw}
                        color={waterChange.action === 'TOP_UP' ? 'text-blue-600' : 'text-amber-600'}
                    />
                </Card>

                {/* 4. THERMAL STRATIFICATION / CHILLER */}
                <Card>
                    <div className="flex justify-between mb-4">
                        <span className="font-semibold text-slate-700 flex gap-2">
                            <Thermometer className="text-orange-500" /> Thermal Delta
                        </span>
                        {isChillerOn && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">❄️ Chiller ON</span>}
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Ambient Air</span>
                            <span className="font-mono">{ambientTemp}°C</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Water Temp</span>
                            <span className="font-mono font-bold">{waterTemp}°C</span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-400">Cooling Efficiency</span>
                            <span className="font-bold text-emerald-600">-{chillerDelta.toFixed(1)}°C</span>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

// Simple Icon wrapper to avoid missing icon errors
const BrainIcon = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        {...props}
    >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
);

export default DFTIntelligencePanel;
