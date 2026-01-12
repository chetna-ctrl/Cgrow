import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import FieldsPage from './pages/FieldsPage';
import WeatherPage from './pages/WeatherPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import FinancePage from './pages/FinancePage';
import MarketPage from './pages/MarketPage';
import MicrogreensPage from './pages/MicrogreensPage';
import HydroponicsPage from './pages/HydroponicsPage';
import AgronomyPage from './pages/AgronomyPage';
import DailyTrackerPage from './pages/DailyTrackerPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('agri_os_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('agri_os_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('agri_os_auth');
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />
        } />

        <Route path="/*" element={
          isAuthenticated ? (
            <DashboardLayout onLogout={handleLogout}>
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
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;