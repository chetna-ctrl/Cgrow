import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        // 1. Parent: Flex container taking full screen height
        // 1. Parent: Flex container taking full screen height - Explicitly ROW
        <div className="flex flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">

            {/* 2. Desktop Sidebar: Fixed width, no shrink */}
            <aside className="hidden md:flex w-64 flex-col flex-shrink-0 z-30 transition-all duration-300">
                <div className="h-full flex flex-col bg-[#0F172A] text-white overflow-y-auto">
                    <Sidebar />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0F172A]">
                        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
                </div>
            )}

            {/* 3. Main Content: Takes ALL remaining space */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">

                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 flex-shrink-0">
                    <span className="font-bold text-emerald-600 text-xl">Agri OS</span>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                </header>

                {/* Scrollable Page Area */}
                <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
                    {/* 
                      CONTENT WRAPPER 
                      - max-w-7xl: Prevents content from stretching too wide on 4k screens
                      - mx-auto: Centers it (User can remove this if they want left-align)
                      - w-full: Ensures it uses available width
                    */}
                    <div className="w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default DashboardLayout;