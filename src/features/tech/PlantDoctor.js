import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import visionModel from '../../utils/visionModel';

const PlantDoctor = () => {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
      setResults(null);
      setError(null);
    }
  };

  const analyzePlant = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const output = await visionModel.classifyPlant(image);
      setResults(output);
    } catch (err) {
      setError("Failed to analyze image. Ensure you are using a clear photo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl max-w-4xl mx-auto my-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-fuchsia-50 text-fuchsia-600 rounded-2xl">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Plant Doctor AI</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Powered by Hugging Face (On-Device)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload & Camera Area */}
        <div className="space-y-4">
          <div
            className={`aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden relative ${image ? 'border-fuchsia-200 bg-fuchsia-50/10' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-fuchsia-300'
              }`}
          >
            {image ? (
              <img src={image} alt="Plant to analyze" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col md:flex-row gap-6 p-6 w-full items-center justify-center">
                {/* Camera Button */}
                <label className="flex flex-col items-center cursor-pointer group flex-1">
                  <div className="w-16 h-16 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-fuchsia-600 group-hover:text-white transition-all">
                    <Camera size={32} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Take Photo</span>
                  <span className="text-[10px] text-slate-400 uppercase font-black mt-1">Mobile Camera</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                  />
                </label>

                <div className="hidden md:block w-px h-12 bg-slate-200" />

                {/* Gallery Button */}
                <label className="flex flex-col items-center cursor-pointer group flex-1">
                  <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-slate-600 group-hover:text-white transition-all">
                    <ImageIcon size={32} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Upload Image</span>
                  <span className="text-[10px] text-slate-400 uppercase font-black mt-1">From Gallery</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}
            {image && !loading && (
              <button
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-lg p-2 rounded-full text-slate-400 hover:text-red-500 transition-colors z-10"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <button
            onClick={analyzePlant}
            disabled={!image || loading}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-fuchsia-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>AI ANALYSIS IN PROGRESS...</span>
              </>
            ) : (
              <>
                <Camera size={20} className="group-hover:scale-110 transition-transform" />
                <span>DIAGNOSE CROP HEALTH</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400 font-bold uppercase">
            Analysis is performed locally in your browser for 100% privacy
          </p>
        </div>

        {/* Results Area */}
        <div className="flex flex-col justify-center">
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-600">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {!results && !loading && !error && (
            <div className="text-center p-8 border-2 border-slate-50 rounded-3xl">
              <p className="text-slate-400 text-sm font-medium italic">
                "Upload a photo of your microgreens or hydroponic plants to detect disease, species, or nutrient deficiencies."
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-full w-1/2 animate-pulse" />
            </div>
          )}

          {results && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <CheckCircle size={18} />
                <span className="text-sm font-black uppercase">Diagnosis Complete</span>
              </div>

              <div className="space-y-3">
                {results.map((item, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700 capitalize">
                      {item.label.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-black text-fuchsia-600 bg-fuchsia-50 px-2 py-1 rounded-lg">
                      {(item.score * 100).toFixed(1)}% Confidence
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs text-indigo-700 leading-relaxed italic">
                  <strong>Agronomist Note:</strong> Based on the high confidence detection, ensure your LED spectrum is optimized and check for root rot if browning is visible.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add X icon for local use
const X = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default PlantDoctor;
