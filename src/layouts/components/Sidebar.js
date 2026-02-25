import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity, // Operations Hub
    Briefcase, // Business Hub
    Cpu, // Tech Hub
    Settings,
    LogOut,
    User,
    ChevronRight,
    Search,
    X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
// import { isDemoMode } from '../../utils/sampleData';

const Sidebar = ({ onClose, onLogout }) => {
    const [userEmail, setUserEmail] = useState('Loading...');

    // Fetch logged-in user's email
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || 'Farm Admin');
            } else {
                setUserEmail('Guest');
            }
        };
        fetchUser();
    }, []);

    // ACTIVE LINK STYLING
    const linkClasses = ({ isActive }) => `
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1
        ${isActive
            ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-500 font-semibold'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'}
    `;

    return (
        <div className="flex flex-col h-full w-full"> {/* Filled container */}

            {/* 1. HEADER */}
            <div className="h-20 flex items-center px-6 border-b border-slate-800 shrink-0 bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-900/20 border border-emerald-500/20 bg-white p-1">
                        <img src="/logo_cgro.png" alt="cGrow Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white tracking-tighter leading-none">cGrow</span>
                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Research Ops</span>
                    </div>
                </div>
                {/* Close Button (Mobile Only: Controlled by Parent, but good to have safety) */}
                <button
                    onClick={onClose}
                    className="md:hidden text-slate-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* 2. NAVIGATION - GROUPED STRUCTURE */}
            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2 text-white">
                {/* 1. CONTROL CENTER */}
                <NavLink to="/dashboard" className={linkClasses}>
                    <LayoutDashboard size={18} /> <span className="text-sm font-medium text-white">Dashboard</span>
                </NavLink>

                {/* 2. OPERATIONS HUB */}
                <NavLink to="/ops" className={linkClasses}>
                    <Activity size={18} className="text-emerald-400" /> <span className="text-sm font-medium text-white">Farm Ops</span>
                </NavLink>

                {/* 3. BUSINESS HUB */}
                <NavLink to="/business" className={linkClasses}>
                    <Briefcase size={18} className="text-indigo-400" /> <span className="text-sm font-medium text-white">Business Hub</span>
                </NavLink>

                {/* 4. TECH HUB */}
                <NavLink to="/tech" className={linkClasses}>
                    <Cpu size={18} className="text-blue-400" /> <span className="text-sm font-medium text-white">Tech Academy</span>
                </NavLink>
            </nav>

            {/* 3. FOOTER */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 mt-auto">
                <NavLink to="/settings" className={linkClasses}>
                    <Settings size={16} />
                    <span className="text-sm">Settings</span>
                </NavLink>

                <div className="flex items-center gap-3 px-2 mb-3 bg-slate-800 p-2 rounded-lg border border-slate-700 mt-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <User size={14} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">Farm Admin</p>
                        <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-xs font-bold uppercase tracking-wider py-2 rounded transition-all"
                >
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
