import React, { useState } from 'react';
import { Database, Download, Play, RefreshCw, BarChart3, AlertCircle, Sparkles, Binary, Layers } from 'lucide-react';
import { generateSyntheticBatch, convertToCSV, downloadCSV, mergeWithRealData } from '../../utils/syntheticDataGenerator';
import { supabase } from '../../lib/supabaseClient';

const AITrainingHub = () => {
  const [crop, setCrop] = useState('Radish');
  const [days, setDays] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useHybridMode, setUseHybridMode] = useState(false);
  const [composition, setComposition] = useState({ real: 0, synthetic: 0 });
  const [previewData, setPreviewData] = useState([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      if (useHybridMode) {
        // Fetch Real Logs from Supabase
        const { data: realLogs, error } = await supabase
          .from('daily_logs')
          .select('*')
          .limit(200)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const hybridData = mergeWithRealData(realLogs || [], crop, days);
        setPreviewData(hybridData);
        
        const realCount = hybridData.filter(d => d.day_of_life === 'REAL_LOG').length;
        setComposition({ real: realCount, synthetic: hybridData.length - realCount });
      } else {
        const data = generateSyntheticBatch(crop, days);
        setPreviewData(data);
        setComposition({ real: 0, synthetic: data.length });
      }
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Failed to fetch real logs: " + err.message);
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const handleDownload = () => {
    if (previewData.length === 0) return;
    const csv = convertToCSV(previewData);
    downloadCSV(csv, `cgrow_training_${crop.toLowerCase()}_${days}d.csv`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
              <Binary size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Training & Synthetic Data</h2>
              <p className="text-indigo-100 font-medium opacity-80">Generation & fine-tuning datasets for local models</p>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
            {isGenerating ? 'GENERATING...' : 'GENERATE SYNTHETIC DATA'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl space-y-6 h-fit">
          <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">
            <Sparkles size={14} /> Dataset Configuration
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Crop</label>
              <select 
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option>Radish</option>
                <option>Broccoli</option>
                <option>Sunflower</option>
                <option>Basil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Simulation Period (Days)</label>
              <input 
                type="range" 
                min="7" 
                max="365" 
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
              />
              <div className="flex justify-between text-[10px] font-black text-slate-400">
                <span>1 WEEK</span>
                <span className="text-indigo-600">{days} DAYS</span>
                <span>1 YEAR</span>
              </div>
            </div>

            {/* 80/20 MODE TOOL */}
            <div className={`p-4 rounded-2xl border transition-all ${useHybridMode ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 font-black text-[10px] text-indigo-800 tracking-tighter uppercase">
                  <Layers size={14} /> 80/20 Hybrid Mode
                </div>
                <button 
                  onClick={() => setUseHybridMode(!useHybridMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${useHybridMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useHybridMode ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-tight mb-2">
                Mixes 20% real farm history with 80% synthetic scenarios for Maximum AI Safety.
              </p>
              {useHybridMode && (
                <div className="flex gap-2">
                  <div className="flex-1 bg-white p-2 rounded-lg border border-indigo-100 text-center">
                    <span className="block text-[8px] font-black text-indigo-400">REAL</span>
                    <span className="text-xs font-black text-indigo-700">20%</span>
                  </div>
                  <div className="flex-1 bg-white p-2 rounded-lg border border-indigo-100 text-center">
                    <span className="block text-[8px] font-black text-indigo-400">SYNTHETIC</span>
                    <span className="text-xs font-black text-indigo-700">80%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-800">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-[11px] leading-relaxed font-medium">
                Generating synthetic data helps train AI to recognize rare diseases and growth stalls that might not be in your current logs yet.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="text-slate-400" size={20} />
              <span className="font-black text-slate-800 tracking-tight">Raw Dataset Preview</span>
              {previewData.length > 0 && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-black ml-2">{previewData.length} ROWS</span>}
            </div>
            {previewData.length > 0 && (
              <button 
                onClick={handleDownload}
                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs"
              >
                <Download size={16} /> DOWNLOAD CSV
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-slate-50/50 p-2">
            {previewData.length > 0 ? (
              <table className="w-full text-left text-[11px] border-separate border-spacing-y-1">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                  <tr className="text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="p-3">Day</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">Biomass</th>
                    <th className="p-3">Coverage</th>
                    <th className="p-3">CO2</th>
                    <th className="p-3">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="mt-2">
                  {previewData.slice(0, 50).map((row, i) => (
                    <tr key={i} className={`border border-slate-50 rounded-xl hover:shadow-md transition-all group ${row.day_of_life === 'REAL_LOG' ? 'bg-indigo-50/50' : 'bg-white'}`}>
                      <td className="p-3">
                        {row.day_of_life === 'REAL_LOG' ? (
                          <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black">REAL</span>
                        ) : (
                          <span className="font-black text-slate-900">{row.day_of_life}</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-slate-600">{row.temp_c}°C</td>
                      <td className="p-3 font-bold text-emerald-600">{row.biomass_weight_g}g</td>
                      <td className="p-3 font-bold text-blue-600">{row.canopy_coverage_pct}%</td>
                      <td className="p-3 font-medium text-slate-500">{row.co2_ppm}ppm</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg font-black text-[9px] uppercase ${
                          row.risk_label === 'LOW_RISK' ? 'bg-emerald-50 text-emerald-600' : 
                          row.day_of_life === 'REAL_LOG' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {row.risk_label.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {previewData.length > 50 && (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-slate-400 italic">
                        ... {previewData.length - 50} more rows hidden in preview ...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <BarChart3 size={64} className="opacity-20 translate-y-4" />
                <p className="font-bold uppercase tracking-widest text-xs">Configure and Generate to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrainingHub;
