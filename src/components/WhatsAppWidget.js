import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, Sprout, LifeBuoy, ShoppingCart } from 'lucide-react';
import SENSOR_ALERT_CONFIG from '../config/sensorAlertConfig';

/**
 * WhatsAppWidget (Pro CRM Version)
 * ─────────────────────────────────────────────────────────────
 * Ek floating button jo menu open karta hai.
 * Choices: Support, Sales, Farm Report.
 * ─────────────────────────────────────────────────────────────
 */
const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Pehla phone number use karein
    const primaryPhone = Array.isArray(SENSOR_ALERT_CONFIG.OWNER_PHONE)
        ? SENSOR_ALERT_CONFIG.OWNER_PHONE[0]
        : SENSOR_ALERT_CONFIG.OWNER_PHONE;

    const digits = String(primaryPhone).replace(/\D/g, '');
    const waNumber = digits.length === 10 ? `91${digits}` : digits;

    const openWhatsApp = (text) => {
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    if (!waNumber) return null;

    const menuItems = [
        {
            id: 'report',
            label: 'Live Farm Report',
            desc: 'Get current crop status',
            icon: Sprout,
            color: 'bg-emerald-100 text-emerald-600',
            msg: '!status'
        },
        {
            id: 'support',
            label: 'Technical Support',
            desc: 'Help with dashboard/sensors',
            icon: LifeBuoy,
            color: 'bg-blue-100 text-blue-600',
            msg: 'Hello cGrow! I need technical support with my dashboard.'
        },
        {
            id: 'sales',
            label: 'Sales & Inventory',
            desc: 'Seed vault & business queries',
            icon: ShoppingCart,
            color: 'bg-orange-100 text-orange-600',
            msg: 'Hello! I want to inquire about seed inventory.'
        },
    ];

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Professional Chat Popup */}
            {isOpen && (
                <div className="mb-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-emerald-600 p-6 text-white text-center relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-emerald-100 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="font-black text-lg">cGrow CRM</h3>
                        <p className="text-emerald-100 text-[10px] uppercase font-bold tracking-widest">Connect with our support team</p>
                    </div>

                    <div className="p-3 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => openWhatsApp(item.msg)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100"
                            >
                                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-black text-slate-700">{item.label}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300" />
                            </button>
                        ))}
                    </div>

                    <div className="p-4 bg-slate-50 text-center">
                        <p className="text-[10px] text-slate-400 font-bold">Typically replies in under 5 mins</p>
                    </div>
                </div>
            )}

            {/* Main Toggle Button */}
            <div className="relative">
                {!isOpen && (
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative w-16 h-16 ${isOpen ? 'bg-slate-800' : 'bg-emerald-500'} text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white`}
                >
                    {isOpen ? <X size={28} /> : <MessageCircle size={32} />}

                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white items-center justify-center text-[8px] font-black">1</span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default WhatsAppWidget;
