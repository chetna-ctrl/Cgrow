import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // RESPONSIVE LISTENER: Handle screen resize updates
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsMobileMenuOpen(false); // Force close on desktop
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        // MAIN CONTAINER: Fixed Height, No Scroll on Body
        <div
            className="flex flex-row h-screen w-full bg-slate-50 overflow-hidden"
            style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100%', overflow: 'hidden' }}
        >

            {/* DESKTOP SIDEBAR: Visible only if NOT mobile */}
            {!isMobile && (
                <aside
                    className="w-64 flex-shrink-0 flex flex-col z-20 border-r border-slate-200 bg-[#0F172A]"
                    style={{ width: '260px', flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
                        <Sidebar onLogout={onLogout} />
                    </div>
                </aside>
            )}

            {/* MOBILE SIDEBAR OVERLAY: Visible only if Mobile AND Open */}
            {isMobile && isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
                    {/* Sidebar Area */}
                    <div
                        className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0F172A]"
                        style={{ width: '260px', height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        <Sidebar onClose={() => setIsMobileMenuOpen(false)} onLogout={onLogout} />
                    </div>
                    {/* Backdrop */}
                    <div
                        className="flex-1 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{ flex: 1, cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
                    ></div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <main
                className="flex-1 flex flex-col min-w-0 overflow-hidden relative"
                style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
            >
                {/* Mobile Toggle Button (Floating) - Only visible on Mobile */}
                {isMobile && (
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="absolute top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md text-slate-700 border border-slate-200 hover:bg-slate-50"
                        style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 40 }}
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8" style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
