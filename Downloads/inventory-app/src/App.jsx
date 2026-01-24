// ============================================
// MAIN APP COMPONENT WITH ROUTING
// ============================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductsPage from './pages/ProductsPage';
import PartnersPage from './pages/PartnersPage';
import InventoryPage from './pages/InventoryPage';
import DispatchPage from './pages/DispatchPage';
import DamagesPage from './pages/DamagesPage';
import ReportsPage from './pages/ReportsPage';

// Partner Pages
import PartnerDashboard from './pages/PartnerDashboard';
import MyStockPage from './pages/MyStockPage';
import RecordSalePage from './pages/RecordSalePage';
import MyRequestsPage from './pages/MyRequestsPage';
import ReportDamagePage from './pages/ReportDamagePage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentRole, isLoggedIn, ROLES } = useApp();
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

// Dashboard Router - renders correct dashboard based on role
const DashboardRouter = () => {
  const { currentRole, ROLES } = useApp();
  
  if (currentRole === ROLES.PARTNER) {
    return <PartnerDashboard />;
  }
  
  return <AdminDashboard />;
};

function App() {
  const { isLoggedIn, currentRole, ROLES } = useApp();
  
  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      
      {/* Dashboard - available to all roles */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      
      {/* Admin/Manufacturer Routes */}
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANUFACTURER]}>
            <ProductsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/partners"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANUFACTURER]}>
            <PartnersPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/inventory"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANUFACTURER]}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dispatch"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANUFACTURER]}>
            <DispatchPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/damages"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANUFACTURER]}>
            <DamagesPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANUFACTURER]}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Partner Routes */}
      <Route
        path="/my-stock"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PARTNER]}>
            <MyStockPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/record-sale"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PARTNER]}>
            <RecordSalePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PARTNER]}>
            <MyRequestsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/report-damage"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PARTNER]}>
            <ReportDamagePage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to dashboard or login */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

export default App;
