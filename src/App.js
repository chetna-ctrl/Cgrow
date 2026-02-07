import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { FarmProvider } from './context/FarmContext';
import { BeginnerModeProvider } from './context/BeginnerModeContext';
import { Sprout } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize Query Client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - don't refetch if data is fresh
      cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // PERFORMANCE: Don't refetch on tab switch
      refetchOnReconnect: false, // PERFORMANCE: Don't refetch on reconnect
    },
  },
});

// LAZY LOADING
const LandingPage = React.lazy(() => import('./features/landing/LandingPage'));
const DashboardHome = React.lazy(() => import('./features/dashboard/DashboardHome'));
const FieldsPage = React.lazy(() => import('./features/fields/FieldsPage'));
const WeatherPage = React.lazy(() => import('./features/weather/WeatherPage'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'));
const LoginPage = React.lazy(() => import('./features/auth/LoginPage'));
const FinancePage = React.lazy(() => import('./features/finance/FinancePage'));
const MarketPage = React.lazy(() => import('./features/market/MarketPage'));
const MicrogreensPage = React.lazy(() => import('./features/microgreens/MicrogreensPage'));
const HydroponicsPage = React.lazy(() => import('./features/hydroponics/HydroponicsPage'));
const AgronomyPage = React.lazy(() => import('./features/agronomy/AgronomyPage'));
const DailyTrackerPage = React.lazy(() => import('./features/tracker/DailyTrackerPage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage')); // PHASE 2
const SchedulerPage = React.lazy(() => import('./pages/SchedulerPage')); // PHASE 3
const FarmingGuidePage = React.lazy(() => import('./features/guide/FarmingGuidePage'));
const IoTDevicesPage = React.lazy(() => import('./features/iot/IoTDevicesPage')); // IoT Hybrid System


// LOADING SPINNER
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px]">
    <div className="animate-spin text-emerald-500 mb-4">
      <Sprout size={48} />
    </div>
    <p className="text-slate-400 text-sm font-medium animate-pulse">Loading cGrow...</p>
  </div>
);

// PROTECTED ROUTE COMPONENT
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session with safety timeout
    const authTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out. Proceeding to app...");
        setLoading(false);
      }
    }, 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(err => {
        console.error("Auth error:", err);
      })
      .finally(() => {
        clearTimeout(authTimeout);
        setLoading(false);
      });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <LoadingFallback />;

  return (
    <QueryClientProvider client={queryClient}>
      <BeginnerModeProvider>
        <FarmProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={
                !session ? (
                  <Suspense fallback={<LoadingFallback />}>
                    <LandingPage />
                  </Suspense>
                ) : <Navigate to="/dashboard" replace />
              } />

              <Route path="/login" element={
                !session ? (
                  <Suspense fallback={<LoadingFallback />}>
                    <LoginPage />
                  </Suspense>
                ) : <Navigate to="/dashboard" replace />
              } />

              <Route path="/*" element={
                <ProtectedRoute session={session}>
                  <DashboardLayout onLogout={() => supabase.auth.signOut()}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardHome />} />
                        <Route path="/tracker" element={<DailyTrackerPage />} />
                        <Route path="/fields" element={<FieldsPage />} />
                        <Route path="/finance" element={<FinancePage />} />
                        <Route path="/market" element={<MarketPage />} />
                        <Route path="/microgreens" element={<MicrogreensPage />} />
                        <Route path="/hydroponics" element={<HydroponicsPage />} />
                        <Route path="/agronomy" element={<AgronomyPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/scheduler" element={<SchedulerPage />} />
                        <Route path="/guide" element={<FarmingGuidePage />} />
                        <Route path="/iot-devices" element={<IoTDevicesPage />} />
                        <Route path="/weather" element={<WeatherPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </Suspense>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </FarmProvider>
      </BeginnerModeProvider>
    </QueryClientProvider>
  );
}

export default App;
