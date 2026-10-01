import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentRegistration from './pages/ResidentRegistration';
import Profile from './pages/Profile';

// Super Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CommunityAdminApprovals from './pages/admin/CommunityAdminApprovals';
import CommunityAdminDetails from './pages/admin/CommunityAdminDetails';
import Apartments from './pages/admin/Apartments';

// Community Admin Pages
import CommunityDashboard from './pages/community/CommunityDashboard';
import Households from './pages/community/Households';
import WaterPurchases from './pages/community/WaterPurchases';
import Billing from './pages/community/Billing';
import Invoices from './pages/community/Invoices';
import TariffConfig from './pages/community/TariffConfig';
import CommunityAdminSetup from './pages/community/CommunityAdminSetup';
import Complaints from './pages/community/Complaints';

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import MyBills from './pages/resident/MyBills';
import MyInvoices from './pages/resident/MyInvoices';
import MyComplaints from './pages/resident/MyComplaints';

// Smart Layout Shell
const LayoutShell = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Helper redirect component for home / root route
const HomeRedirect = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutShell>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/resident" element={<ResidentRegistration />} />

            {/* Authenticated Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/community-admins"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <CommunityAdminDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <CommunityAdminApprovals />
                </ProtectedRoute>
              }
            />

            {/* Community Admin Routes */}
            <Route
              path="/community/setup"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <CommunityAdminSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/dashboard"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <CommunityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/apartments"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <Apartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/households"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <Households />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/water-purchases"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <WaterPurchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/tariff-config"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <TariffConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/billing"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/invoices"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/complaints"
              element={
                <ProtectedRoute allowedRoles={['COMMUNITY_ADMIN']}>
                  <Complaints />
                </ProtectedRoute>
              }
            />

            {/* Resident Routes */}
            <Route
              path="/resident/dashboard"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <ResidentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resident/bills"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <MyBills />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resident/invoices"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <MyInvoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resident/complaints"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <MyComplaints />
                </ProtectedRoute>
              }
            />

            {/* Legacy path aliases redirect */}
            <Route path="/dashboard" element={<HomeRedirect />} />
            <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard/community" element={<Navigate to="/community/dashboard" replace />} />
            <Route path="/dashboard/resident" element={<Navigate to="/resident/dashboard" replace />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </LayoutShell>
      </Router>
    </AuthProvider>
  );
}

export default App;
