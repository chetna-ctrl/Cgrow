import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { FarmProvider } from './context/FarmContext';
import { BeginnerModeProvider } from './context/BeginnerModeContext';
import { Sprout } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
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

// LAZY LOADING - CORE
const LandingPage = React.lazy(() => import('./features/landing/LandingPage'));
const LoginPage = React.lazy(() => import('./features/auth/LoginPage'));
const DashboardHome = React.lazy(() => import('./features/dashboard/DashboardHome'));
const SettingsPage = React.lazy(() => import('./features/settings/SettingsPage'));

// CONSOLIDATED HUBS
const OperationsHub = React.lazy(() => import('./features/operations/OperationsHub'));
const BusinessHub = React.lazy(() => import('./features/business/BusinessHub'));
const TechHub = React.lazy(() => import('./features/tech/TechHub'));

// BUILD VERSION (Diagnostic)
window.CGROW_BUILD = "2026-02-25-infra-resilience";
console.log(`%c[cGrow Ops] Initializing Build: ${window.CGROW_BUILD}`, "color: #10b981; font-weight: bold;");

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px]">
    <div className="animate-spin text-emerald-500 mb-4">
      <Sprout size={48} />
    </div>
    <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Agri-OS...</p>
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
    // 1. STABILITY FIRST: Generous 10s timeout for everyone.
    // This ensures mobile/slow networks strictly have enough time to verify session.
    // Fast networks will still load instantly (as checkSession clears this).
    // Fast networks will still load instantly (as checkSession clears this).
    const authTimeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth check slow (5s safety). Continuing with public view...");
        setLoading(false);
      }
    }, 5000);

    // Initial check
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        console.log("Auth Initialized:", session ? `User: ${session.user.email}` : "No Session");
        setSession(session);
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        clearTimeout(authTimeout);
        setLoading(false);
      }
    };

    checkSession();

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth Event: ${event}`, session ? `User: ${session.user.email}` : "No Session");
      setSession(session);

      // Safety: if session is lost, clear any stale data
      if (!session && event === 'SIGNED_OUT') {
        queryClient.clear();
      }
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
          <GlobalErrorBoundary>
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

                          {/* CONSOLIDATED HUBS */}
                          <Route path="/ops/*" element={<OperationsHub />} />
                          <Route path="/business/*" element={<BusinessHub />} />
                          <Route path="/tech/*" element={<TechHub />} />

                          {/* GLOBAL SETTINGS */}
                          <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Router>
          </GlobalErrorBoundary>
        </FarmProvider>
      </BeginnerModeProvider>
    </QueryClientProvider>
  );
}

export default App;
