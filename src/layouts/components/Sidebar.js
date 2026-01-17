import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Sprout,
    Droplets,
    DollarSign,
    Activity,
    Settings,
    LogOut,
    User,
    BarChart2,
    Clock,
    Bell, // Operations icon
    X,
    BookOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isDemoMode } from '../../utils/sampleData';

const Sidebar = ({ onClose, onLogout }) => {
    const [userEmail, setUserEmail] = useState('Loading...');

    // Fetch logged-in user's email
    useEffect(() => {
        const fetchUser = async () => {
            if (isDemoMode()) {
                setUserEmail('Demo User');
                return;
            }
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
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 text-emerald-500">
                    <Sprout size={28} />
                    <span className="text-xl font-bold text-white tracking-tight">Agri OS</span>
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
            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* DASHBOARD SECTION */}
                <NavLink to="/dashboard" className={linkClasses}>
                    <LayoutDashboard size={18} /> <span className="text-sm font-medium">Dashboard</span>
                </NavLink>
                <NavLink to="/tracker" className={linkClasses}>
                    <Clock size={18} /> <span className="text-sm font-medium">Daily Tracker</span>
                </NavLink>

                {/* Divider */}
                <div className="border-t border-slate-700 my-3"></div>

                {/* PRODUCTION SECTION */}
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Farm Operations</p>
                <NavLink to="/microgreens" className={linkClasses}>
                    <Sprout size={18} /> <span className="text-sm font-medium">Microgreens</span>
                </NavLink>
                <NavLink to="/hydroponics" className={linkClasses}>
                    <Droplets size={18} /> <span className="text-sm font-medium">Hydroponics</span>
                </NavLink>
                <NavLink to="/scheduler" className={linkClasses}>
                    <Bell size={18} /> <span className="text-sm font-medium">Operations</span>
                </NavLink>

                {/* Divider */}
                <div className="border-t border-slate-700 my-3"></div>

                {/* INTELLIGENCE SECTION */}
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Intelligence</p>
                <NavLink to="/analytics" className={linkClasses}>
                    <BarChart2 size={18} /> <span className="text-sm font-medium">Analytics</span>
                </NavLink>
                <NavLink to="/finance" className={linkClasses}>
                    <DollarSign size={18} /> <span className="text-sm font-medium">Finance</span>
                </NavLink>

                {/* Divider */}
                <div className="border-t border-slate-700 my-3"></div>

                {/* RESOURCES SECTION */}
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Resources</p>
                <NavLink to="/guide" className={linkClasses}>
                    <BookOpen size={18} /> <span className="text-sm font-medium">Farming Guide</span>
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
