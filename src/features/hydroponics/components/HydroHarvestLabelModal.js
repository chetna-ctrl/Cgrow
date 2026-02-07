import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, Leaf, Calendar, ShieldCheck, Droplets } from 'lucide-react';

/**
 * Hydro Harvest Label Modal
 * Generates a professional, printable label for Hydroanically grown produce.
 */
// Inner Component to handle printing logic safely
const PrintButton = ({ contentRef, documentTitle }) => {
    const handlePrint = useReactToPrint({
        content: () => contentRef.current,
        documentTitle: documentTitle,
    });

    return (
        <button
            onClick={handlePrint}
            className="flex-1 bg-black text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg"
        >
            <Printer size={18} /> Print Label
        </button>
    );
};

/**
 * Hydro Harvest Label Modal
 * Generates a professional, printable label for Hydroanically grown produce.
 */
const HydroHarvestLabelModal = ({ isOpen, onClose, system }) => {
    const labelRef = useRef();

    if (!isOpen || !system) return null;

    // Date Handling: Support multiple key variations
    const dateSource = system.plantDate || system.plant_date || system.start_date || Date.now();
    const plantDate = new Date(dateSource).toLocaleDateString('en-GB');
    const today = new Date().toLocaleDateString('en-GB');

    // Generate a Mock QR Code URL (In production, use real QR library)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${system.id}-${system.crop}`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-cyan-50 rounded-t-xl">
                    <h3 className="font-bold text-cyan-900 flex items-center gap-2">
                        <Droplets size={18} /> Hydroponic Label Generator
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-cyan-100 rounded-full text-cyan-700">
                        <X size={20} />
                    </button>
                </div>

                {/* Preview Area (The bit that gets printed) */}
                <div className="p-8 bg-gray-100 flex justify-center">
                    <div
                        ref={labelRef}
                        className="bg-white w-[300px] h-[400px] p-6 border-2 border-gray-800 rounded-lg shadow-sm flex flex-col relative"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        {/* Label Content */}
                        <div className="text-center border-b-2 border-black pb-4 mb-4">
                            <h2 className="text-2xl font-black uppercase tracking-widest text-black">cGrow Hydro</h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Pesticide-Free Produce</p>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-500">Produce Type</p>
                                <p className="text-xl font-bold text-black border-l-4 border-cyan-500 pl-2">{system.crop}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                                        <Calendar size={10} /> Planted
                                    </p>
                                    <p className="text-sm font-bold text-black">{plantDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                                        <Leaf size={10} /> Harvest
                                    </p>
                                    <p className="text-sm font-bold text-black">{today}</p>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-400 pt-4 flex gap-4 items-center">
                                <img src={qrUrl} alt="QR" className="w-16 h-16 border border-gray-200" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500">System ID</p>
                                    <p className="font-mono text-xs font-bold">{system.id}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <ShieldCheck size={12} className="text-cyan-600" />
                                        <span className="text-[9px] font-bold text-cyan-600">Lab Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 text-center border-t-2 border-black">
                            <p className="text-[8px] font-bold uppercase text-gray-400">Soil-Free • Water-Efficient • Pure</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-4 bg-gray-50 rounded-b-xl flex gap-3">
                    <PrintButton
                        contentRef={labelRef}
                        documentTitle={`Label_${system.id}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default HydroHarvestLabelModal;
