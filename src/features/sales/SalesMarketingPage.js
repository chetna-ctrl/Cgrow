import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateVPD, predictChurn, predictConsumption, calculateOptimalPrice } from '../../utils/mlIntelligence';
import html2canvas from 'html2canvas';
import { supabase } from '../../lib/supabaseClient';
import { sendCloudMessage, openWhatsAppFallback } from '../../services/twilioService';
import { processDueChains, runPredictiveAutoRefill } from '../../services/automationService';
import {
    Users,
    ShoppingBag,
    MessageCircle,
    TrendingUp,
    Plus,
    Zap,
    Share2,
    DollarSign,
    Search,
    Filter,
    ArrowUpRight,
    Megaphone,
    Calendar,
    Download,
    X,
    Save,
    MapPin,
    Phone,
    Mail,
    Tag,
    Sparkles,
    CloudLightning,
    CheckCircle2,
    Contact,
    FilePlus
} from 'lucide-react';

const SalesMarketingPage = () => {
    // Robust WhatsApp Helper (Desktop vs Mobile)
    const openWhatsApp = (phone, message) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const formatted = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const baseUrl = isMobile ? "https://wa.me/" : "https://web.whatsapp.com/send";
        window.open(`${baseUrl}${formatted}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const [activeTab, setActiveTab] = useState('crm');
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [showAddOrder, setShowAddOrder] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showPosterModal, setShowPosterModal] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [botStatus, setBotStatus] = useState('Checking...');
    const [campaignState, setCampaignState] = useState({
        type: 'FLASH_SALE',
        targetType: 'Individual',
        selectedCustomerId: '',
        isGenerating: false,
        generatedMsg: '',
        showPreview: false
    });

    // New: Check WhatsApp Bot Status (Port 3001)
    useEffect(() => {
        const checkBot = async () => {
            try {
                const res = await fetch('http://localhost:3001/status');
                if (!res.ok) throw new Error('Offline');
                const data = await res.json();
                setBotStatus(data.ready ? 'Online' : 'Pending');
            } catch (err) {
                setBotStatus('Offline');
            }
        };
        checkBot();
        const interval = setInterval(checkBot, 30000);
        return () => clearInterval(interval);
    }, []);

    // New: AI Campaign Generator Call
    const handleGenerateCampaign = async () => {
        const customer = customers.find(c => c.id === campaignState.selectedCustomerId) || { name: 'Valued Customer' };
        setCampaignState(prev => ({ ...prev, isGenerating: true }));
        try {
            const res = await fetch('http://localhost:3001/generate-marketing-msg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignType: campaignState.type,
                    customerName: customer.name,
                    topCrop: 'Radish Microgreens' // This could be dynamic based on inventory
                })
            });
            const data = await res.json();
            setCampaignState(prev => ({ 
                ...prev, 
                generatedMsg: data.message, 
                isGenerating: false,
                showPreview: true 
            }));
        } catch (err) {
            console.error("AI Generation Error:", err);
            setCampaignState(prev => ({ ...prev, isGenerating: false }));
            alert("Bot is offline. Please start the WhatsApp Bot first.");
        }
    };

    const handleSendCampaign = async (finalMsg) => {
        const customer = customers.find(c => c.id === campaignState.selectedCustomerId);
        if (!customer) return;
        
        setCampaignState(prev => ({ ...prev, isGenerating: true }));
        try {
            const res = await fetch('http://localhost:3001/send-msg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: customer.whatsapp_number || customer.phone,
                    message: finalMsg
                })
            });
            if (res.ok) {
                alert("✅ Campaign Message Sent!");
                setCampaignState(prev => ({ ...prev, showPreview: false }));
            } else {
                alert("❌ Failed to send. Check Bot status.");
            }
        } catch (err) {
            alert("❌ Bot error. Is it running?");
        }
        setCampaignState(prev => ({ ...prev, isGenerating: false }));
    };

    const queryClient = useQueryClient();

    // 0. Weather Data for Smart Pricing
    const [weatherData, setWeatherData] = useState({ temp: 30, humidity: 60 });

    useEffect(() => {
        const cached = localStorage.getItem('cGrow_weather_cache');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setWeatherData(parsed);
            } catch (e) {
                console.warn("Weather cache parse failed", e);
            }
        }
    }, []);



    // 1. Fetch Customers
    const { data: customers = [], isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Customers Fetch Error:", error);
                return [];
            }
            return data;
        }
    });

    // 2. Fetch Orders
    const { data: orders = [], isLoading: loadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*, customers(name)')
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Orders Fetch Error:", error);
                return [];
            }
            return data;
        }
    });

    // 3. Fetch Automation Chains
    const { data: activeChains = [], isLoading: loadingChains } = useQuery({
        queryKey: ['automation_chains'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('automation_chains')
                .select('*, customers(name, whatsapp_number)')
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Chains Fetch Error:", error);
                return [];
            }
            return data;
        }
    });

    // 4. Fetch Automation Logs (For Cloud Tracking)
    const { data: automationLogs = [] } = useQuery({
        queryKey: ['automation_logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('automation_logs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) return [];
            return data;
        }
    });

    // 0.5 Full Automation Autopilot (Phase 10) - Moved here to prevent ReferenceError
    const [autopilotStatus, setAutopilotStatus] = useState('Idle');
    useEffect(() => {
        if (!loadingCustomers && !loadingOrders && !loadingChains && customers.length > 0) {
            const runAutopilot = async () => {
                setAutopilotStatus('Checking...');
                try {
                    // A. Process Due Chains
                    const chainRes = await processDueChains(activeChains, customers, orders);

                    // B. Run Predictive Auto-Refills (Spam controlled)
                    const refillRes = await runPredictiveAutoRefill(customers, orders);

                    if (chainRes.processed > 0 || refillRes.refills > 0) {
                        setAutopilotStatus('Actions Sent');
                        queryClient.invalidateQueries({ queryKey: ['automation_logs'] });
                        queryClient.invalidateQueries({ queryKey: ['automation_chains'] });
                    } else {
                        setAutopilotStatus('Optimized');
                    }
                } catch (err) {
                    console.error("Autopilot Error:", err);
                    setAutopilotStatus('Error');
                }
            };

            runAutopilot();
            const interval = setInterval(runAutopilot, 300000); // Check every 5 mins
            return () => clearInterval(interval);
        }
    }, [loadingCustomers, loadingOrders, loadingChains]);

    // 5. Mutations
    const addCustomerMutation = useMutation({
        mutationFn: async (newCustomer) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('customers')
                .insert([{ ...newCustomer, user_id: user?.id }]);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setShowAddCustomer(false);
        },
        onError: (error) => {
            console.error("Add Customer Error:", error);
            alert(`Error: ${error.message || 'Failed to add customer. Check RLS or DB schema.'} `);
        }
    });

    const bulkAddCustomerMutation = useMutation({
        mutationFn: async (customersArray) => {
            const { data: { user } } = await supabase.auth.getUser();
            const payload = customersArray.map(c => ({
                ...c,
                user_id: user?.id,
                marketing_consent: c.marketing_consent || false
            }));
            const { data, error } = await supabase
                .from('customers')
                .insert(payload);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            alert("✅ Bulk Import Successful!");
            setShowAddCustomer(false);
        },
        onError: (error) => {
            console.error("Bulk Import Error:", error);
            alert(`Bulk Import Error: ${error.message}`);
        }
    });

    const addOrderMutation = useMutation({
        mutationFn: async (newOrder) => {
            const { data: { user } } = await supabase.auth.getUser();
            const payload = {
                ...newOrder,
                quantity: Number(newOrder.quantity),
                total_price: Number(newOrder.total_price),
                user_id: user?.id
            };
            const { data, error } = await supabase
                .from('orders')
                .insert([payload]);
            if (error) throw error;
            return data;
        },
        onMutate: async (newOrder) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['orders'] });

            // Snapshot the previous value
            const previousOrders = queryClient.getQueryData(['orders']);

            // Optimistically update to the new value
            queryClient.setQueryData(['orders'], (old = []) => [
                {
                    ...newOrder,
                    id: `temp-${Date.now()}`,
                    created_at: new Date().toISOString(),
                    status: 'Pending',
                    customers: { name: customers.find(c => c.id === newOrder.customer_id)?.name || 'Processing...' }
                },
                ...old
            ]);

            // Return a context object with the snapshotted value
            return { previousOrders };
        },
        onError: (err, newOrder, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            queryClient.setQueryData(['orders'], context.previousOrders);
            console.error("Add Order Error:", err);
            alert(`Error: ${err.message || 'Failed to add order.'}`);
        },
        onSettled: () => {
            // Always refetch after error or success to synchronize with server
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setShowAddOrder(false);
        }
    });

    const enrollInChainMutation = useMutation({
        mutationFn: async ({ customer, chainType, telemetry = { temp: 24, humidity: 65 } }) => {
            setLoadingCustomerId(customer.id);
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Modern VPD Calculation for automation logging
            const vpd = calculateVPD(telemetry.temp, telemetry.humidity);

            // 2. Prepare message content
            const message = `🌱 * Step 1: Harvest Alert (cGrow Automation) * 🌱\n\n` +
                `Hi ${customer.name}! Our fresh harvest is ready.\n` +
                `Current Batch VPD: ${vpd} kPa (Optimum Growing)\n\n` +
                `This is the *First Message* of your automated alert sequence.\n` +
                `Track your chain status in the Hub!`;

            // 3. Register Chain in Database
            const { data, error } = await supabase
                .from('automation_chains')
                .upsert([{
                    customer_id: customer.id,
                    user_id: user?.id,
                    chain_type: chainType,
                    status: 'Active',
                    current_step: 1,
                    last_sent_at: new Date().toISOString(),
                    next_scheduled_at: new Date(Date.now() + 86400000).toISOString(),
                    metadata: { vpd } // Extra payload for Step 2/3 intelligence
                }], { onConflict: 'customer_id,chain_type' });

            if (error) throw error;

            // 4. Trigger Step 1 via Cloud Sequence (Automatic)
            const res = await sendCloudMessage(customer, {
                date: new Date().toLocaleDateString('en-IN'),
                time: 'Immediate (Auto-Enroll)'
            });

            if (!res.success) {
                console.warn("Cloud send failed, falling back to manual...");
                const phoneStr = customer.whatsapp_number || customer.phone;
                if (phoneStr) {
                    openWhatsApp(phoneStr, message);
                }
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation_chains'] });
            queryClient.invalidateQueries({ queryKey: ['automation_logs'] });
        },
        onSettled: () => {
            setLoadingCustomerId(null);
        },
        onError: (error) => {
            console.error("Chain Enrollment Error:", error);
            alert(`Enrollment Failed: ${error.message || 'Check if automation_chains table exists and has unique constraint (customer_id, chain_type)'}`);
        }
    });

    const handleWhatsAppAlert = () => {
        const message = `🌱 *Harvest Alert from cGrow* 🌱\n\n` +
            `Hello! Fresh harvest is ready for today's microgreens.\n` +
            `Check our latest stock and place your order!\n\n` +
            `✨ *Limited Stock Available* ✨`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const generateCaption = () => {
        const captions = [
            "🌱 Fresh Harvest Alert! 🚀 Today's microgreens are nutrient-packed and ready for your kitchen. Order now to get the first pick! #cGrow #FreshHarvest #Microgreens",
            "✨ Upgrade your meals with cGrow! 🥗 Our greens are harvested today and delivered fresh. Limited stock available. #CleanEating #AgriTech",
            "💚 Nature's multivitamin is here! 🌱 Fresh trays of Radish and Broccoli microgreens ready for delivery. WhatsApp us to order. #HealthyLiving #cGrow"
        ];
        const random = captions[Math.floor(Math.random() * captions.length)];
        setGeneratedCaption(random);
        setShowCaptionModal(true);
    };

    const manualStepTrigger = async (chain, step) => {
        const name = chain.customers?.name || 'Customer';
        const phone = chain.customers?.whatsapp_number;

        if (!phone) {
            alert("No WhatsApp number found for this customer.");
            return;
        }

        // Logic check: If step 1, offer Cloud Send as primary
        if (step === 1) {
            const confirmCloud = window.confirm(`Trigger Step 1 (Cloud Alert) for ${name} via WhatsApp Bot?`);
            if (confirmCloud) {
                const res = await sendCloudMessage(chain.customers, {
                    date: new Date().toLocaleDateString('en-IN'),
                    time: 'Morning (Scheduled)'
                });
                if (res.success) {
                    alert(`✅ Cloud Sequence Started for ${name}!`);
                    queryClient.invalidateQueries({ queryKey: ['automation_chains'] });
                    queryClient.invalidateQueries({ queryKey: ['automation_logs'] });
                    return;
                }
            }
        }

        const messages = {
            'HARVEST_ALERT': [
                `🌱 *Step 1: Harvest Alert (cGrow)* 🌱\n\nHi ${name}! Our fresh harvest is ready. This is the first alert of your automated sequence.`,
                `Hi ${name}, just checking in! *Step 2:* Limited microgreens still available. Did you see the list?`,
                `Special Offer for ${name}! *Step 3:* Use code FRESH20 for 20% off your harvest order today!`
            ]
        };

        const content = messages[chain.chain_type]?.[step - 1] || 'Hello from cGrow!';
        openWhatsApp(phone, content);
    };

    const stats = useMemo(() => {
        // AI Stock Prediction Logic (Simulated based on order velocity)
        const totalSales = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);
        const daysSinceFirst = orders.length > 0 ? (new Date() - new Date(orders[orders.length - 1].created_at)) / (1000 * 60 * 60 * 24) : 1;
        const velocity = totalSales / Math.max(daysSinceFirst, 1);
        const currentStock = 50; // Mock stock for demo
        const daysToEmpty = Math.round(currentStock / (velocity || 1));

        // 3. AI Smart Pricing Logic (New for Phase 6)
        const baseAOV = orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_price || 0), 0) / orders.length : 0;
        const smartPrice = calculateOptimalPrice(140, weatherData, currentStock);

        return [
            {
                label: 'Total Revenue',
                value: `₹${orders.reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString()}`,
                icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50'
            },
            { label: 'Total Customers', value: customers.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            {
                label: 'AI Stock Predictor',
                value: `Stock Out: ~${daysToEmpty} Days`,
                icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50'
            },
            {
                label: 'AI Sug. Pricing',
                value: `₹${smartPrice.suggested} (${smartPrice.difference > 0 ? '+' : ''}₹${smartPrice.difference})`,
                icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50',
                subValue: smartPrice.reason
            },
        ];
    }, [orders, customers, weatherData]);

    return (
        <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Megaphone size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Commercial Hub</h1>
                        <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest font-black">
                            Sales CRM & Digital Marketing Engine
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl mr-2">
                        <div className={`w-2 h-2 rounded-full ${botStatus === 'Online' ? 'bg-emerald-500' : botStatus === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Bot: {botStatus}</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl mr-4">
                        <div className={`w-2 h-2 rounded-full ${autopilotStatus === 'Optimized' ? 'bg-emerald-500' : autopilotStatus === 'Checking...' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Autopilot: {autopilotStatus}</span>
                    </div>
                    <button
                        onClick={() => setShowAddOrder(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-indigo-900/20"
                    >
                        <Plus size={18} /> NEW ORDER
                    </button>
                    <button
                        onClick={handleWhatsAppAlert}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-slate-900/20"
                    >
                        <MessageCircle size={18} /> WHATSAPP ALERTS
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-2 rounded-2xl border border-slate-100 w-fit">
                <button
                    onClick={() => setActiveTab('crm')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'crm' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    CUSTOMER CRM
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    ORDER TRACKING
                </button>
                <button
                    onClick={() => setActiveTab('marketing')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'marketing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    DIGITAL MARKETING
                </button>
                <button
                    onClick={() => setActiveTab('automation')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'automation' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    AUTOMATION {activeChains.length > 0 && `(${activeChains.length})`}
                </button>
                <button
                    onClick={() => setActiveTab('lab')}
                    className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'lab' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    SALES LAB 🧠
                </button>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tables/Lists */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    {activeTab === 'crm' && (
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-800">Recent Customers</h3>
                                <div className="flex gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="Search customers..." className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold" />
                                    </div>
                                    <button
                                        onClick={() => setShowAddCustomer(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs hover:bg-emerald-100 transition-all border border-emerald-100"
                                    >
                                        <Plus size={14} /> ADD CUSTOMER
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">LTV</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stability</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Refill</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                                            <th className="pb-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {customers.length > 0 ? customers.map(customer => (
                                            <tr key={customer.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-[10px]">
                                                            {customer.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-slate-800">{customer.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                                                {(() => {
                                                                    const lastLog = automationLogs.find(l => l.customer_id === customer.id);
                                                                    return lastLog ? `Last Cloud: ${new Date(lastLog.created_at).toLocaleDateString()}` : 'No Cloud Activity';
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-bold text-slate-600">
                                                    {customer.whatsapp_number || customer.phone || 'No Number'}
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{customer.type}</span>
                                                </td>
                                                <td className="py-4 font-black text-slate-700">₹{customer.total_lifetime_value || 0}</td>
                                                <td className="py-4">
                                                    {(() => {
                                                        const churn = predictChurn(customer, orders);
                                                        return (
                                                            <div className="flex items-center gap-1.5">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${churn.color.replace('text', 'bg')}`} />
                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${churn.color}`}>
                                                                    {churn.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="py-4">
                                                    {(() => {
                                                        const consumption = predictConsumption(customer, orders);
                                                        return (
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`text-[10px] font-black uppercase tracking-wider ${consumption.isRefillUrgent ? 'text-orange-600' : 'text-slate-400'}`}>
                                                                    {consumption.suggestion}
                                                                </span>
                                                                {consumption.isRefillUrgent && (
                                                                    <div className="flex flex-col gap-2">
                                                                        <button
                                                                            onClick={() => openWhatsApp(customer.whatsapp_number || customer.phone, `Hi ${customer.name}! Planning your next batch of greens? Our fresh harvest is ready tomorrow! 🌱`)}
                                                                            className="text-[9px] font-black text-slate-500 hover:text-indigo-600 hover:underline text-left uppercase flex items-center gap-1"
                                                                        >
                                                                            <MessageCircle size={10} /> Manual WA ➔
                                                                        </button>
                                                                        <button
                                                                            onClick={async () => {
                                                                                const res = await sendCloudMessage(customer, {
                                                                                    date: new Date().toLocaleDateString('en-IN'),
                                                                                    time: 'Morning'
                                                                                });
                                                                                if (res.success) {
                                                                                    alert(`Cloud Message Sent to ${customer.name}!`);
                                                                                    queryClient.invalidateQueries({ queryKey: ['automation_logs'] });
                                                                                } else if (res.fallback) {
                                                                                    openWhatsAppFallback(customer.whatsapp_number || customer.phone, "Cloud fail: Hi! Fresh harvest ready!");
                                                                                }
                                                                            }}
                                                                            className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 hover:underline text-left uppercase flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md"
                                                                        >
                                                                            <CloudLightning size={10} /> Cloud Send (WA Bot)
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="py-4">
                                                    {(() => {
                                                        const consumption = predictConsumption(customer, orders);
                                                        const tierColors = {
                                                            'Elite': 'bg-purple-100 text-purple-600',
                                                            'Regular': 'bg-blue-100 text-blue-600',
                                                            'Emerging': 'bg-slate-100 text-slate-500'
                                                        };
                                                        return (
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${tierColors[consumption.loyaltyTier] || tierColors.Emerging}`}>
                                                                {consumption.loyaltyTier}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            disabled={loadingCustomerId === customer.id}
                                                            onClick={() => enrollInChainMutation.mutate({ customer, chainType: 'HARVEST_ALERT' })}
                                                            className={`flex items-center gap-1 px-3 py-1 ${loadingCustomerId === customer.id ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} rounded-lg text-[10px] font-black transition-all`}
                                                            title="Enroll in Harvest Alert Chain"
                                                        >
                                                            <Zap size={12} className={loadingCustomerId === customer.id ? 'animate-pulse' : ''} />
                                                            {loadingCustomerId === customer.id ? 'STARTING...' : 'START CHAIN'}
                                                        </button>
                                                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                            <Share2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">
                                                    No customers found. Database might not be initialized.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'automation' && (
                        <div className="p-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-800">Live Automation Tracks</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowEnrollModal(true)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 active:scale-95 transition-all"
                                    >
                                        <Plus size={14} /> ADD SEQUENCE
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {activeChains.length > 0 ? activeChains.map(chain => (
                                    <div key={chain.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 ${chain.chain_type === 'HARVEST_ALERT' ? 'bg-indigo-600' : 'bg-orange-600'} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200`}>
                                                    {chain.chain_type === 'HARVEST_ALERT' ? <Megaphone size={24} /> : <ShoppingBag size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-800">{chain.customers?.name}'s {chain.chain_type.replace('_', ' ')}</h4>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                                        Step {chain.current_step} • {chain.status} • Next: {chain.next_scheduled_at ? new Date(chain.next_scheduled_at).toLocaleDateString() : 'Done'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {chain.status === 'Active' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                                                <span className={`px-3 py-1 ${chain.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} rounded-lg text-[10px] font-black uppercase`}>
                                                    {chain.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1, 2, 3].map(step => (
                                                <button
                                                    key={step}
                                                    onClick={() => manualStepTrigger(chain, step)}
                                                    className={`p-4 bg-white rounded-2xl border text-center shadow-sm transition-all active:scale-95 ${chain.current_step >= step ? 'border-indigo-200 ring-2 ring-indigo-500/5 hover:ring-indigo-500/20' : 'opacity-40 border-slate-100'}`}
                                                >
                                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Step {step}</p>
                                                    <p className={`text-xs font-black ${chain.current_step === step ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                        {step === 1 ? 'Alert' : step === 2 ? 'Follow-up' : 'Offer'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400">{step === 1 ? 'Sent' : step === 2 ? '+24h' : '+48h'}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                                        <Zap size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold">No active automation chains.</p>
                                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2">Go to CRM tab and click "START CHAIN" or click "+ ADD SEQUENCE" above.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="p-8">
                            <h3 className="text-xl font-black text-slate-800 mb-8">Active Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-50">
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {orders.length > 0 ? orders.map(order => (
                                            <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                                                <td className="py-4">
                                                    <p className="font-black text-slate-800">{order.product_name}</p>
                                                    <p className="text-xs text-slate-400 font-bold">{order.quantity} {order.unit}</p>
                                                </td>
                                                <td className="py-4 font-bold text-slate-600 text-sm">
                                                    {order.customers?.name || 'Walk-in'}
                                                </td>
                                                <td className="py-4 font-black text-slate-700">₹{order.total_price}</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                        order.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-600'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="py-12 text-center text-slate-400 font-bold">No orders found. Click "New Order" to start selling.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'marketing' && (
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-800">Digital Asset Engine</h3>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${botStatus === 'Online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {botStatus === 'Online' ? 'Bot Connected' : 'Bot Offline'}
                                </div>
                            </div>

                            {/* Campaign Creator Card */}
                            <div className="mb-12 p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 shadow-inner">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800">AI Campaign Creator</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Generate Personalized High-Conversion Campaigns</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Campaign Type</label>
                                        <select 
                                            value={campaignState.type}
                                            onChange={e => setCampaignState(prev => ({ ...prev, type: e.target.value }))}
                                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        >
                                            <option value="FLASH_SALE">Flash Sale (20% OFF)</option>
                                            <option value="HARVEST_READY">Harvest Ready Alert</option>
                                            <option value="REFILL_REMINDER">Refill Reminder</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Target</label>
                                        <select 
                                            value={campaignState.selectedCustomerId}
                                            onChange={e => setCampaignState(prev => ({ ...prev, selectedCustomerId: e.target.value }))}
                                            className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        >
                                            <option value="">Choose a customer...</option>
                                            {customers.filter(c => c.marketing_consent).map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                                            ))}
                                            {customers.filter(c => c.marketing_consent).length === 0 && <option disabled>No customers with consent</option>}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateCampaign}
                                    disabled={!campaignState.selectedCustomerId || campaignState.isGenerating || botStatus !== 'Online'}
                                    className={`w-full py-5 rounded-[2rem] font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${
                                        !campaignState.selectedCustomerId || botStatus !== 'Online' 
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                            : 'bg-indigo-600 text-white shadow-indigo-900/20 hover:scale-[1.02] active:scale-95'
                                    }`}
                                >
                                    {campaignState.isGenerating ? (
                                        <>Generating with AI...</>
                                    ) : (
                                        <>
                                            <Sparkles size={18} /> 
                                            {botStatus === 'Online' ? 'GENERATE PERSONALIZED CAMPAIGN' : 'BOT DISCONNECTED'}
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-300 transition-all group flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Zap size={32} />
                                    </div>
                                    <h4 className="font-black text-slate-800 mb-2">Harvest Ready Poster</h4>
                                    <p className="text-xs text-slate-500 font-bold mb-6">Auto-generate a creative poster for today's harvested microgreens.</p>
                                    <button
                                        onClick={() => setShowPosterModal(true)}
                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 hover:scale-95 transition-all"
                                    >
                                        GENERATE POSTER
                                    </button>
                                </div>

                                <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl hover:border-indigo-300 transition-all group flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ArrowUpRight size={32} />
                                    </div>
                                    <h4 className="font-black text-slate-800 mb-2">Social Media Caption</h4>
                                    <p className="text-xs text-slate-500 font-bold mb-6">AI-generated captions for Instagram & WhatsApp Status.</p>
                                    <button
                                        onClick={generateCaption}
                                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:scale-95 transition-all"
                                    >
                                        WRITE CAPTION
                                    </button>
                                </div>

                                <div className="md:col-span-2 p-8 bg-indigo-900 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <CloudLightning size={120} className="text-white" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Enterprise Feature</div>
                                            <h4 className="text-2xl font-black text-white">AI Cloud Broadcast</h4>
                                        </div>
                                        <p className="text-indigo-200 font-medium text-sm mb-8 max-w-md">
                                            Automatically notify all customers with **Marketing Consent** enabled about today's fresh harvest via WhatsApp Bot (Free, no Twilio needed).
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <button
                                                onClick={async () => {
                                                    const targets = customers.filter(c => c.marketing_consent === true);
                                                    if (targets.length === 0) {
                                                        alert("No customers found with 'Enable WhatsApp Automation Alerts' checked.");
                                                        return;
                                                    }
                                                    if (window.confirm(`Broadcast harvest alert to all ${targets.length} active customers?`)) {
                                                        alert(`🚀 Initiating Cloud Broadcast to ${targets.length} customers...`);
                                                        for (const c of targets.slice(0, 3)) { // Limit for safety
                                                            await sendCloudMessage(c, { date: 'Today', time: 'Immediate' }, 'HARVEST_BROADCAST');
                                                        }
                                                    }
                                                }}
                                                className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-black text-xs hover:bg-emerald-400 hover:text-white transition-all"
                                            >
                                                START BROADCAST
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'lab' && <SalesLab />}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h5 className="text-slate-900 font-black text-xs uppercase tracking-[0.2em] mb-6">Targeted Campaign Blasts</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button
                            onClick={async () => {
                                const targets = customers.filter(c => c.marketing_consent === true);
                                if (targets.length === 0) {
                                    alert("No customers found with marketing consent.");
                                    return;
                                }
                                if (window.confirm(`Send Flash Sale (10% OFF) to ${targets.length} customers?`)) {
                                    alert("🚀 Sending Flash Sale Blasts...");
                                    for (const c of targets.slice(0, 3)) {
                                        await sendCloudMessage(c, {
                                            date: 'FLASH SALE',
                                            time: '10% OFF',
                                            customBody: `🚀 FLASH SALE: Get 10% OFF on all microgreens today! Order now to clear our fresh overstock. 🌿`
                                        }, 'FLASH_SALE');
                                    }
                                    alert("✅ Flash Sale Sent!");
                                }
                            }}
                            className="p-6 bg-slate-900 border border-white/10 rounded-3xl hover:bg-black transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <DollarSign size={20} />
                            </div>
                            <p className="text-white font-black text-sm mb-1">Flash Sale</p>
                            <p className="text-indigo-300 text-[10px] font-bold">10% Off Overstock</p>
                        </button>

                        <button
                            onClick={async () => {
                                const elites = customers.filter(c => {
                                    const cons = predictConsumption(c, orders);
                                    return cons.loyaltyTier === 'Elite' && c.marketing_consent;
                                });
                                if (elites.length === 0) {
                                    alert("No Elite customers found with marketing consent.");
                                    return;
                                }
                                if (window.confirm(`Send Early Access Reward to ${elites.length} Elite customers?`)) {
                                    alert("🚀 Sending Elite Rewards...");
                                    for (const c of elites.slice(0, 3)) {
                                        await sendCloudMessage(c, {
                                            date: 'LOYALTY REWARD',
                                            time: 'Early Access',
                                            customBody: `✨ Hello ${c.name}! As an Elite member, you've unlocked EARLY ACCESS to our premium harvest rewards. Check your app for details!`
                                        }, 'LOYALTY_REWARD');
                                    }
                                    alert("✅ Loyalty Rewards Sent!");
                                }
                            }}
                            className="p-6 bg-slate-900 border border-white/10 rounded-3xl hover:bg-black transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles size={20} />
                            </div>
                            <p className="text-white font-black text-sm mb-1">Elite Loyalty</p>
                            <p className="text-indigo-300 text-[10px] font-bold">Exclusive B2B Perks</p>
                        </button>

                        <button
                            onClick={async () => {
                                const targets = customers.filter(c => c.marketing_consent === true);
                                if (targets.length === 0) {
                                    alert("No customers found with marketing consent.");
                                    return;
                                }
                                if (window.confirm(`Send Batch Trust Health Report to ${targets.length} customers?`)) {
                                    alert("🚀 Sending Trust Alerts...");
                                    const healthInfo = `Health: 98% | VPD: ${(weatherData.temp * 0.1).toFixed(1)}`;
                                    for (const c of targets.slice(0, 3)) {
                                        await sendCloudMessage(c, {
                                            date: 'TRUST REPORT',
                                            time: healthInfo,
                                            customBody: `🛡️ BATCH TRUST: Our latest harvest metadata is out! ${healthInfo}. Grown with 100% precision for your safety.`
                                        }, 'TRUST_ALERT');
                                    }
                                    alert("✅ Trust Reports Sent!");
                                }
                            }}
                            className="p-6 bg-slate-900 border border-white/10 rounded-3xl hover:bg-black transition-all text-left group"
                        >
                            <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <CheckCircle2 size={20} />
                            </div>
                            <p className="text-white font-black text-sm mb-1">Batch Trust</p>
                            <p className="text-indigo-300 text-[10px] font-bold">Live Health Metadata</p>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Market Intelligence */}
            < div className="space-y-6" >
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-400" /> Market Intelligence
                    </h3>
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Selling Crop</p>
                            <div className="flex justify-between items-center">
                                <span className="font-black text-emerald-400">Radish Microgreens</span>
                                <span className="text-xs font-bold text-slate-400">42 Trays/mo</span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Wholesale Rate</p>
                            <div className="flex justify-between items-center">
                                <span className="font-black text-blue-400">₹140/Tray</span>
                                <span className="text-xs font-bold text-emerald-400">+5% vs Last Week</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                    <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
                        <Share2 size={20} /> Network
                    </h3>
                    <p className="text-xs font-bold text-indigo-700 leading-relaxed mb-6">
                        Connect with 14 local restaurants who are currently buying microgreens in your 10km radius.
                    </p>
                    <button
                        onClick={() => setShowLocalBuyers(true)}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                    >
                        <Users size={18} /> VIEW LOCAL BUYERS
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAddCustomer && (
                <AddCustomerModal
                    onClose={() => setShowAddCustomer(false)}
                    onSubmit={(data) => addCustomerMutation.mutate(data)}
                    onBulkSubmit={(data) => bulkAddCustomerMutation.mutate(data)}
                    isLoading={addCustomerMutation.isLoading || bulkAddCustomerMutation.isLoading}
                />
            )}

            {showAddOrder && (
                <AddOrderModal
                    customers={customers}
                    loadingCustomers={loadingCustomers}
                    onClose={() => setShowAddOrder(false)}
                    onSubmit={(data) => addOrderMutation.mutate(data)}
                    isLoading={addOrderMutation.isLoading}
                />
            )}

            {showLocalBuyers && (
                <LocalBuyersModal onClose={() => setShowLocalBuyers(false)} />
            )}

            {showEnrollModal && (
                <EnrollChainModal
                    customers={customers}
                    loadingCustomers={loadingCustomers}
                    onClose={() => setShowEnrollModal(false)}
                    onSubmit={(data) => {
                        const customer = customers.find(c => c.id === data.customerId);
                        enrollInChainMutation.mutate({ customer, chainType: data.chainType });
                        setShowEnrollModal(false);
                    }}
                    isLoading={enrollInChainMutation.isLoading}
                />
            )}

            {showPosterModal && (
                <MarketingPreviewModal
                    onClose={() => setShowPosterModal(false)}
                />
            )}

            {showCaptionModal && (
                <CaptionPreviewModal
                    caption={generatedCaption}
                    onClose={() => setShowCaptionModal(false)}
                />
            )}

            {campaignState.showPreview && (
                <AICampaignPreviewModal 
                    message={campaignState.generatedMsg}
                    onClose={() => setCampaignState(prev => ({ ...prev, showPreview: false }))}
                    onSend={handleSendCampaign}
                    isSending={campaignState.isGenerating}
                />
            )}
        </div>
    );
};

const MarketingPreviewModal = ({ onClose }) => {
    // Ultra-premium, vibrant microgreens context
    const posterImageUrl = 'https://images.unsplash.com/photo-1533630669439-02104554f3f4?q=80&w=1200&auto=format&fit=crop';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin)}`;
    const posterRef = useRef();

    const handleDownload = async () => {
        if (!posterRef.current) return;
        try {
            const canvas = await html2canvas(posterRef.current, {
                useCORS: true,
                scale: 3, // High quality
                backgroundColor: '#020617'
            });
            const image = canvas.toDataURL("image/jpeg", 0.95);
            const link = document.createElement('a');
            link.href = image;
            link.download = `cGrow_Premium_Poster_${new Date().getTime()}.jpg`;
            link.click();
        } catch (err) {
            console.error("Poster Generation Error:", err);
            alert("Export failed. Please try again or use standard screenshot.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 sm:p-10 shadow-3xl animate-in fade-in zoom-in duration-500 max-h-[98vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Full Poster Hub</h3>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">Marketing Asset v2.0</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all hover:scale-110">
                        <X size={28} className="text-slate-400" />
                    </button>
                </div>

                {/* The actual poster component that will be printed/saved */}
                <div
                    ref={posterRef}
                    className="min-h-[550px] sm:min-h-[700px] w-full bg-slate-950 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border-[1px] border-white/10"
                >
                    {/* Ultra Dynamic Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={posterImageUrl}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-100"
                            crossOrigin="anonymous"
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Top Branding Section */}
                        <div className="pt-2 sm:pt-4 mb-8 sm:mb-12">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Zap size={28} className="text-white fill-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tighter leading-none">cGrow Labs</h3>
                                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">GROWN IN TECH LABS</p>
                                </div>
                            </div>

                            <h2 className="text-4xl sm:text-6xl font-black leading-[1.1] mb-8 tracking-tighter">
                                NATURE'S<br />
                                <span className="text-emerald-400">PUREST.</span>
                            </h2>

                            <div className="inline-flex items-center gap-3 py-1.5 px-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                <p className="text-white font-black uppercase tracking-[0.2em] text-[10px]">100% Organic & Fresh</p>
                            </div>
                        </div>

                        {/* Middle Stats Section */}
                        <div className="grid grid-cols-2 gap-4 mb-10 sm:mb-16">
                            <div className="p-5 bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-white/10 flex flex-col justify-center">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Purity Score</p>
                                <p className="text-2xl font-black text-emerald-400">99.9%</p>
                                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 w-[99%]"></div>
                                </div>
                            </div>
                            <div className="p-5 bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-white/10 flex flex-col justify-center">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Planet Saved</p>
                                <p className="text-2xl font-black text-blue-400">-90%</p>
                                <p className="text-[8px] text-white/30 font-bold uppercase mt-1">Water Efficient</p>
                            </div>
                        </div>

                        {/* Bottom Footer Section */}
                        <div className="mt-auto pt-8 border-t border-white/10 pb-2 sm:pb-4">
                            <div className="flex justify-between items-center gap-4">
                                <div className="max-w-[60%]">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-2">Order Fresh Now</p>
                                    <p className="text-sm font-bold text-white/70 leading-snug italic">"Sustainable high-tech nutrition is finally here."</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="p-2 sm:p-3 bg-white rounded-3xl inline-block shadow-2xl">
                                        <img src={qrUrl} alt="QR Code" className="w-16 h-16 sm:w-20 sm:h-20" crossOrigin="anonymous" />
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mt-3">SCAN TO ORDER</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
                    <button
                        onClick={handleDownload}
                        className="py-4 sm:py-6 bg-slate-900 text-white rounded-[1.5rem] sm:rounded-[2.2rem] font-black text-xs sm:text-sm hover:bg-black transition-all flex items-center justify-center gap-3 shadow-2xl hover:-translate-y-1 active:scale-95"
                    >
                        <Download size={18} /> DOWNLOAD
                    </button>
                    <button
                        onClick={() => window.open(`https://wa.me/?text=Check out today's premium harvest! 🌱 %0A%0AOrder here: ${window.location.host}`, '_blank')}
                        className="py-4 sm:py-6 bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-[2.2rem] font-black text-xs sm:text-sm shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                    >
                        <Share2 size={18} /> POST ON WA
                    </button>
                </div>

                <div className="mt-8 p-6 bg-emerald-50 rounded-[2.2rem] border border-emerald-100 flex items-start gap-4 shadow-inner">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-[13px] text-emerald-800 font-black mb-1">Ultra-HD Image Export</p>
                        <p className="text-[12px] text-emerald-600 font-bold leading-tight">
                            Ab "Download" karne par poora poster ek quality JPEG file ki tarah save hoga. Screenshot lene ki zaroorat nahi hai.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CaptionPreviewModal = ({ caption, onClose }) => (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">AI Copywriter</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-700 font-medium leading-relaxed">
                "{caption}"
            </div>
            <div className="flex gap-4 mt-8">
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(caption);
                        alert("Caption copied to clipboard!");
                    }}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    <ArrowUpRight size={18} /> COPY CAPTION
                </button>
            </div>
        </div>
    </div>
);

const EnrollChainModal = ({ customers, loadingCustomers, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        chainType: 'HARVEST_ALERT'
    });

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Start New Sequence</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">Enroll Customer in Automation</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Customer</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                                value={formData.customerId}
                                onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                            >
                                <option value="">{loadingCustomers ? 'Loading customers...' : 'Select a customer...'}</option>
                                {customers.length > 0 ? (
                                    customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)
                                ) : (
                                    !loadingCustomers && <option disabled>No customers found. Add one first!</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Sequence Type</label>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { id: 'HARVEST_ALERT', label: 'Harvest Ready Alert', icon: Megaphone, color: 'bg-indigo-50 text-indigo-600' },
                                { id: 'ORDER_RETENTION', label: 'Order Retention (Coming Soon)', icon: ShoppingBag, color: 'bg-orange-50 text-orange-400', disabled: true }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    disabled={type.disabled}
                                    onClick={() => setFormData({ ...formData, chainType: type.id })}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${formData.chainType === type.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 hover:border-slate-100'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.color}`}>
                                        <type.icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-800 text-sm uppercase tracking-wider">{type.label}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">3-Step WhatsApp Sequence</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">CANCEL</button>
                        <button disabled={isLoading || !formData.customerId} type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'ENROLLING...' : <><Zap size={18} /> START SEQUENCE</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddCustomerModal = ({ onClose, onSubmit, onBulkSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        name: '',
        whatsapp_number: '',
        phone: '',
        email: '',
        type: 'Retail',
        location: '',
        notes: '',
        marketing_consent: false
    });

    const fileInputRef = useRef(null);

    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            if (lines.length < 2) return;

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const results = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',');
                const customer = {};
                headers.forEach((header, index) => {
                    const value = values[index]?.trim();
                    if (header === 'name') customer.name = value;
                    if (header === 'whatsapp' || header === 'phone') customer.whatsapp_number = value;
                    if (header === 'type') customer.type = value || 'Retail';
                    if (header === 'email') customer.email = value;
                });
                return customer;
            });

            if (results.length > 0) {
                if (window.confirm(`Found ${results.length} customers in CSV. Import them to CRM?`)) {
                    onBulkSubmit(results);
                }
            }
        };
        reader.readAsText(file);
    };

    const handleContactPicker = async () => {
        if (!navigator.contacts || !navigator.contacts.select) {
            alert("Contact Picker API is not supported on this browser/device. Try Bulk CSV Import instead.");
            return;
        }

        try {
            const props = ['name', 'tel'];
            const opts = { multiple: false };
            const contacts = await navigator.contacts.select(props, opts);

            if (contacts && contacts.length > 0) {
                const contact = contacts[0];
                setFormData({
                    ...formData,
                    name: contact.name?.[0] || '',
                    whatsapp_number: contact.tel?.[0]?.replace(/[^\d+]/g, '') || ''
                });
            }
        } catch (err) {
            console.error("Contact Picker Error:", err);
            if (err.name !== 'AbortError') {
                alert("Could not access contacts. Please enter manually.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Add New Customer</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">CRM Entry Profile</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {('contacts' in navigator && 'select' in navigator.contacts) && (
                        <div className="flex-1">
                            <button
                                type="button"
                                onClick={handleContactPicker}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 font-black text-[10px] hover:bg-indigo-100 transition-all uppercase tracking-widest"
                            >
                                <Contact size={16} /> Select from Phone
                            </button>
                            <p className="text-[7px] text-slate-400 font-bold uppercase mt-1 text-center">Mobile/Chrome Only</p>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-black text-[10px] hover:bg-emerald-100 transition-all uppercase tracking-widest"
                    >
                        <FilePlus size={16} /> Bulk CSV Import
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCSVUpload}
                        accept=".csv"
                        className="hidden"
                    />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Customer Name</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">WhatsApp Number</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                                <input required placeholder="+91..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.whatsapp_number} onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Category Type</label>
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            {['Retail', 'Wholesale', 'Restaurant'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${formData.type === type ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                                checked={formData.marketing_consent}
                                onChange={e => setFormData({ ...formData, marketing_consent: e.target.checked })}
                            />
                            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Enable WhatsApp Automation Alerts</span>
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">CANCEL</button>
                        <button disabled={isLoading} type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'SAVING...' : <><Save size={18} /> SAVE CUSTOMER</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddOrderModal = ({ customers, loadingCustomers, onClose, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        customer_id: '',
        product_name: '',
        quantity: '',
        unit: 'trays',
        total_price: '',
        status: 'Pending'
    });

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Create New Order</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">Sales Ledger Entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Customer</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold appearance-none"
                                value={formData.customer_id}
                                onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                            >
                                <option value="">{loadingCustomers ? 'Loading customers...' : 'Select a customer...'}</option>
                                {customers.length > 0 ? (
                                    customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)
                                ) : (
                                    !loadingCustomers && <option disabled>No customers found. Add one first!</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Product Details</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input required placeholder="e.g. Radish Microgreens" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Quantity</label>
                            <input type="number" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Total Amount (₹)</label>
                            <input type="number" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={formData.total_price} onChange={e => setFormData({ ...formData, total_price: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">CANCEL</button>
                        <button disabled={isLoading} type="submit" className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            {isLoading ? 'PROCESSING...' : <><ShoppingBag size={18} /> CONFIRM ORDER</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LocalBuyersModal = ({ onClose }) => {
    const localBuyers = [
        { name: 'The Green Cafe', type: 'Cafe / Deli', distance: '1.2 km', demand: '2-3 kg / week', rating: 4.8 },
        { name: 'Organic Bistro', type: 'Fine Dining', distance: '3.5 km', demand: '5-7 kg / week', rating: 4.9 },
        { name: 'Hotel Vivanta (Gourmet Kitchen)', type: 'Hotel', distance: '6.0 km', demand: '10+ kg / week', rating: 5.0 },
        { name: 'Natures Basket (Branch)', type: 'Retail Store', distance: '2.8 km', demand: 'Daily Supply', rating: 4.7 },
        { name: 'Zesto Healthy Meals', type: 'Cloud Kitchen', distance: '4.1 km', demand: '4 kg / week', rating: 4.6 }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Local Market Opportunities</h2>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">Identified potential buyers in your 10km radius</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {localBuyers.map((buyer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                    {buyer.name[0]}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900">{buyer.name}</p>
                                    <div className="flex gap-3 mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        <span className="flex items-center gap-1"><MapPin size={10} /> {buyer.distance}</span>
                                        <span className="flex items-center gap-1"><Tag size={10} /> {buyer.type}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">{buyer.demand}</p>
                                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                                    PITCH NOW
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-indigo-600 rounded-[2rem] text-white">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black mb-1">Sales Strategy Tip:</p>
                            <p className="text-xs font-medium text-indigo-100 leading-relaxed">
                                Most cloud kitchens prefer high-frequency, low-volume deliveries. Approach them with a **Weekly Subscription Plan** for consistent revenue.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Sales Psychology Lab Component ---
const SalesLab = () => {
    const [scenario, setScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const SCENARIOS = [
        {
            id: 'chef',
            name: 'Chef Ravi',
            role: 'Executive Chef, 5-Star Hotel',
            personality: 'Price-conscious but quality-obsessed. Hates inconsistency.',
            avatar: '👨‍🍳',
            intro: 'Listen, I like the color of your radish greens, but your price is 3x what I pay for traditional garnishes. Why should I switch?',
            triggers: ['quality', 'flavor', 'yield', 'organic', 'freshness'],
            antiTriggers: ['discount', 'cheap', 'cheaply', 'standard'],
            goalValue: 'Value Proposition & Menu Premium-ness'
        },
        {
            id: 'retailer',
            name: 'Mrs. Sharma',
            role: 'Owner, Organic Boutique',
            personality: 'Cares about sourcing, packaging, and health benefits. Wants a story.',
            avatar: '👩‍💼',
            intro: 'My customers are very picky. They want to know exactly where this is grown and if it truly has more nutrients than regular spinach.',
            triggers: ['nutrition', 'local', 'pesticide-free', 'story', 'family'],
            antiTriggers: ['bulk', 'industrial', 'processed'],
            goalValue: 'Trust & Emotional Connection'
        },
        {
            id: 'wholesaler',
            name: 'Mr. Gupta',
            role: 'Wholesale Distributor',
            personality: 'Interested in scale, consistency, and data. No time for fluff.',
            avatar: '👨‍💼',
            intro: 'I need 50kg a week, every week. Can you promise that? What happens if your sensor fails? I can\'t have my supply line drying up.',
            triggers: ['consistency', 'iot', 'sensors', 'scalability', 'redundancy'],
            antiTriggers: ['hope', 'try', 'maybe', 'startup'],
            goalValue: 'Reliability & Technical Proof'
        }
    ];

    const startScenario = (s) => {
        setScenario(s);
        setMessages([{ role: 'bot', text: s.intro }]);
        setScore(20);
        setFeedback('Pitch has started. Be careful with your words!');
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', text: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsThinking(true);

        // Simulated AI Logic
        setTimeout(() => {
            let reply = '';
            let scoreChange = 0;
            const text = input.toLowerCase();

            // Keyword Scoring
            scenario.triggers.forEach(t => {
                if (text.includes(t)) scoreChange += 15;
            });
            scenario.antiTriggers.forEach(t => {
                if (text.includes(t)) scoreChange -= 10;
            });

            // Advanced Heuristic Intelligence (Deep Contextual Simulation)
            const randomVariations = {
                chef: [
                    "You're making some sense, but I've heard this before. How's the shelf life?",
                    "Interesting... If the yield is that high, my food cost might actually drop. Show me more.",
                    "Look, I'm busy. Is this just another 'organic' buzzword or do you have data?"
                ],
                retailer: [
                    "My customers value the human element. Is this a family-run operation?",
                    "The nutrition is great, but how is the packaging? It needs to pop on the shelf.",
                    "Tell me about your sustainability. Do you use recycled water?"
                ],
                wholesaler: [
                    "IoT is fine, but what's your backup plan if the grid goes down?",
                    "Can you scale to 200kg if I sign a vendor agreement tomorrow?",
                    "Consistency is currency. Don't promise what you can't deliver."
                ]
            };

            if (scenario.id === 'chef') {
                if (text.includes('shelf') || text.includes('last') || text.includes('waste')) {
                    reply = "Ah, shelf life! That's where I lose money. If your greens stay crisp for 10 days, you've got my attention.";
                    scoreChange += 20;
                } else if (text.includes('price') || text.includes('cost')) {
                    reply = "Price is just a number if the value is there. But don't expect me to pay premium for average leaves.";
                    scoreChange += 5;
                } else {
                    reply = randomVariations.chef[Math.floor(Math.random() * randomVariations.chef.length)];
                }
            } else if (scenario.id === 'retailer') {
                if (text.includes('packaging') || text.includes('look') || text.includes('shelf')) {
                    reply = "Visuals are everything! If it looks premium, my boutique clients will buy it regardless of price.";
                    scoreChange += 15;
                } else if (text.includes('family') || text.includes('local') || text.includes('story')) {
                    reply = "Exactly! People buy from people. I want to tell your story to my customers.";
                    scoreChange += 20;
                } else {
                    reply = randomVariations.retailer[Math.floor(Math.random() * randomVariations.retailer.length)];
                }
            } else {
                if (text.includes('iot') || text.includes('data') || text.includes('sensors')) {
                    reply = "Now we're talking. Tech-backed farming is the only way to ensure the volumes I need.";
                    scoreChange += 25;
                } else if (text.includes('backup') || text.includes('redundancy') || text.includes('fail')) {
                    reply = "Redundancy is key. If you have a backup system, you're a serious partner.";
                    scoreChange += 15;
                } else {
                    reply = randomVariations.wholesaler[Math.floor(Math.random() * randomVariations.wholesaler.length)];
                }
            }

            const finalScore = Math.min(100, Math.max(0, score + scoreChange));
            setScore(finalScore);
            setMessages([...newMessages, { role: 'bot', text: reply || "Hmm, tell me more about that." }]);
            setIsThinking(false);

            if (finalScore >= 80) setFeedback("Excellent! You've almost closed the deal.");
            else if (finalScore >= 50) setFeedback("You're building rapport, but need more punch.");
            else setFeedback("The client is losing interest. Pivot your strategy!");

        }, 1500);
    };

    if (!scenario) {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-rose-100">
                        <Users size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-4">Sales Psychology Lab</h3>
                    <p className="text-slate-500 font-medium">Practice your negotiation skills with AI-driven character scenarios. Learn to overcome objections and close more deals. 🧠🌱</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SCENARIOS.map(s => (
                        <button
                            key={s.id}
                            onClick={() => startScenario(s)}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-all text-left flex flex-col group"
                        >
                            <span className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">{s.avatar}</span>
                            <h4 className="text-xl font-black text-slate-800 mb-1">{s.name}</h4>
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-4">{s.role}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 flex-1">{s.personality}</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Focus: {s.goalValue}</span>
                                <ArrowUpRight size={20} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 animate-in zoom-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Character Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
                        <button onClick={() => setScenario(null)} className="mb-4 text-[10px] font-black text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                            <X size={14} /> Exit Lab
                        </button>
                        <div className="text-6xl mb-4">{scenario.avatar}</div>
                        <h4 className="text-xl font-black text-slate-800">{scenario.name}</h4>
                        <p className="text-[10px] font-black text-rose-600 uppercase mb-4">{scenario.role}</p>
                        <div className="p-4 bg-slate-50 rounded-2xl text-[10px] text-slate-500 font-bold leading-relaxed">
                            "{scenario.personality}"
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 text-center">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Psychology Score</p>
                            <div className="text-5xl font-black text-white mb-2">{score}%</div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${score}%` }} />
                            </div>
                            <p className="text-[9px] font-bold text-rose-200 leading-tight italic">
                                {feedback}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-3 flex flex-col h-[600px] bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-${m.role === 'user' ? 'right' : 'left'}-4`}>
                                <div className={`max-w-[80%] p-6 rounded-3xl font-bold text-sm ${m.role === 'user' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-700 shadow-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 p-4 rounded-2xl flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                        <input
                            type="text"
                            placeholder="Type your sales pitch here..."
                            className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 font-bold shadow-sm"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-rose-600 transition-all"
                        >
                            SEND
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AICampaignPreviewModal = ({ message, onClose, onSend, isSending }) => {
    const [editableMsg, setEditableMsg] = useState(message);
    useEffect(() => setEditableMsg(message), [message]);

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800">AI Campaign Preview</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <textarea 
                    className="w-full h-48 p-6 bg-slate-50 rounded-3xl border border-slate-100 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editableMsg}
                    onChange={e => setEditableMsg(e.target.value)}
                />
                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm">CANCEL</button>
                    <button 
                        onClick={() => onSend(editableMsg)}
                        disabled={isSending}
                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><MessageCircle size={18} /> SEND ON WHATSAPP</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesMarketingPage;
