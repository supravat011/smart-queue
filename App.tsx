import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import UserDashboard from './pages/UserDashboard';
import EnhancedBooking from './pages/EnhancedBooking';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import PredictionsPage from './pages/PredictionsPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage (mock persistence)
  useEffect(() => {
    const storedUser = localStorage.getItem('smartQueueUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('smartQueueUser', JSON.stringify(newUser));
    // Store token for API calls
    if (newUser.token) {
      localStorage.setItem('token', newUser.token);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('smartQueueUser');
    localStorage.removeItem('token');
  };

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={!user ? <AuthPages mode="login" onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!user ? <AuthPages mode="register" onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={user ? <UserDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/booking"
            element={user ? <EnhancedBooking /> : <Navigate to="/login" />}
          />
          <Route
            path="/predictions"
            element={user ? <PredictionsPage /> : <Navigate to="/login" />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/analytics"
            element={user?.role === UserRole.ADMIN ? <AnalyticsPage /> : <Navigate to="/dashboard" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;